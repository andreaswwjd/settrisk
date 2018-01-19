
var fs = require('fs');
// var https = require('https');
var http = require('http');
var express = require('express')
var app = express();


var port = process.env.PORT || 53001;
// var serverPort = 443;

// var server = https.createServer(options, app);
var server = http.Server(app);
var io = require('socket.io')(server);



// Rethinkdb
var r = require('rethinkdb')

var connection = null;
var connect_to_rethinkdb = function (){
	r.connect( {host: 'localhost', port: 28015}, function (err, conn) {
	    if (err) {
	    	setTimeout(function() {connect_to_rethinkdb(); console.log('Trying to connect to rethinkdb ...')}, 3000);
	    }else{
	    	connection = conn;
			console.log('Connection to rethinkdb established.')
		}
	});
}
connect_to_rethinkdb();




var validate = function(data,scheema){
	let errors = false
	for(key in data){
		errors = errors || data[key].constructor != scheema[key];
	}
	if(errors){console.log(data)}
	return errors;
}

var c4 = function(){
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

Number.prototype.toArray = function(){
	let i=0,a=[];
	while(i<this.valueOf()){
		a.push(i)
		i++
	}
	return a;
}

var newTurn = function(player){
	return { 
		"player": player.username,
		"rolled": false,
		"time": {
			"start": new Date()
		},
		"state": 1,
		"moves": [],
		"outcome": {
			"dices": {},
			"yield": {},
			"eventcard": {},
			"moves": [],
		},
		"done": false
	}
}

var renderDices = function(a,b){
	return '<div class="dice roll1" style="transform: rotate('+Math.random()*180+'deg);">'+
	  '<div style="left: 8px; top: 8px;" class="'+'hide'.repeat(a<4)+'"></div>'+
	  '<div style="left: 20px; top: 8px;" class="'+'hide'.repeat(a<6)+'"></div>'+
	  '<div style="left: 32px; top: 8px;" class="'+'hide'.repeat(a<2)+'"></div>'+
	  '<div style="left: 20px; top: 20px;" class="'+'hide'.repeat(1-a%2)+'"></div>'+
	  '<div style="left: 8px; top: 32px;" class="'+'hide'.repeat(a<2)+'"></div>'+
	  '<div style="left: 20px; top: 32px;" class="'+'hide'.repeat(a<6)+'"></div>'+
	  '<div style="left: 32px; top: 32px;" class="'+'hide'.repeat(a<4)+'"></div>'+
	'</div><div class="dice roll2" style="transform: rotate('+Math.random()*180+'deg);">'+
	  '<div style="left: 8px; top: 8px;" class="'+'hide'.repeat(b<4)+'"></div>'+
	  '<div style="left: 20px; top: 8px;" class="'+'hide'.repeat(b<6)+'"></div>'+
	  '<div style="left: 32px; top: 8px;" class="'+'hide'.repeat(b<2)+'"></div>'+
	  '<div style="left: 20px; top: 20px;" class="'+'hide'.repeat(1-b%2)+'"></div>'+
	  '<div style="left: 8px; top: 32px;" class="'+'hide'.repeat(b<2)+'"></div>'+
	  '<div style="left: 20px; top: 32px;" class="'+'hide'.repeat(b<6)+'"></div>'+
	  '<div style="left: 32px; top: 32px;" class="'+'hide'.repeat(b<4)+'"></div>'+
	'</div>'+
	'<style>'+
	'.dice{display:inline-block; margin: 10px 10px;width: 50px;height: 50px;background-color: #FAFAFA;border-radius: 5px;box-shadow:0 0 10px -3px gray}'+
	'.dice>div{width:10px; height:10px; background-color:white; border-radius:100%; box-shadow: 2px 2px 6px 2px rgb(139, 139, 139) inset;position:absolute; }'+
	'.hide{display:none}'+
	'@keyframes roll {'+
	'  100% {-webkit-transform: translate(0,0) rotate(0);-webkit-transform-origin: 17px 22px; }'+
	  '60% {-webkit-transform: translate(-50px,-30px) rotate(250deg);-webkit-transform-origin: 24px 22px; }'+
	  '40% {-webkit-transform: translate(60px,-50px) rotate(500deg);-webkit-transform-origin: 16px 22px; }'+
	  '15% {-webkit-transform: translate(-40px,-7px) rotate(990deg);-webkit-transform-origin: 23px 22px; }'+
	  'from {-webkit-transform: translate(0,0) rotate(1000deg);}'+
	'}'+
	'.roll1 { animation: roll 0.5s reverse;}'+
	'.roll2 { animation: roll 0.5s; }'+
	'</style>';
}


// Socket connections
var connections = []

io.on('connection', function(socket){
	
	connections.push(socket)
	console.log('Connected: %s sockets connected', connections.length)

	socket.on('disconnect', function(){
		connections.splice(connections.indexOf(socket));
		console.log('Disonnection..', connections.length)
	})

	/***** Set up user and games data *****/

	async function getGames (){
		try{
			let cursor = await r.db('Main').table('Games').run(connection)
			let games = await cursor.toArray()
			socket.emit('games', games)
		}catch(err){console.log('Error msg: ',err)}
	}
	async function getUsers (){
		try{
			let cursor = await r.db('Main').table('Users').without('pin','password').run(connection)
			let users = await cursor.toArray()
			socket.emit('users', users)
		}catch(err){console.log('Error msg: ',err)}
	}
	async function getGame (id){
		try{
			let game = await r.db('Main').table('Games').get(id).run(connection)
			console.log('game', game.name)
			socket.emit('game', game)
		}catch(err){console.log('Error msg: ',err)}
	}
	
	getGames();
	getUsers();
	// socket.emit('users', async function(){return await r.db('Main').table('Users').run(connection)}())
	// socket.emit('games', async function(){return await r.db('Main').table('Games').run(connection)}())





	/***** App *****/

	socket.on('initApp', async function(game, user){
		console.log('Init', game.name, user.name)
		console.log('Database', game.db)

		socket.game = game;
		socket.user = user;
		
		// Game
		try{
			let data = await r.db('Main').table('Games').get(socket.game.id).changes().run(connection, function(err, cursor) {
				try{
					cursor.each(function(err,change){
						// socket.emit('data', {type: 'game', change: change})

						socket.emit('game',change.new_val)
						socket.game = change.new_val;
					});
				}catch(err){ console.log('Error msg: ',err) }
			});
		}catch(err){ console.log('Error msg: ',err) }
		
		// Resurser
		try{
			let data = await r.db(game.db).table('Resurser').filter({username: user.username}).changes().run(connection, function(err, cursor) {
				try{
					cursor.each(function(err,change){
						socket.emit('data', {type: 'resurser', change: change})
					});
				}catch(err){ console.log('Error msg: ',err) }
			});
		
			data = await r.db(game.db).table('Resurser').filter({username: user.username}).run(connection);
			data = await data.each(function(err, data){
				socket.emit('data', {type: 'resurser', change: {new_val: data}})
			});
		}catch(err){ console.log('Error msg: ',err) }
		
		// Byggnader
		try{
			let data = await r.db(game.db).table('Byggnader').filter({username: user.username}).changes().run(connection, function(err, cursor) {
				try{
					cursor.each(function(err,change){
						if(change&&!change.old_val&&change.new_val){
							socket.emit('notify', {title:'Byggnad:', msg: '1 '+change.new_val.type+' har lagts till dina byggnader.'})
						}
						socket.emit('data', {type: 'byggnader', change: change})
					});
				}catch(err){ console.log('Error msg: ',err) }
			});
		
			data = await r.db(game.db).table('Byggnader').filter({username: user.username}).run(connection);
			data = await data.toArray();
			data.map(building=>socket.emit('data', {type: 'byggnader', change: {new_val: building}}))
		}catch(err){ console.log('Error msg: ',err) }
		
		// Infanteri
		try{
			let data = await r.db(game.db).table('Infanteri').filter({username: user.username}).changes().run(connection, function(err, cursor) {
				try{
					cursor.each(function(err,change){
						if(change&&!change.old_val&&change.new_val){
							socket.emit('notify', {title:'Arme:', msg: '1 '+change.new_val.type+' har lagts till din arme.'})
						}
						socket.emit('data', {type: 'infanteri', change: change})
					});
				}catch(err){ console.log('Error msg: ',err) }
			});
		
			data = await r.db(game.db).table('Infanteri').filter({username: user.username}).run(connection);
			data = await data.toArray();
			data.map(infanteri=>socket.emit('data', {type: 'infanteri', change: {new_val: infanteri}}))
		}catch(err){ console.log('Error msg: ',err) }
		
		
		// Turer
		try{
			let data = await r.db(game.db).table('Turer').filter({player: user.username}).changes().run(connection, function(err, cursor) {
				try{
					cursor.each(function(err,change){
						socket.emit('data', {type: 'turn', change: change})
					});
				}catch(err){ console.log('Error msg: ',err) }
			});
		
			data = await r.db(game.db).table('Turer').filter({player: user.username, done:false}).limit(1).run(connection);
			data = await data.toArray();
			data.map(turn=>socket.emit('data', {type: 'turn', change: {new_val: turn}}))
		}catch(err){ console.log('Error msg: ',err) }
		
		// Dices
		try{
			let data = await r.db(game.db).table('Turer').filter({rolled:true}).withFields('player', 'outcome').changes().run(connection, function(err, cursor) {
				try{
					cursor.each(function(err,change){
						socket.emit('data', {type: 'dices', change: change})
					});
				}catch(err){ console.log('Error msg: ',err) }
			});
		
			data = await r.db(game.db).table('Turer').orderBy('done').filter({rolled:true}).withFields('player', 'outcome', 'rolled').limit(1).run(connection);
			data = await data.toArray();
			// console.log('dices',data[0])
			socket.emit('data', {type: 'dices', change: {new_val: data[0]}})
		}catch(err){ console.log('Error msg: ',err) }

		
		// Modals
		try{
			let data = await r.db(game.db).table('Modals').filter({username: user.username}).changes().run(connection, function(err, cursor) {
				try{
					cursor.each(function(err,change){
						socket.emit('data', {type: 'modal', change: change})
					});
				}catch(err){ console.log('Error msg: ',err) }
			});
		
			data = await r.db(game.db).table('Modals').filter({username: user.username}).run(connection);
			data = await data.toArray();
			data.map(modal=>socket.emit('data', {type: 'modal', change: {new_val: modal}}))
		}catch(err){ console.log('Error msg: ',err) }
		
	})

	socket.on('updateTurn', function(turn){
		r.db(socket.game.db).table('Turer').update(turn).run(connection);
	})

	socket.on('rollDices', async function(turn){
		// 1. Roll dices
	  //       //    -> dices.nr
		let t0 = turn.outcome.dices.a;
		let t1 = turn.outcome.dices.b;
		let nr = t0+t1;
		let update = await r.db(socket.game.db).table('Turer').update(turn).run(connection);

      //       // 2. Ge utdelning och bonus
      //       //    - Vilka byggnader har:
      //       //           Angränsande fält med:
	  //       //                - Rätt nummer (annars skippa resten)
		let cursor = await r.db(socket.game.db).table('Byggnader').filter({isBuild: true}).run(connection);
		let byggnader = await cursor.toArray();

		// HARVEST
		let buildings_with_harvest = byggnader.map(byggnad=>{
			let bygg = byggnad
			if(byggnad.fields.length==0){return bygg}
			bygg.fields = byggnad.fields.filter(f=>f.type!='hamn').filter(f=>{
				let bp = socket.game.boardgame.boardpieces.find(bp=>bp.id==f.bp_id);
				let field = bp ? bp.fields.find(field=>field.id==f.refid) : undefined;
				if(	field &&
					field.number== nr && 			// Has number
					['none', byggnad.username, undefined].indexOf(field.occupiedBy)!=-1 && // Not occupied or occypyed by owner of building
					field.type!='gras' && 												// Not gräs
					byggnad.utdelning													// Ger utdelning
				){
					console.log('Adding %d %s to %s.', byggnad.utdelning, f.type, byggnad.username)
					// byggnad.utdelningFn 'x=>x'
					byggnad.utdelning.toArray().map(i=>{
						r.db(socket.game.db).table('Resurser').insert({
							username: byggnad.username,
							type: field.type,
							x: (byggnad.pos[0]+field.pos[0])/2+Math.random()*15-7,
							y: (byggnad.pos[1]+field.pos[1])/2+Math.random()*15-7,
							location: 'yield'
						}).run(connection)
					})
					byggnad.yieldStat[field.type] ? byggnad.yieldStat[field.type] += 1 : byggnad.yieldStat[field.type] = 1;
					r.db(socket.game.db).table('Byggnader').get(byggnad.id).update(byggnad).run(connection);
					return true
				}else{
					return false
				}
			}) // Vid occupy => uppdatera alla byggnaders fält som har id't...
			return bygg;
		}).filter(byggnad=>Boolean(byggnad.fields[0]));
		// console.log('has_number_not_occupied', has_number_not_occupied)
      //       //                I: Byggnad har utdelning och:
      //       //                - Ej ockuperad eller ockuperad av User
      //       //                     -> Utdelning:
      //       //                            X resurser för X i 'byggnad.utdelning' och fält.
	  //       //                            Spara ovanståede för notis senare i Modal: Modal.utdelning[res] += 1 

	
		
		//       //
		//       //                II: Byggnad har bonus och:
		//       //                - Nation ockuperas av User
		//       //                     -> Bonus:
		//       //                            X resurser för X i 'bonus.antal' och 'bonus.type'.
		//       //                            Spara ovanståede för notis senare i Modal: 
		//       //                            Om 'bonus.type'=='valfri': Modal.bonus[res]+=1 
		//       //                            Annars                     Modal.utdelning[res]+=1
		// let has_bonus_and_occupied_by_user = byggnader.filter(byggnad=>{ return false
		// 	return byggnad.fields.filter(field=>field.bonus && (field.occupiedBy==byggnad.username) )[0] 
		// });
		let width = 380, //screen.availWidth-20,
			height = 140,
			zoom = 0.7;


		// BONUS

		let buildings_with_bonus = []
		
		socket.game.boardgame.boardpieces.filter(bp=>bp.occupiedBy==turn.player).map(bp=>{
			byggnader.filter(byggnad=> {
				return byggnad.username==turn.player && Boolean(byggnad.bonus) && Boolean(byggnad.fields.find(f=>f.bp_id==bp.id))
			}).map(byggnad=>{
				buildings_with_bonus.push(byggnad)
			})
		})

		let bonuses = []
				
		buildings_with_bonus.map( byggnad=>{
			byggnad.bonus.antal.toArray().map(nr=>{
				bonuses.push({
					username: turn.player,
					id: c4()+c4()+'-'+c4()+'-'+c4()+'-'+c4()+'-'+c4()+c4()+c4(),
					byggnad_id: byggnad.id,
					x: byggnad.pos[0]+Math.random()*15-7, 
					y: byggnad.pos[1]+Math.random()*15-7,
					type: byggnad.bonus.type
				})
				
				byggnad.yieldStat[byggnad.bonus.type] ? byggnad.yieldStat[byggnad.bonus.type] += 1 : byggnad.yieldStat[byggnad.bonus.type] = 1;
				r.db(socket.game.db).table('Byggnader').get(byggnad.id).update({yieldStat: byggnad.yieldStat}).run(connection);
			});
		})

		bonuses.map( b=>{
			r.db(socket.game.db).table('Resurser').insert({
				username: turn.player,
				id: b.id,
				type: b.type, 
				x: b.x, 
				y: b.y,
				location: 'yield'
			}).run(connection);
		});

		console.log('buildings_with_bonus',buildings_with_bonus)
		console.log('Bonuses',bonuses)
		
		let buildings_with_yield = byggnader.filter(byggnad=>{
			return (
				buildings_with_bonus.find(b=>b.id==byggnad.id) ||
				buildings_with_harvest.find(b=>b.id==byggnad.id)
			)
		})

		//       //                            
		//       // 3. Skapa Modal (per utdelande byggnad):
		//       //    -> Du har fått X i utdelning på fält från byggnad (och X valfri)
		//       //       (Om valfri): ... Välj valfri resurs.
		//       //  

		
		socket.game.players.map(player=>{
			if(buildings_with_yield.find(building=>building.username==player.username)){
				// console.log(player.username)
				let valfria = bonuses.filter(b=>{
					return Boolean(buildings_with_bonus.find(building=>{
						return (
							building.id == b.byggnad_id &&
							building.username == player.username &&
							building.bonus.type == 'valfri'
						)
					}));
				})
				console.log('valfria',valfria)
				let modal = {
					username: player.username,
					modalQ: 'main',
					valfria: valfria,
					eraseAfterClose: true,
					type: 'alert',
					isOpen: true,
					svgClass: 'left',       
					svg: '<div style="text-align: center; margin: -25px 0 -30px">'+renderDices(turn.outcome.dices.a,turn.outcome.dices.b)+'</div>',
					content: buildings_with_yield.filter(building=>building.username==player.username).map((building,i,a)=>{
						let bonus = valfria.filter( b => building.id == b.byggnad_id );
						console.log('bonus',bonus)
						let menu = [];
						bonus.map((b,j,ar)=>{
							// if(b.type=='valfri'){
								menu = menu.concat([
									{ text: 'Bonus '+(j+1)+' '+b.type, type:'title'}
								]);
								menu = menu.concat(["tra", "sad", "olja", "sten"].map(type=>{
									return {
										text: type, action: 'selectValfri', response: {type: type, res_id: b.id}, then: 'log'
									}
								}))
							// }
							if(j == ar.length-1){
								if(i != a.length-1){
									menu = menu.concat([
										{ text: 'Nästa', then: 'slide' }
									]);
								}else{
									menu = menu.concat([
										{ text: 'Stäng', then: 'close' }
									]);
								}
							}
						})
						if(!menu[0]){
							if(i != a.length-1){
								menu = menu.concat([
									{ text: 'Nästa', then: 'slide' }
								]);
							}else{
								menu = menu.concat([
									{ text: 'Stäng', then: 'close' }
								]);
							} 
						}
						return {
							title: 'Utdelning',
							htmlClass: 'selection',
							html: '<svg width="100%" height="140px" viewBox="'+(building.pos[0]-width*zoom/2)+' '+(building.pos[1]-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>',
							menu: menu
						}
					})
				};
				// console.log(modal)
				setTimeout(function(){r.db(socket.game.db).table('Modals').insert(modal).run(connection)}, 2000);
			}
		})
		
	          
	})
	
	socket.on('done', async function(turn){ // Kolla varför den inte gör en insert?!
		turn.done = true;
		let player = socket.game.players.find(player => player.username==socket.user.username)
		let index = (socket.game.players.indexOf(player)+1)%socket.game.players.length;
		let next_player = socket.game.players[index];
		let update = await r.db(socket.game.db).table('Turer').update(turn).run(connection);
		let insert = await r.db(socket.game.db).table('Turer').insert(newTurn(next_player)).run(connection);
	})

	socket.on('occupyField', async function(field){
		console.log('occupyField',socket.user.username)
		let boardpieces = await r.db('Main').table('Games').get(socket.game.id)('boardgame')('boardpieces').run(connection)
		// console.log('boardpieces',JSON.stringify(boardpieces[0].fields))
		boardpieces = boardpieces.map(bp=>{
			bp.fields = bp.fields.map(f=>{
				if(f.id==field.id){
					f.occupiedBy = f.occupiedBy == socket.user.username ? 'none' : socket.user.username ;
				}
				return f;
			});
			// If all fields are occupied by the same player. Boardpiece is occupied by player.
			let hash = {};
			let occupants = bp.fields.filter(function (f) {
			  let match = Boolean(hash[f.occupiedBy]);
			  return (match ? false : hash[f.occupiedBy] = true);
			});
			occupants.length==1 ? bp.occupiedBy = occupants[0].occupiedBy : bp.occupiedBy = 'none';
			return bp;
		})
		// console.log('AFTER',JSON.stringify(boardpieces[0].fields))
		let answear = await r.db('Main').table('Games').get(socket.game.id).update({boardgame:{boardpieces: boardpieces}}).run(connection)
		console.log('answear',answear)
	})

	socket.on('updateBuilding', async function(building){
		try{
			r.db(socket.game.db).table('Byggnader').get(building.id).update(building).run(connection);
		}catch(err){
			console.log('Error msg: ',err)
			socket.emit('notify', {title:'Database error:', msg: err })
		}
	})

	socket.on('updateResurser', async function(resurser){
		try{
			resurser.map(resurs=>{
				r.db(socket.game.db).table('Resurser').update(resurs).run(connection);
			})
		}catch(err){
			console.log('Error msg: ',err)
			socket.emit('notify', {title:'Database error:', msg: err })
		}
	})

	socket.on('selectValfri', function(bonus_item){
		console.log('bonus_item',bonus_item)
		r.db(socket.game.db).table('Resurser').get(bonus_item.res_id).update({type:bonus_item.type}).run(connection)
	})

	socket.on('trade', function(trade){
		console.log('Trading',trade)
		if(trade.to.name=='Bank'){
			let valfri = {
				username: socket.user.username,
				id: c4()+c4()+'-'+c4()+'-'+c4()+'-'+c4()+'-'+c4()+c4()+c4(),
				type: 'valfri',
				x: 150,
				y: 250,
				location: 'trade'
			}
			console.log('valfri',valfri)
			r.db(socket.game.db).table('Resurser').insert(valfri).run(connection);
			let modal = {
				username: socket.user.username,
				modalQ: 'main',
				eraseAfterClose: true,
				type: 'alert',
				isOpen: true,
				svgClass: 'bank',       
				svg: '<div style="text-align: center; padding:20px;"><svg width=\"100%\" height=\"60px\" viewBox=\"0 0 100 100\"><use xlink:href=\"#svg-hands\"></use></svg></div>',
				content:[{
					title: 'Välj valfri:',
					menu: ["tra", "sad", "olja", "sten"].map(type=>{
						return {
							text: type, action: 'selectValfri', response: {type: type, res_id: valfri.id}, then: 'close'
						}
					})
				}]
			}
			console.log('modal',modal)
			
			r.db(socket.game.db).table('Modals').insert(modal).run(connection);

		}
		trade.resurser.map(t=>{
			r.db(socket.game.db).table('Resurser').get(t.id).update({username: trade.to.username, location: 'trade'}).run(connection);
		})
		socket.broadcast.emit('notify',{title:'Trade:', msg: socket.user.name+' har skickat något till '+trade.to.name+'.', icon:'<svg width="20px" height="20px" viewBox="0 0 100 100" preserveAspectRatio="none"><use xlink:href="#svg-hands"></use></svg>'})
	})
	socket.on('buy', function(buy){
		if(buy){
			// Price
			Object.keys(buy.item.price).map((res)=>{
				buy.item.price[res].map(()=>{
					let resurs = buy.betalning.pop()
					if(resurs){
						resurs.payer = socket.user.username;
						resurs.username = 'bank';
						r.db(socket.game.db).table('Resurser').get(resurs.id).update(resurs).run(connection)
					}else{
						console.log('Transation Error:',buy, Date())
					}
				})
			})
			if(buy.itemgroup == 'buildingitems'&&['Väg','Bro'].indexOf(buy.item.name)==-1){
				// Add building item
				let building = {
					username: socket.user.username,
					type: buy.item.name,
					timestamp: new Date(),
					pos: {x:0, y:0},
					fields: [],
					utdelning: buy.item.utdelning || false,
					bonus: buy.item.bonus || false,
					isBuild: false,
					yieldStat: ['By','Stad','Storstad','Fabrik'].indexOf(buy.item.name) != -1 ? {} : false 
				}
				try{
					r.db(socket.game.db).table('Byggnader').insert(building).run(connection);
					socket.emit('notify', {title:'Köpt!', msg: 'Du har köpt 1 '+buy.item.name, icon:'<i class="fas fa-check-circle" style="color:#2ECC71"></i>' })
				}catch(err){
					console.log('Error msg: ',err)
					socket.emit('notify', {title:'Database error:', msg: err })
				}
			}else{
				buy.item.username = socket.user.username;
				buy.item.timestamp = new Date();
				try{
					r.db(socket.game.db).table('Infanteri').insert(buy.item).run(connection);
				}catch(err){
					console.log('Error msg: ',err)
					socket.emit('notify', {title:'Database error:', msg: err })
				}
			}
		}
	})

	socket.on('dismissModal', function(modal){
		r.db(socket.game.db).table('Modals').get(modal.id).delete().run(connection)
	})










	/***** New user *****/
	
	socket.on('getUsers', ()=>{getUsers()})

	socket.on('submitAddUser', async function submitAddUser(user) {
		try {
			if(!user.dateAdded){
				user.dateAdded = new Date();
				user.pin = (Number.parseInt(user.pin).toString().length==4 && Number.parseInt(user.pin))
			}
			// Validation
			let errors = validate(user,{
				name: String,
				lastname: String,
				username: String,
				color: String,
				// password: String,
				dateAdded: Date,
				pin: Number
			})
			if(errors){ throw 'Data not valid' }

			// Check username is unique
			let cursor = await r.db('Main').table('Users').filter({username: user.username}).run(connection)
			let users = await cursor.toArray();
			if(users[0]){ throw 'Username already exists.' }

			// Insert user
			let insert = await r.db('Main').table('Users').insert(user).run(connection)
			console.log('Added user: %s',user.name)

			// Alert browser
			socket.emit('userAdded', insert)
		} catch(err){
			console.log('Error msg: ',err)
			socket.emit('userAdded', {errors: err })
		} 
	})





	/***** Games / Game settings *****/

	socket.on('getGames', ()=>{getGames()})

	socket.on('newGameDb', async function newGameDb() {
		try {
			let cursor = await r.dbList().run(connection);
			let dbList = await cursor.toArray();
			let gamedbs = dbList.filter(db => db.substr(0,4) == 'Game')

			let newgame = {
				date: new Date(), 
				name: 'Game '+(gamedbs.length+1), 
				db: 'Game_'+c4()+'_'+c4()+'_'+c4()+'_'+c4(), 
				players: [],
				boardgame: {},
				types: {
					resurser: {
						"tra": {color: '#1abc9c', name:'Trä'},
						"sad": {color: '#f1c40f', name:'Säd'},
						"olja": {color: '#B697D8', name:'Olja'},
						"sten": {color: '#808080', name:'Sten'},
						"people": {color: 'rgb(91, 192, 222)', name:'Folk'},
					},
					armyitems: {
						"Trupp": {
							name: 'Trupp',
							type: 'Trupp',
							price: {
							"people": [1],
							},
							vel: '1 fält/drag',
							veg: 'alla fält',
							range: 'Samma fält',
							rpd: 1,
							inactive: false
						},
						"Mek_infanteri": {
							name: 'Mek. infanteri',
							type: 'Mek_infanteri',
							price: {
							"sad": [1],
							"sten": [1],
							"olja": [1],
							"people": [1]
							},
							vel: '2 fält/drag',
							veg: 'öppna fält',
							range: 'Samma fält',
							capacity: '5 trupper',
							rpd: 1,
							inactive: false
						},
						"Lätt_tank": {
							name: 'Lätt tank',
							type: 'Lätt_tank',
							price: {
							"sad": [1],
							"sten": [1],
							"olja": [1],
							"people": [1]
							},
							vel: '2 fält/drag',
							veg: 'öppna fält',
							range: 'Samma fält',
							rpd: 1,
							inactive: false
						},
						"Tung_tank": {
							name: 'Tung tank',
							type: 'Tung_tank',
							price: {
							"sad": [1],
							"sten": [1,2],
							"olja": [1,2],
							"people": [1,2]
							},
							vel: '1 fält/drag',
							veg: 'öppna fält',
							range: '1 fält',
							rpd: 2,
							inactive: false
						},
						"Artilleri": {
							name: 'Artilleri',
							type: 'Artilleri',
							price: {
							"sad": [1],
							"sten": [1,2],
							"people": [1]
							},
							vel: '1 fält/drag',
							veg: 'öppna fält',
							range: '3 fält',
							rpd: 3,
							inactive: false
						},
						"Jaktplan": {
							name: 'Jaktplan',
							type: 'Jaktplan',
							price: {
							"sad": [1],
							"tra": [1],
							"olja": [1],
							"people": [1]
							},
							vel: '12cm',
							veg: 'luft',
							range: '3 fält',
							rpd: 2,
							inactive: false
						},
						"Bombplan": {
							name: 'Bombplan',
							type: 'Bombplan',
							price: {
							"sad": [1],
							"tra": [1,2,3],
							"olja": [1],
							"people": [1,2]
							},
							vel: '8cm',
							veg: 'luft',
							range: 'Samma fält',
							capacity: '5 bomber',
							rpd: 3,
							inactive: false
						},
						"Herkules": {
							name: 'Herkules',
							type: 'Herkules',
							price: {},
							vel: '8cm',
							veg: 'luft',
							range: 'Samma fält',
							capacity: '5 trupper',
							rpd: 0,
							inactive: false
						},
						"Slagskepp": {
							name: 'Slagskepp',
							type: 'Slagskepp',
							price: {
							"sad": [1],
							"tra": [1],
							"sten": [1,2],
							"olja": [1,2],
							"people": [1,2,3,4,5,6]
							},
							vel: '6cm',
							veg: 'vatten',
							range: '5cm',
							rpd: 3,
							inactive: false
						},
						"Ubåt": {
							name: 'Ubåt',
							type: 'Ubåt',
							price: {
							"sad": [1],
							"tra": [1],
							"sten": [1],
							"olja": [1],
							"people": [1,2,3,4]
							},
							vel: '6cm',
							veg: 'vatten',
							range: '5cm',
							rpd: 3,
							inactive: false
						},
						"Transportfartyg": {
							name: 'Transportfartyg',
							type: 'Transportfartyg',
							price: {
							"sad": [1],
							"tra": [1],
							"sten": [1],
							"olja": [1],
							"people": [1,2]
							},
							vel: '4cm',
							veg: 'vatten',
							capacity: '10 trupper/3 tanks',
							rpd: 0,
							inactive: false
						},
						"Hangarfartyg": {
							name: 'Hangarfartyg',
							type: 'Hangarfartyg',
							price: {
							"sad": [1],
							"sten": [1,2,3],
							"olja": [1,2,3],
							"people": [1,2,3,4,5,6]
							},
							vel: '4cm',
							veg: 'vatten',
							capacity: '5 flygplan',
							rpd: 2,
							inactive: false
						},
						"Missilramp": {
							name: 'Missilramp',
							type: 'Missilramp',
							price: {
							"sad": [1],
							"tra": [1],
							"sten": [1,2,3],
							"olja": [1]
							},
							vel: '0cm',
							veg: 'alla fält',
							range: '15cm',
							rpd: 1,
							inactive: false
						},
						"Forskare": {
							name: 'Forskare',
							type: 'Forskare',
							price: {
							"people": [1,2,3,4,5],
							"sad": [1,2,3]
							},
							// vel: '1 fält/drag',
							// veg: 'alla fält',
							// range: 'Samma fält',
							// rpd: 1,
							inactive: false
						}
					},
					buildingitems: {
						"By": {
							name: 'By',
							type: 'By',
							price: {
							"sad": [1,2],
							"tra": [1,2]
							},
							utdelning: 1,
							bonus: {"type": 'people', "antal": 1},
							info: 'Ger utdelning för angränsande fält.',
							inactive: false
						},
						"Stad": {
							name: 'Stad',
							type: 'Stad',
							price: {
							"sad": [1],
							"tra": [1,2],
							"sten": [1],
							"olja": [1]
							},
							utdelning: 2,
							bonus: {"type": 'people', "antal": 2},
							info: 'Ger utdelning för angränsande fält.',
							inactive: false
						},
						"Storstad": {
							name: 'Storstad',
							type: 'Storstad',
							price: {
							"sad": [1],
							"sten": [1,2,3],
							"olja": [1,2]
							},
							utdelning: 2,
							bonus: {"type": 'people', "antal": 3},
							info: 'Ger utdelning för angränsande fält.',
							inactive: false
						},
						"Fabrik": {
							name: 'Fabrik',
							type: 'Fabrik',
							price: {
							"sad": [1,2],
							"sten": [1],
							"olja": [1,2],
							"people": [1,2,3,4]
							},
							utdelning: 2,
							bonus: {"type": 'valfri', "antal": 1},
							info: 'Ger utdelning för angränsande fält.',
							inactive: false
						},
						"Flygplats": {
							name: 'Flygplats',
							type: 'Flygplats',
							price: {
							"sad": [1],
							"sten": [1,2],
							"olja": [1,2],
							"people": [1,2,3,4,5,6]
							},
							info: 'Möjliggör flygplans-produktion.',
							inactive: false
						},
						"Hamn": {
							name: 'Hamn',
							type: 'Hamn',
							price: {
							"sad": [1],
							"tra": [1],
							"sten": [1,2],
							"olja": [1],
							"people": [1,2,3,4]
							},
							info: 'Möjliggör fartygs-produktion, samt byteshandel med andra spelare som har hamn.',
							inactive: false
						},
						// "Oljerigg": {
						//   "tra": [],
						//   "sad": [],
						//   "olja": [],
						//   "sten": [],
						//   "djur": []
						// },
						"Universitet": {
							name: 'Universitet',
							type: 'Universitet',
							price: {
							"sad": [1,2,3],
							"tra": [1],
							"sten": [1],
							"people": [1,2,3,4]
							},
							info: 'Varje universitet har 4st forskarplatser. Forskning kostar 1 drag och kan endast ske på inköpt forskningskort. Fler forskare ökar chanserna till lyckad forskning, dvs utvecklingskort som spelas ut för 1 drag.',
							inactive: false
						},
						"Bank": {
							name: 'Bank',
							type: 'Bank',
							price: {
								"sad": [1],
								"sten": [1,2,3],
								"olja": [1,2],
								"people": [1,2,3,4]
							},
							info: 'Möjliggör växelkurs 4:1 i valfri valuta.',
							inactive: false
						},
						"Väg": {
							name: 'Väg',
							type: 'Väg',
							price: {
							"sten": [1],
							"olja": [1]
							},
							info: 'Möjliggör byggnadsplats.',
							inactive: false
						},
						"Bro": {
							name: 'Bro',
							type: 'Bro',
							price: {
							"sad": [1],
							"tra": [1,2],
							"sten": [1],
							"olja": [1]
							},
							info: 'Möjliggör rörlighet över sund.',
							inactive: false
						}
					}
				},
				starters: {
					resurser: [],
					infanteri: [],
					byggnader: []
				},
				state: {
					active: false,
					paused: true,
					dices: {
						player: '',
						a: 0,
						b: 0,
						turns: 0
					},
					gameStarted: '',
					runTimeBetweenPauses: [],
					runTime: 0,
				},
				archived: false
			};
			// let newgame = {
				// date: new Date(), 
				// name: 'Game '+(gamedbs.length+1), 
				// db: 'Game_'+c4()+'_'+c4()+'_'+c4()+'_'+c4(), 
				// players: [],
				// boardgame: {},
				// resurser: {
				// 	"tra": {color: '#1abc9c', name:'Trä'},
				// 	"sad": {color: '#f1c40f', name:'Säd'},
				// 	"olja": {color: '#B697D8', name:'Olja'},
				// 	"sten": {color: '#808080', name:'Sten'},
				// 	"people": {color: 'rgb(91, 192, 222)', name:'Folk'},
				// },
				// starters: {
				// 	resurser: [],
				// 	infanteri: [],
				// 	byggnader: []
				// },
				// active: false,
				// paused: true,
				// dices: {
				// 	player: '',
				// 	a: 0,
				// 	b: 0,
				// 	turns: 0
				// },
				// gameStarted: '',
				// runTimeBetweenPauses: [],
				// runTime: 0,
				// archived: false,
				// types: [{
				// 		name: 'Trupp',
				// 		type: 'trupp',
				// 		category: 'army',
				// 		price: {
				// 		"people": [1],
				// 		},
				// 		vel: '1 fält/drag',
				// 		veg: 'alla fält',
				// 		range: 'Samma fält',
				// 		rpd: 1,
				// 		inactive: false
				// 	},{
				// 		name: 'Mek. infanteri',
				// 		type: 'mek_infanteri',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"sten": [1],
				// 		"olja": [1],
				// 		"people": [1]
				// 		},
				// 		vel: '2 fält/drag',
				// 		veg: 'öppna fält',
				// 		range: 'Samma fält',
				// 		capacity: '5 trupper',
				// 		rpd: 1,
				// 		inactive: false
				// 	},{
				// 		name: 'Lätt tank',
				// 		type: 'latt_tank',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"sten": [1],
				// 		"olja": [1],
				// 		"people": [1]
				// 		},
				// 		vel: '2 fält/drag',
				// 		veg: 'öppna fält',
				// 		range: 'Samma fält',
				// 		rpd: 1,
				// 		inactive: false
				// 	},{
				// 		name: 'Tung tank',
				// 		type: 'tung_tank',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"sten": [1,2],
				// 		"olja": [1,2],
				// 		"people": [1,2]
				// 		},
				// 		vel: '1 fält/drag',
				// 		veg: 'öppna fält',
				// 		range: '1 fält',
				// 		rpd: 2,
				// 		inactive: false
				// 	},{
				// 		name: 'Artilleri',
				// 		type: 'artilleri',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"sten": [1,2],
				// 		"people": [1]
				// 		},
				// 		vel: '1 fält/drag',
				// 		veg: 'öppna fält',
				// 		range: '3 fält',
				// 		rpd: 3,
				// 		inactive: false
				// 	},{
				// 		name: 'Jaktplan',
				// 		type: 'jaktplan',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"tra": [1],
				// 		"olja": [1],
				// 		"people": [1]
				// 		},
				// 		vel: '12cm',
				// 		veg: 'luft',
				// 		range: '3 fält',
				// 		rpd: 2,
				// 		inactive: false
				// 	},{
				// 		name: 'Bombplan',
				// 		type: 'bombplan',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"tra": [1,2,3],
				// 		"olja": [1],
				// 		"people": [1,2]
				// 		},
				// 		vel: '8cm',
				// 		veg: 'luft',
				// 		range: 'Samma fält',
				// 		capacity: '5 bomber',
				// 		rpd: 3,
				// 		inactive: false
				// 	},{
				// 		name: 'Herkules',
				// 		type: 'herkules',
				// 		category: 'army',
				// 		price: {},
				// 		vel: '8cm',
				// 		veg: 'luft',
				// 		range: 'Samma fält',
				// 		capacity: '5 trupper',
				// 		rpd: 0,
				// 		inactive: false
				// 	},{
				// 		name: 'Slagskepp',
				// 		type: 'slagskepp',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"tra": [1],
				// 		"sten": [1,2],
				// 		"olja": [1,2],
				// 		"people": [1,2,3,4,5,6]
				// 		},
				// 		vel: '6cm',
				// 		veg: 'vatten',
				// 		range: '5cm',
				// 		rpd: 3,
				// 		inactive: false
				// 	},{
				// 		name: 'Ubåt',
				// 		type: 'ubat',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"tra": [1],
				// 		"sten": [1],
				// 		"olja": [1],
				// 		"people": [1,2,3,4]
				// 		},
				// 		vel: '6cm',
				// 		veg: 'vatten',
				// 		range: '5cm',
				// 		rpd: 3,
				// 		inactive: false
				// 	},{
				// 		name: 'Transportfartyg',
				// 		type: 'transportfartyg',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"tra": [1],
				// 		"sten": [1],
				// 		"olja": [1],
				// 		"people": [1,2]
				// 		},
				// 		vel: '4cm',
				// 		veg: 'vatten',
				// 		capacity: '10 trupper/3 tanks',
				// 		rpd: 0,
				// 		inactive: false
				// 	},{
				// 		name: 'Hangarfartyg',
				// 		type: 'hangarfartyg',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"sten": [1,2,3],
				// 		"olja": [1,2,3],
				// 		"people": [1,2,3,4,5,6]
				// 		},
				// 		vel: '4cm',
				// 		veg: 'vatten',
				// 		capacity: '5 flygplan',
				// 		rpd: 2,
				// 		inactive: false
				// 	},{
				// 		name: 'Missilramp',
				// 		type: 'missilramp',
				// 		category: 'army',
				// 		price: {
				// 		"sad": [1],
				// 		"tra": [1],
				// 		"sten": [1,2,3],
				// 		"olja": [1]
				// 		},
				// 		vel: '0cm',
				// 		veg: 'alla fält',
				// 		range: '15cm',
				// 		rpd: 1,
				// 		inactive: false
				// 	},{
				// 		name: 'By',
				// 		type: 'by',
				// 		category: 'building',
				// 		price: {
				// 		"sad": [1,2],
				// 		"tra": [1,2]
				// 		},
				// 		utdelning: 1,
				// 		bonus: {"type": 'people', "antal": 1},
				// 		info: 'Ger utdelning för angränsande fält.',
				// 		inactive: false
				// 	},{
				// 		name: 'Stad',
				// 		type: 'stad',
				// 		category: 'building',
				// 		price: {
				// 		"sad": [1],
				// 		"tra": [1,2],
				// 		"sten": [1],
				// 		"olja": [1]
				// 		},
				// 		utdelning: 2,
				// 		bonus: {"type": 'people', "antal": 2},
				// 		info: 'Ger utdelning för angränsande fält.',
				// 		inactive: false
				// 	},{
				// 		name: 'Storstad',
				// 		type: 'storstad',
				// 		category: 'building',
				// 		price: {
				// 		"sad": [1],
				// 		"sten": [1,2,3],
				// 		"olja": [1,2]
				// 		},
				// 		utdelning: 2,
				// 		bonus: {"type": 'people', "antal": 3},
				// 		info: 'Ger utdelning för angränsande fält.',
				// 		inactive: false
				// 	},{
				// 		name: 'Fabrik',
				// 		type: 'fabrik',
				// 		category: 'building',
				// 		price: {
				// 		"sad": [1,2],
				// 		"sten": [1],
				// 		"olja": [1,2],
				// 		"people": [1,2,3,4]
				// 		},
				// 		utdelning: 2,
				// 		bonus: {"type": 'valfri', "antal": 1},
				// 		info: 'Ger utdelning för angränsande fält.',
				// 		inactive: false
				// 	},{
				// 		name: 'Flygplats',
				// 		type: 'flygplats',
				// 		category: 'building',
				// 		price: {
				// 		"sad": [1],
				// 		"sten": [1,2],
				// 		"olja": [1,2],
				// 		"people": [1,2,3,4,5,6]
				// 		},
				// 		info: 'Möjliggör flygplans-produktion.',
				// 		inactive: false
				// 	},{
				// 		name: 'Hamn',
				// 		type: 'hamn',
				// 		category: 'building',
				// 		price: {
				// 		"sad": [1],
				// 		"tra": [1],
				// 		"sten": [1,2],
				// 		"olja": [1],
				// 		"people": [1,2,3,4]
				// 		},
				// 		info: 'Möjliggör fartygs-produktion, samt byteshandel med andra spelare som har hamn.',
				// 		inactive: false
				// 	},
				// 	// "Oljerigg": {
				// 	//   "tra": [],
				// 	//   "sad": [],
				// 	//   "olja": [],
				// 	//   "sten": [],
				// 	//   "djur": []
				// 	// },
				// 	{
				// 		name: 'Universitet',
				// 		type: 'universitet',
				// 		category: 'building',
				// 		price: {
				// 		"sad": [1,2,3],
				// 		"tra": [1],
				// 		"sten": [1],
				// 		"people": [1,2,3,4]
				// 		},
				// 		info: 'Lyckad forskning ger utvecklingskort.',
				// 		inactive: false
				// 	},{
				// 		name: 'Väg',
				// 		type: 'vag',
				// 		category: 'building',
				// 		price: {
				// 		"sten": [1],
				// 		"olja": [1]
				// 		},
				// 		info: 'Möjliggör byggnadsplats.',
				// 		inactive: false
				// 	},{
				// 		name: 'Bro',
				// 		type: 'bro',
				// 		category: 'building',
				// 		price: {
				// 		"sad": [1],
				// 		"tra": [1,2],
				// 		"sten": [1],
				// 		"olja": [1]
				// 		},
				// 		info: 'Möjliggör rörlighet över sund.',
				// 		inactive: false
				// 	}
				// ]
			// };
			let insert = await r.db('Main').table('Games').insert(newgame).run(connection)
			console.log('Insert game: ', newgame.db)
			newgame.id = insert.generated_keys[0];
			createNewGameDatabase(newgame)
			
			console.log('New Game created: %s',newgame.name)
			getGames();
		} catch(err){
			console.log('Error msg: ',err)
			socket.emit('notify', {title:'Database error:', msg: err })
		} 
	})

	async function createNewGameDatabase(newgame){
		try{
			let db = await r.dbCreate(newgame.db).run(connection);
			let resurser = await r.db(newgame.db).tableCreate('Resurser').run(connection);
			let byggnader = await r.db(newgame.db).tableCreate('Byggnader').run(connection);
			let infanteri = await r.db(newgame.db).tableCreate('Infanteri').run(connection);
			// let types = await r.db(newgame.db).tableCreate('Types').run(connection);
			let turer = await r.db(newgame.db).tableCreate('Turer').run(connection);
			let modals = await r.db(newgame.db).tableCreate('Modals').run(connection);
			let indexering = await r.db(newgame.db).table('Turer').indexCreate('timeIndex', r.row("time")("start")).run(connection);
			// let eventkort = await r.db(newgame.db).tableCreate('Events').run(connection);
			// let players = await r.db(newgame.db).tableCreate('Players').run(connection);
			socket.emit('newGameCreated', newgame)
		}catch(err){
			if(err) console.log('Error msg: ',err)
		}
	}

	socket.on('saveGameSettings', async function(game){
		let update = await r.db('Main').table('Games').get(game.id).update(game).run(connection);
		if(update.errors){
			
		}else{
			getGames();
		}
	})

	socket.on('activateGame', async function(game){
		r.db('Main').table('Games').get(game.id).update({state:{active: true}}).run(connection);
		game.players.map(player=>{
			try{
				game.starters.resurser.map(res=>{
					res.username = player.username;
					r.db(game.db).table('Resurser').insert(res).run(connection);
				})

				game.starters.byggnader.map(byggnad=>{
					byggnad.username = player.username;
					if(byggnad.type!='Väg'&&byggnad.type!='Bro'){
						let insert = r.db(game.db).table('Byggnader').insert(byggnad).run(connection);
					}else{
						socket.emit('notify', {title: player.name+'!', msg: 'Du har 1 '+byggnad.type+'!'})
					}
				})
				
				game.starters.infanteri.map(infanteri=>{
					infanteri.username = player.username;
					let insert = r.db(game.db).table('Infanteri').insert(infanteri).run(connection);
				})

			}catch(err){console.log('Error msg: ',err)}
		})
		//game.players[0]
		try{
			// game.types.map(item=>{
			// 	item.username = 'all';
			// 	r.db(game.db).table('Types').insert(item).run(connection);
			// })
			let firstturn = await r.db(game.db).table('Turer').insert(newTurn(game.players[0])).run(connection)
		}catch(err){console.log('Error msg:',err)}
		
	})

	socket.on('dropGameDb', async function(game){
		let c = await r.db('Main').table('Games').get(game.id).delete().run(connection);
		c = await r.dbDrop(game.db).run(connection);
		getGames();
	})

	socket.on('getUser', async function(q){
		try{
			let cursor = await r.db('Main').table('Users').filter({username: q.username}).run(connection);
			let user = await cursor.toArray();
			
			if(user[0]){socket.emit('addUser', user[0]);}
		}catch(err){console.log('Error msg: ',err)}
	})

	socket.on('getGame', (id)=>{getGame(id)})

	socket.on('pauseToggle', async function (q){
		try{
			let update = await r.db('Main').table('Games').get(q.id).update({state:{paused: q.paused}}).run(connection)
			getGame(q.id)
		}catch(err){console.log('Error msg: ',err)}
	})
	




	/***** Login *****/

	socket.on('checkUser', async function(data){
		// let cursor = await r.db('Main').table('Users').filter({username:data.username}).run(connection)
		let cursor = await r.db('Main').table('Games')
				.get(data.id)
				.pluck('players')('players')
				.filter({username: data.username})
				.run(connection);
		let users = await cursor.toArray();
		let user = users[0]
		if(user&&user.username == data.username){
			console.log('User: %s', user.name );
			socket.emit('user_exists', true)
		}
	})

	socket.on('checkPass', async function(data){
		data.pin = data.pin ? data.pin.toString():'0';
		try {
			// let cursor = await r.db('Main').table('Users').filter({username: data.username, pin: Number.parseInt(data.pin)}).run(connection);
			let cursor = await r.db('Main').table('Games')
				.get(data.id)
				.pluck('players')('players')
				.filter({username: data.username, pin: Number.parseInt(data.pin)})
				.run(connection);
			let users = await cursor.toArray();
			let user = users[0]
			if(user&&user.username == data.username){
				console.log('User: %s pin: %d', user.username, data.pin );
				socket.emit('authorized', true)
			}
		}catch(err){console.log('Error msg: ',err)}
	})

	socket.on('login', async function(data){
		console.log('Login: %s pin: %d', data.username, data.pin );
		// let cursor = await r.db('Main').table('Users').filter({username: data.username, pin: Number.parseInt(data.pin)}).run(connection);
		try {
			let cursor = await r.db('Main').table('Games')
				.get(data.id)
				.pluck('players')('players')
				.filter({username: data.username, pin: Number.parseInt(data.pin)})
				.run(connection);
			let users = await cursor.toArray();
			let user = users[0]
			if(user&&user.username == data.username){
				socket.emit('login', user)
			}
		}catch(err){console.log('Error msg: ',err)}
	})

	socket.on('registration', function(data){
		console.log('Login: %s pin: %d', data.username, data.pin );
		if(data&&data.username && data.pin){
			socket.emit('registration_done', true)
		}
	})





	/***** Builder *****/

	r.db('Boards').table('Pieces').changes().run(connection, function(err, cursor) {
		try{
			cursor.each(function(err,change){
				socket.emit('boardpiecesChanges', change)
			});
		}catch(err){
			console.log('Error msg: ',err)
		}
	});
	
	r.db('Boards').table('Boards').changes().run(connection, function(err, cursor) {
		try{
			cursor.each(function(err,change){
				socket.emit('boardgamesChanges', change)
			});
		}catch(err){
			console.log('Error msg: ',err)
		}
	});

	socket.on('getDbBuilderData', async function(){
		try{
			let bps_cursor = await r.db('Boards').table('Pieces').orderBy('name').run(connection);
			let bgs_cursor = await r.db('Boards').table('Boards').run(connection);
			if(bps_cursor.errors || bgs_cursor.errors ){ throw 'Something went wrong. Data not loaded...'}
			let result = {
				boardpieces: await bps_cursor.toArray(), 
				boardgames: await bgs_cursor.toArray()
			}
			socket.emit('receiveBuilderData', result)
		}catch(err){console.log('Error msg: ',err)}
	})

	socket.on('saveBoardpiece', async function(boardpiece){
		try{
			let bp = await r.db('Boards').table('Pieces').get(boardpiece.id).run(connection);
			let result = {}
			if(!bp){
				result = await r.db('Boards').table('Pieces').insert(boardpiece).run(connection)
			}else{
				result = await r.db('Boards').table('Pieces').update(boardpiece).run(connection)
			}
			if(result.errors || !result){ throw 'Something went wrong. Data not saved...'}
		}catch(err){console.log('Error msg: ',err)}
	})

	socket.on('saveBoardgame', async function(boardgame){
		try{
			let bg = await r.db('Boards').table('Boards').get(boardgame.id).run(connection);
			let result = {}
			if(!bg){
				result = await r.db('Boards').table('Boards').insert(boardgame).run(connection)
			}else{
				result = await r.db('Boards').table('Boards').update(boardgame).run(connection)
			}
			if(result.errors || !result){ throw 'Something went wrong. Data not saved...'}
		}catch(err){console.log('Error msg: ',err)}
	})

	socket.on('deleteboardpiece', function(bp){
      r.db('Boards').table('Pieces').get(bp.id).delete().run(connection);
	})
	
    socket.on('deleteboardgame', function(bg){
      r.db('Boards').table('Boards').get(bg.id).delete().run(connection);
	})
	


});

// server.listen(port, function(){
// 	console.log('Socket.io is listening on port 53001')
// }); 

server.listen(port, function() {
	console.log('Socket.io server up and running at %s port', port);
});