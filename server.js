var express = require('express'),
    r = require('rethinkdb'), 
    fs = require('fs'),
    Pusher = require('pusher'),
    bodyParser = require('body-parser'),
    path = require('path'),
    async = require('async');

var app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'images')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//rethinkbd
var connection = null;
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;
});


//Pusher
var pusher = new Pusher({
  appId: '129524',
  key: '49150bc81042dacfac7d',
  secret: '62abcbeb19f142a64291',
  encrypted: true
});
pusher.port = 443;

app.post('/pusher/auth', function(req, res) {
	var socketId = req.body.socket_id;
	var channel = req.body.channel_name;
	var auth = pusher.authenticate(socketId, channel);
	res.send(auth);
});


//node.js server http requests
app.get('/db/:database/:table/:withFields', function(req, res) {
    var database = req.params.database;
    var table = req.params.table;
    var withFields = req.params.withFields;
    if(table!='password'){
    	dbGetTableWithFields(database, table, withFields, function(err, resultat){
    		console.log('titta! '+resultat);
    		res.send(resultat);
    	});
	}else{res.send('error');}
});

function dbGetTableWithFields(database, table, fields, callback){
	withFields=fields.split('+');
	console.log(fields)
	var resultat;
	if(withFields[0]=='all'){
		try {
		r.db(database).table(table).orderBy('index').run(connection, function(err, cursor) {
		    if (err) throw err;
		    cursor.toArray(function(err, result) {
		        if (err) throw err;
		        //res.send(JSON.stringify(result, null, 2));
		        resultat = result;//JSON.stringify(result, null, 2);
		        console.log('Hej: '+resultat)
		        callback(null, resultat);
		    });
		});
		}catch(err){}
	}else{
		try {
		r.db(database).table(table).withFields(withFields).run(connection, function(err, cursor) {
		    if (err) throw err;
		    cursor.toArray(function(err, result) {
		        if (err) throw err;
		        //res.send(JSON.stringify(result, null, 2));
		        resultat = result;//JSON.stringify(result, null, 2);
		        callback(null, resultat);
		    });
		});
		}catch(err){}
	}
	//return resultat; 
	//res.send(resultat);
}

app.get('/delete/:game_nr/:id', function(req, res) {
    var id = req.params.id;
    var game_nr = req.params.game_nr;
	r.db('settrisk').table('games').get(id).delete().run(connection, function(err, cursor){
	    console.log('Splice games table: '+err);
	    if (err) throw err; 
	});
	
	r.dbDrop(game_nr).run(connection, function(err, cursor){
	    console.log('Drop db '+game_nr+': '+err);
	    if (err) throw err;
	    res.send(JSON.stringify(cursor, null, 2));
	});
	
});

//app.get('/add/games/:new_game', function(req, res) {
//    var new_game = eval("("+req.params.new_game+")");
app.post('/addGame', function(req, res) {
	var new_game = req.body.new_game;
	console.log(new_game);
//Create database 'game_1'
	r.dbCreate('game_'+(new_game.index+1)).run(connection, function(err, cursor) {
	    if (err) throw err; 
	    console.log('create db game_'+(new_game.index+1)+': '+err);
		
		r.db('game_'+(new_game.index+1)).tableCreate('byggnader').run(connection, function(err, cursor) {
		    if (err) throw err; 
			console.log('create table: byggnader '+err+' '+JSON.stringify(cursor.config_changes[0].new_val.id, null, 2));

		    //for(var i=0;i<new_game.players.length;i++){
		    new_game.players.forEach( function (player) {
		    
		    	//Create table 'Player1'
				r.db('game_'+(new_game.index+1)).tableCreate(player.name).run(connection, function(err, cursor) {
			    	if (err) throw err; 
			    	console.log('create table: player '+err+' '+JSON.stringify(cursor.config_changes[0].new_val.id, null, 2));
			    	//Insert player start
//			    	setTimeout(function() {
			    	r.db('game_'+(new_game.index+1)).table(player.name).insert([{typer: new_game.typer, resurser: new_game.resurser, player: player, byggnader: new_game.byggnader, byggnads_info: new_game['byggnads-info'], infanteri: new_game.infanteri}]).run(connection, function(err, cursor) {
				    	if (err) throw err; 
				    	console.log('add player settings: '+err+' '+JSON.stringify(cursor.generated_keys[0], null, 2));
				    	
					});
			    	//}, 1000);
				});
			});
			//Append games
				    	r.db('settrisk').table('games').insert(new_game).run(connection, function(err, cursor) {
						    if (err) throw err;
						    console.log('append games: '+err); 
						    console.log(cursor);
				    		//Return
				    		res.send(JSON.stringify(cursor, null, 2));
						});
		});	
	});
});

