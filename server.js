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


//rethinkdb
var connection = null;
var connect_to_rethinkdb = function (){
	r.connect( {host: 'localhost', port: 28015}, function (err, conn) {
	    if (err) {
	    	setTimeout(function() {connect_to_rethinkdb(); console.log('Trying to connect to rethinkdb ...')}, 3000);
	    }else{
	    	connection = conn;
		}
	});
}

var db_settings_events_created = new Array();
var create_pushing_events_db_settings = function (db_name){
	console.log('\nCreating pushing events for database: '+db_name+'.settings:');
	r.db(db_name).table('settings').without('id', 'color', 'typer').map(function (obj) {return obj.keys();}).run(connection, function (err, cursor) {//...lista tables i databas
		db_settings_events_created.push(db_name);
		cursor.each(function (err, settings_keys) {
			var eval_string='';
			for(k in settings_keys){
				eval_string += "console.log('Channel: channel_"+db_name+", Event: update_"+settings_keys[k]+"');"+
				"r.db('"+db_name+"').table('settings')('"+settings_keys[k]+"').changes().run(connection, function (err, cursor) {"+
	    			"if(err){"+
	    				"console.log('Error: ');"+
	    			"}else{"+
					    "cursor.each(function (err, result) {"+
					        "console.log('Triggered event: update_"+settings_keys[k]+", on channel: channel_"+db_name+"');"+
					        "pusher.trigger('channel_"+db_name+"', 'update_"+settings_keys[k]+"', JSON.stringify(result.new_val, null, 2));"+
					    "});"+
					"}"+
				"});";
	    	}
		    eval(eval_string);
    	});
	});
}


//client updater
var player_events_created = new Array();
var create_pushing_events_player = function (game, player, prChannel) {
	console.log('Creating pushing events for: '+game+'.'+player);
	r.db(game).table(player).map(function (obj) {return obj.keys();}).run(connection, function(err, cursor) {
		player_events_created.push(game+player);
		cursor.each(function (err, result) {
			var keys=result;
			//Generates an event for all attributes in player table that will be pushed to player on changes.
			var eval_string="";
			for(k in keys){
				eval_string += "console.log('Channel: "+prChannel+", Event: update_"+keys[k]+"');"+
				"r.db('"+game+"').table('"+player+"').withFields('"+keys[k]+"').changes().run(connection, function (err, cursor) {"+
	    			"if(err){"+
	    				"console.log('Error: ');"+
	    			"}else{"+
					    "cursor.each(function (err, result) {"+
					        "console.log('Triggered event: update_"+keys[k]+", on channel: "+prChannel+"');"+
					        "pusher.trigger('"+prChannel+"', 'update_"+keys[k]+"', JSON.stringify(result.new_val, null, 2));"+
					    "});"+
					"}"+
				"});";
			}
			eval(eval_string);
		});
	});
}

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
app.get('/list_all_games', function(req, res) {
	var list = [];
	var db_list = [];
	var games_list = [];

	async.waterfall([
		function (cb){
			r.dbList().run(connection, function(err, results){
				results.splice(results.indexOf('rethinkdb'),1);
				db_list = results;
				for(i in db_list){
					if(typeof db_list[i] == "string"){
						var txt = db_list[i].substr(0,5);
						if(txt=='game_'){
							games_list[i] = db_list[i];
						} 
					} 
				}
				cb(null, games_list);
			});
		},
		function (games_list, cb){
			games_list.forEach(function(err,i){
				if(db_settings_events_created.indexOf(games_list[i]) == -1){
					create_pushing_events_db_settings(games_list[i]);
				}else{
					console.log('The game-settings events have already been created for '+games_list[i]+'.');
				}
				r.db(games_list[i]).table('settings').withFields('players', 'date', 'active').run(connection, function(err, cursor) {
					cursor.toArray(function(err, results) {
						list[i] = {
							players: results[0].players, 
							date: results[0].date, 
							index: i, 
							name: 'Game '+(i+1),
							active: results[0].active
						};
						if(i==games_list.length-1){
							res.send(list);
						}
					}); 
				});
			});
		}
	], 
	function (err) {
		res.send('Sorry, something went wrong! Error msg:'+err.message);
	});
});