app.post('/signin', function(req, res) {
	var player = req.body.player;
	var game = req.body.game;
	var id = req.body.id;
	var active = false;
	var players;

	if(player=='Bank'){
		console.log(id);
		r.db('settrisk').table('games').get(id)('players').run(connection, function(err, cursor) {
			if (err) throw err;
			cursor.toArray(function(err, result) {
		        if (err) throw err;
		        players = result;
				
				res.render('bank', {
					game: game,
					id: id,
					players: players
				});
			});
		});
	}else{

		clientUpdater('game_'+game, player, 'private-channel_'+player);
		r.db('game_'+game).table(player).hasFields('player').run(connection, function(err, cursor) {
			if (err) throw err;
			cursor.toArray(function(err, results) {
				if (err) throw err;
				var playerSettings = results[0];//JSON.stringify(results[0], null, 2).toString();

				r.db('game_'+game).table(player).hasFields('player').run(connection, function(err, cursor) {
					if (err) throw err;
					cursor.toArray(function(err, results) {			
						if (err) throw err;
						var playerKorg = results[0];
						var keyarr = Object.keys(playerKorg.resurser);
						for(i in keyarr){playerKorg.resurser[keyarr[i]]=[];}
						var keyarr = Object.keys(playerKorg.infanteri);
						for(i in keyarr){playerKorg.infanteri[keyarr[i]]=[];}
						var keyarr = Object.keys(playerKorg.byggnader);
						for(i in keyarr){playerKorg.byggnader[keyarr[i]]=[];}
						//JSON.stringify(results, null, 2);
						
						dbGetTableWithFields('settrisk', 'priser', 'all', function (err, result) {
							if (err) throw err;
							var priser = result[0];//JSON.stringify(results, null, 2);
							
							r.db('settrisk').table('games').get(id)('players').run(connection, function(err, cursor) {
								if (err) throw err;
								cursor.toArray(function(err, result) {
							        if (err) throw err;
							        players = result;
							        //Om redan true, returnera med index, annars sätt till true.
							        for(i in players){
							        	if(player==players[i]['name'] ){ 
							        		if(players[i]['active']){res.render('index', {message: player+' har redan loggat in!', bool: true});}
							        		active = players[i]['active']; players[i]['active']=true; }
							        }
						    		console.log(player+' cheching if active: '+err+' '+active);
						    		console.log(players);

						    		r.db('game_'+game).table('byggnader').hasFields(player).run(connection, function(err, cursor) {
										if (err) throw err;
										cursor.toArray(function(err, result) {
									        if (err) throw err;
									        playerSettings.byggnads_info = result;
									        var nationer={};
									        for(i in result){if(result[i].nation!=''){nationer[result[i].nation]=false;}}
									        console.log(playerSettings);

								    		if(!active || true){
												active = true;
												r.db('settrisk').table('games').get(id).update({players:players}).run(connection, function(err, cursor) {
													//if (err) throw err;
													console.log(players);
													//plocka bort spelaren ur array och indexa om! 
									    			for(i in players){ if(player==players[i]['name']){ players.splice(i,1); }}
									    			var x=0;
										        	while(x<players.length){players[x]['index']=(x+1); x++;}
											        console.log(player+' is now active! '+err+' '+JSON.stringify(cursor, null, 2));
													res.render('playertest', {
														player: player,
														game: game,
														dintur: false,
														id: id,
														players: players,
														playerSettings: playerSettings,
														playerKorg: playerKorg,
														nationer: nationer,
														priser: priser
													});
												});
											} else {res.render('index', {message: player+' has already signed in!', bool: active});}
										});
									});
							    });
							});
						});
					});
				});
			});
		});
	}
	
});

app.post('/logout', function(req) {
	var playername = req.body.playername;
	var id = req.body.id;
	r.db('settrisk').table('games').get(id)('players').run(connection, function(err, cursor) {
		cursor.toArray(function(err, results) {			
			if (err) throw err;
			console.log(results);
			var players = results;
			for(p in players){if(players[p].name==playername){players[p].active=false}}
			console.log(players);
			r.db('settrisk').table('games').get(id).update({'players': players}).run(connection, function(err, cursor) {
				console.log(playername+' har loggat ut.');
			});
		});
	});
});

app.post('/ping', function(req){
	var players = req.body.players;
	var id = req.body.id;
	for(i in players){
		pusher.trigger('private-channel_'+players[i].name, 'client-ping', { "data": "ping"});
		players[i].active=false;
	}
	r.db('settrisk').table('games').get(id).update({'players': players}).run(connection, function(err, cursor) {
		//console.log('Ping!');
		app.post('/pong', function(req){
			var player = req.body.player;
			//console.log(player);
			
		    for(i in players){if (players[i].name==player){console.log("true");players[i].active=true;}}
		    //console.log(players);
	    	r.db('settrisk').table('games').get(id).update({'players': players}).run(connection, function(err, cursor) {
				//console.log('Pong!');
			});
		});
	});
});


app.post('/buyItems', function(req, res) {
	var data = req.body.data;
	var player = req.body.player;
	var id = req.body.id;
	var game = req.body.game;
	var type = req.body.type;
	console.log(req.body);
	//check if posible!!!
	var p={};
	var currdata={}
	var txt='';
	var order='';
	//var datain={};
	var callb = function (currdata) {
		//order+='bygg['+antal+'] = {'+player+': player, type: '+inf+', nation: "", mark1: [0,""], mark2: [0,""], mark3: [0,""]};';
		var bygg=[];
		console.log(order);
		eval(order);
		if(bygg[0]){
			for(b in bygg){
				r.db(game).table('byggnader').insert(bygg).run(connection, function (err, results) {
					if (err) throw err;
					console.log(results);
					console.log(b==bygg.length);
					console.log(b+' =? '+bygg.length);
					currdata[type][bygg[b]['type']].push(results.generated_keys[0]);
					if((b+1)==bygg.length){
						r.db(game).table(player).update(currdata).run(connection, function (err, cursor) {
							if (err) throw err;
							res.send("Hej; got your req!");
							pusher.trigger('private-channel_'+player, 'client-log_event', { "note": "Du har köpt "+txt, "color": "success"});
						});
						console.log(currdata);
					}
				});		
			}
		}else{
			r.db(game).table(player).update(currdata).run(connection, function (err, cursor) {
				if (err) throw err;
				res.send("Hej; got your req!");
				pusher.trigger('private-channel_'+player, 'client-log_event', { "note": "Du har köpt "+txt, "color": "success"});
			});
			console.log(currdata);
		}
	}

	r.db('settrisk').table('priser').without('infanteri', 'byggnader', 'id').run(connection, function (err, cursor) {
		if (err) throw err;
		cursor.toArray(function(err, result) {
	        if (err) throw err;
	        p = result[0];
	    });
		console.log(game);

		r.db(game).table(player).withFields(type, 'resurser').run(connection, function (err, cursor) {
			if (err) throw err;
			cursor.toArray(function(err, result) {
		        if (err) throw err;
		        currdata = result[0];
		        
		        Object.keys(data[type]).forEach(function (inf) {
					var ex=0;
					for(antal in data[type][inf]){
						//checka kostnad
						var dyrt=0;
			            Object.keys(p[inf]).forEach( function (res){
			                if(currdata.resurser[res].length<p[inf][res].length){dyrt=1};
			            });

			            if(!dyrt){
			            	ex++;
			            	//dra av kostnad
							Object.keys(p[inf]).forEach(function (res) {
								for(pres in p[inf][res]){
									currdata.resurser[res].pop();
								}
							});
							//lägg till en enhet
							if(inf=='fabrik' || inf=='by' || inf=='stad'){
								//lägg till nya valmöjligheter som tex infanteri
								order+='bygg['+antal+'] = {'+player+': player, type: "'+inf+'", nation: "", mark1: [0,""], mark2: [0,""], mark3: [0,""]};';
								
							}else{currdata[type][inf].push(currdata[type][inf].length+1);}
			            }else{throw 'Du har inte råd!';}
					}
					if(ex!=0){txt+=' '+ex+' '+inf;}
				});
				callb(currdata);
		    });
		});
	});

});

app.post('/sendResurs', function(req, res) {
	var game = req.body.game;
	var player = req.body.player;
	var toPlayer = req.body.toPlayer;
	var resurs = req.body.resurs;
	var id = req.body.id;
	console.log(req.body);

	r.db(game).table(player).withFields('resurser').run(connection, function (err, cursor) {
		if (err) throw err;
		cursor.toArray(function(err, result) {
	        if (err) throw err;
	        console.log(result[0]);
	        var fromPlayerResurser = result[0].resurser;
	    

			r.db(game).table(toPlayer).withFields('resurser').run(connection, function (err, cursor) {
				if (err) throw err;
				cursor.toArray(function(err, result) {
			        if (err) throw err;
			        var toPlayerResurser = result[0].resurser;

					if(fromPlayerResurser[resurs].length>0){
						fromPlayerResurser[resurs].pop(fromPlayerResurser[resurs].length);
						toPlayerResurser[resurs].push(toPlayerResurser[resurs].length);
						r.db(game).table(player).update({'resurser':fromPlayerResurser}).run(connection, function (err, results) {
							if (err) throw err;
							console.log(results);
							pusher.trigger('private-channel_'+player, 'client-log_event', { "note": "Handel: Du har bytt bort "+resurs+"!", "color": "info"});
							r.db(game).table(toPlayer).update({'resurser':toPlayerResurser}).run(connection, function (err, results) {
								if (err) throw err;
								console.log(results);
								pusher.trigger('private-channel_'+toPlayer, 'client-log_event', { "note": "Handel: Du har fått "+resurs+"!", "color": "info"});
	        					res.send(results);
							});
						});
					}else{pusher.trigger('private-channel_'+player, 'client-log_event', { "note": "Handel: Du har ingen "+resurs+"!", "color": "danger"});res.send(results);}
			    });
			});
		});
	});
});