//node.js server http requests
app.get('/db/:database/:table', function(req, res) {
	console.log('REQUEST:'+req);
    var database = req.params.database;
    var table = req.params.table;
    var query = req.query;
    var eval_string = 'r.db(database).table(table)';
    for (key in query){
        // Valid querys:
	    if( key=='withFields' || 
	    	key=='hasFields' || 
	    	key=='orderBy'){ eval_string+='.'+key+'("'+query[key]+'")'; }
    }
    eval_string +='.run(connection, function(err, cursor) { cursor.toArray(function(err, result) {res.send(result); }); });';
    eval(eval_string);
});

app.post('/addGame', function(req, res) {
	var new_game = req.body.new_game;
	console.log(new_game);


//Create database 'game_1'
	r.dbCreate('game_'+(new_game.index+1)).run(connection, function(err, cursor) {
	    if (err) throw err; 
	    console.log('create db game_'+(new_game.index+1)+': '+err);
		create_pushing_events_db_settings('game_'+(new_game.index+1));
		
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
			    	r.db('game_'+(new_game.index+1)).table(player.name).insert([{
			    			typer: new_game.typer, 
			    			resurser: new_game.resurser, 
			    			player: player, 
			    			byggnader: new_game.byggnader, 
			    			byggnads_info: new_game['byggnads-info'], 
			    			infanteri: new_game.infanteri
			    		}]).run(connection, function(err, cursor) {
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


app.post('/signin', function(req, res) {
	var player = req.body.player;
	var game = req.body.game;
	//var id = req.body.id;
	var active = false;
	var players;

	if(player=='Bank'){
		r.db('game_'+game).table('settings')('players').run(connection, function(err, cursor) {
			cursor.toArray(function(err, result) {
		        players = result;
				res.render('bank', {
					game: game,
					players: players
				});
			});
		});
	}else{

		if(player_events_created.indexOf("game_"+game+player) == -1){
			create_pushing_events_player('game_'+game, player, 'private-game_'+game+'-'+player);
		}else{
			console.log('The player events have already been created for this game.');
		}

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
						
						r.db('settrisk').table('priser').run(connection, function(err, cursor) {
							if (err) throw err;
							cursor.toArray(function(err, results) {
								var priser = results[0];//JSON.stringify(results, null, 2);
								
								r.db('game_'+game).table('settings')('players').run(connection, function(err, cursor) {
									if (err) throw err;
									cursor.toArray(function(err, result) {
								        if (err) throw err;
								        players = result[0];
								        //Om redan true, returnera med index, annars sätt till true.
								        for(i in players){
								        	if(player==players[i]['name'] ){ 
								        		if(players[i]['active']){res.render('index', {message: player+' har redan loggat in!', bool: true});}
								        		active = players[i]['active']; players[i]['active']=true; }
								        }
							    		console.log(player+' cheching if active: '+err+' '+active);
							    		//console.log(players);

							    		r.db('game_'+game).table('byggnader').hasFields(player).run(connection, function(err, cursor) {
											if (err) throw err;
											cursor.toArray(function(err, result) {
										        if (err) throw err;
										        playerSettings.byggnads_info = result;
										        var nationer={};
										        for(i in result){if(result[i].nation!=''){nationer[result[i].nation]=false;}}
										        //console.log(playerSettings);

									    		if(!active || true){
													active = true;
													r.db('game_'+game).table('settings').update({players:players}).run(connection, function(err, cursor) {
														//if (err) throw err;
														console.log(players);
														//plocka bort spelaren ur array och indexa om! 
										    			for(i in players){ if(player==players[i]['name']){ players.splice(i,1); }}
										    			var x=0;
											        	while(x<players.length){players[x]['index']=(x+1); x++;}
												        console.log(player+' is now active! Error: '+err);
														res.render('playertest', {
															player: player,
															game: game,
															dintur: false,
															id: 'id',
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
		});
	}
});



app.post('/logout', function(req) {
	var playername = req.body.playername;
	var game_index = req.body.game_index;
	r.db('game_'+game_index).table('settings')('players').run(connection, function(err, cursor) {
		cursor.toArray(function(err, results) {			
			if (err) throw err;
			console.log(results[0]);
			var players = results[0];
			for(p in players){if(players[p].name==playername){players[p].active=false}}
			console.log(players);
			r.db('game_'+game_index).table('settings').update({'players': players}).run(connection, function(err, cursor) {
				console.log(playername+' har loggat ut.');
			});
		});
	});
});



app.post('/ping', function(req, res){
	/*res.send('Ping!');
	d = Date.now();
	var players = req.body.players;
	var id = req.body.id;
	for(i in players){
		pusher.trigger('private-channel_'+players[i].name, 'client-ping', { "data": "ping"});
		players[i].active=false;
	}
	r.db('settrisk').table('games').get(id).update({'players': players}).run(connection, function(err, cursor) {
		console.log('Ping!');
		app.post('/pong', function(req, res){
			res.send('Pong!');
			var player = req.body.player;
			//console.log(player);
		    for(i in players){if (players[i].name==player){players[i].active=true;}}
		    //console.log(players);
	    	r.db('settrisk').table('games').get(id).update({'players': players}).run(connection, function(err, cursor) {
				console.log(player+' Pong! '+(Date.now()-d)+'ms');
			});
		});
	});*/
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
							pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Du har köpt "+txt, "color": "success"});
						});
						console.log(currdata);
					}
				});		
			}
		}else{
			r.db(game).table(player).update(currdata).run(connection, function (err, cursor) {
				if (err) throw err;
				res.send("Hej; got your req!");
				pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Du har köpt "+txt, "color": "success"});
			});
			console.log(currdata);
		}
	}

	r.db(game).table('settings').withFields('priser').run(connection, function (err, cursor) {
		if (err) throw err;
		cursor.toArray(function(err, result) {
	        if (err) throw err;
	        p = result[0].priser;
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
								order+='bygg['+antal+'] = {player: "'+player+'", type: "'+inf+'", nation: "", mark1: "", nr1: 0, mark2: "", nr2: 0, mark3: "", nr3: 0 };';
								
							}else{currdata[type][inf].push(currdata[type][inf].length+1);}
			            }else{
			            	pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Du har inte råd!", "color": "danger"});
			            }
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
							console.log(result);
							pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Handel: Du har bytt bort "+resurs+"!", "color": "info"});
							r.db(game).table(toPlayer).update({'resurser':toPlayerResurser}).run(connection, function (err, results) {
								if (err) throw err;
								console.log(result);
								pusher.trigger('private-'+game+'-'+toPlayer, 'client-log_event', { "note": "Handel: Du har fått "+resurs+"!", "color": "info"});
	        					res.send(result);
							});
						});
					}else{pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Handel: Du har ingen "+resurs+"!", "color": "danger"});res.send(result);}
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
	        pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Ockupation uppdaterad", "color": "success"})
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
	        pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Placerad: "+byggnads_info.type, "color": "success"})
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
		        pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": newplayer+s+" tur!", "color": "success"});
			//});
		});
	}

	r.db(game).table(newplayer).update({'player': {'dintur':true}}).run(connection, function (err, cursor) {
		if (err) throw err;
		 //cursor.toArray(function(err, result) {
	        //if (err) throw err;
	        console.log(cursor);
	        res.send(cursor);
	        pusher.trigger('private-'+game+'-'+newplayer, 'client-log_event', { "note": "Din tur!", "color": "success"});
		//});
	});

});


app.post('/dices', function(req, res) {
	var game = req.body.game;
	var player = req.body.player;

	var dices =[];


	if(player!='bank'){
		r.db(game).table(player)('din_tur').run(connection, function (err, dintur) {
			console.log(dintur);
			if(dintur){
				dices = [ Math.ceil(Math.random()*6) , Math.ceil(Math.random()*6) ];
				r.db(game).table('settings').update({d: dices}).run(connection, function (err) {
					if(err){
						res.send(false);
					}else{
						res.send(dices);
						utdelning(game, dices);
					}
				});
			}
		});
	}
});

function utdelning (game, dices) {
	nr = dices[0]+dices[1];
	console.log('dice: '+nr+' game: '+game);
	r.db(game).table('byggnader')
	.hasFields('mark1')
	.filter(function(row){
	  return row('nr1').eq(nr) || row('nr2').eq(nr) || row('nr3').eq(nr);
	})
	.run(connection, function (err, cursor) {
		cursor.toArray(function (err, data) {
			var utdelning = {};
			var txt ='';
			for(d in data){utdelning[data[d].player]='';}
			for(d in data){
				var num = ["nr1", "nr2", "nr3"];
				var marker = ["mark1", "mark2", "mark3"];
				if(data[d]=='fabrik'){
					var num = ["nr1", "nr2", "nr3", "nr1", "nr2", "nr3"];
					var marker = ["mark1", "mark2", "mark3", "mark1", "mark2", "mark3"];
				}
				for(i in num){
					if(data[d][num[i]]==nr){
						utdelning[data[d].player] += ' '+data[d][marker[i]];
						txt += 
						'r.db("'+game+'").table("'+data[d].player+'").update({'+
						  '"resurser": {'+
						    '"'+data[d].mark1+'": r.branch( '+
						      'r.row("resurser")("'+data[d][marker[i]]+'").eq([]),'+
						      'r.row("resurser")("'+data[d][marker[i]]+'").append(0),'+
						      'r.row("resurser")("'+data[d][marker[i]]+'").append('+
						        'r.row("resurser")("'+data[d][marker[i]]+'").nth(-1).add(1)'+
						      ')'+
						    ')'+
						  '}'+
						'}).run(connection, function (err) { if(err){console.log("Error!?");} });';
						console.log('Utdelning! 1 '+data[d].player+' '+data[d][marker[i]]);
						pusher.trigger('private-'+game+'-'+data[d].player, 'client-log_event', { "note": "Utdelning: "+utdelning[data[d].player], "color": "success"})
					}
				}
			}
			eval(txt);
		});

		/*var fetchNext = function(err, data) {
			console.log(data);
		    if (err) {
		        if (((err.name === "ReqlDriverError") && err.message === "No more rows in the cursor.")) {
		            console.log("No more data to process")
		        }
		    }
		    else {
		    	if(data.nr1==nr){
					r.db(game).table(data.player)('resurser')(data.mark1).run(connection, function (err, resarr) {
						if (err){console.log('Err'+err)}
						r.db(game).table(data.player)('resurser')(data.mark1).append(resarr.length).run(connection, function (err, d) {
							console.log('Utdelning! 1 '+data.player+' '+data.mark1);
		        			cursor.next(fetchNext);
						});
					});
				}
				if(data.nr2==nr){
					r.db(game).table(data.player)('resurser')(data.mark1).run(connection, function (err, resarr) {
						if (err){console.log('Err'+err)}
						r.db(game).table(data.player)('resurser')(data.mark1).append(resarr.length).run(connection, function (err, d) {
							console.log('Utdelning! 2 '+data.player+' '+data.mark2);
		       			 	cursor.next(fetchNext);
						});
					});
				}
				if(data.nr3==nr){
					r.db(game).table(data.player)('resurser')(data.mark1).run(connection, function (err, resarr) {
						if (err){console.log('Err'+err)}
						r.db(game).table(data.player)('resurser')(data.mark1).append(resarr.length).run(connection, function (err, d) {
							console.log('Utdelning! 3 '+data.player+' '+data.mark3);
							cursor.next(fetchNext);
						});
					});
				}
		    }
		}
		cursor.next(fetchNext);*/
	});
}


app.get('/*', function(req, res) {
	//load data from db?
	res.render('index', {message: '', bool: 'false'});
});



//Listen!
app.listen(3000, function(){
    console.log('Listening on port 3000');
    connect_to_rethinkdb();
});