app.post('/ockupera', function(req, res) {
	var game = req.body.game;
	var player = req.body.player;
	var nationer = req.body.nationer;
	console.log(req.body);

	r.db(game).table(player).update({'nationer': nationer}).run(connection, function (err, cursor) {
		if (err) throw err;
		 //cursor.toArray(function(err, result) {
	        //if (err) throw err;
	        console.log(cursor);
	        res.send(cursor);
	        pusher.trigger('private-channel_'+player, 'client-log_event', { "note": "Ockupation uppdaterad", "color": "success"})
		//});
	});

});



app.post('/byggnads_info', function(req, res) {
	var game = req.body.game;
	var player = req.body.player;
	var byggnads_info = req.body.byggnads_info;
	var id = req.body.byggnads_info.id;
	console.log(req.body);

	r.db(game).table('byggnader').get(id).update(byggnads_info).run(connection, function (err, cursor) {
		if (err) throw err;
		 //cursor.toArray(function(err, result) {
	        //if (err) throw err;
	        console.log(cursor);
	        res.send(cursor);
	        pusher.trigger('private-channel_'+player, 'client-log_event', { "note": "Placerad: "+byggnads_info.type, "color": "success"})
		//});
	});

});



app.post('/dintur', function(req, res) {
	var game = req.body.game;
	var id = req.body.id;
	var player = req.body.player;
	var newplayer = req.body.newplayer;
	console.log(req.body);

	if(player!='bank'){
		r.db(game).table(player).update({'player': {'dintur':false}}).run(connection, function (err, cursor) {
			if (err) throw err;
			 //cursor.toArray(function(err, result) {
		        //if (err) throw err;
		        console.log(cursor);
		        var s=''
		        if(newplayer[-1]!='s'){s='s'}
		        pusher.trigger('private-channel_'+player, 'client-log_event', { "note": newplayer+s+" tur!", "color": "success"})
			//});
		});
	}

	r.db(game).table(newplayer).update({'player': {'dintur':true}}).run(connection, function (err, cursor) {
		if (err) throw err;
		 //cursor.toArray(function(err, result) {
	        //if (err) throw err;
	        console.log(cursor);
	        res.send(cursor);
	        pusher.trigger('private-channel_'+newplayer, 'client-log_event', { "note": "Din tur!", "color": "success"})
		//});
	});

});


app.get('/*', function(req, res) {
	//load data from db?
	res.render('index', {message: '', bool: 'false'});
});


//Pushing on changesevent!
setTimeout(function(){
r.db('settrisk').table('priser').changes().run(connection, function(err, cursor) {
    if (err) throw err;
    cursor.each(function(err, result) {
        if (err) throw err;
        pusher.trigger('game_channel', 'update_prices_event', JSON.stringify(result.new_val, null, 2));
    });
});
r.db('settrisk').table('games').changes().run(connection, function(err, cursor) {
    if (err) throw err;
    cursor.each(function(err, result) {
        if (err) throw err;
        pusher.trigger('games_channel', 'games_event', JSON.stringify(result, null, 2));
    });
});
},300)

//client updater
var clientUpdater = function (game, player, prChannel) {
	r.db(game).table(player).hasFields('player').changes().run(connection, function(err, cursor) {
	    if (err) throw err;
	    cursor.each(function(err, result) {
	        if (err) throw err;
	        pusher.trigger(prChannel, 'update_player_event', JSON.stringify(result.new_val, null, 2));
	    });
	});
	r.db(game).table('byggnader').hasFields(player).changes().run(connection, function(err, cursor) {
	    if (err) throw err;
	    cursor.each(function(err, result) {
	        if (err) throw err;
	        pusher.trigger(prChannel, 'update_player_byggnader_event', JSON.stringify(result.new_val, null, 2));
	    });
	});
}


//Listen!
app.listen(3000, function(){
    console.log('Listening on port 3000');
});
