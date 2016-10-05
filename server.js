

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var r = require('rethinkdb');
var session = require('express-session');
var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'static')));
app.use(session({
	secret: 'S377R15K',
	saveUninitialized: true,
	resave: true,
	cookie: { maxAge: 86400000 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// rethinkdb
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

var games = [];
//node.js server http requests
app.get('/', function(req, res) {
	if(req.session.user ){
		res.render('index', {user: req.session.user});
	} 
	if(!req.session.user){
		r.db('main').table('games').run(connection, function(err, cursor){
			if(!err){
				cursor.toArray(function(err, array){
					games = array;
					res.render('index', {user: {}, games: array});
				})
			}else{console.log(err)}
		})
	}
});
app.get('/logout', function(req, res) {
	req.session.user = undefined;
	res.redirect('/');
});

var tables = ['resurser','priser','infanteri','byggnader','nationer','handelsekort','utvacklingskort','events'];

app.post('/game', function(req, res) {
	var name = 'game_'+(games.length+1);
	r.db('main').table('games').insert({name: name, date: r.now()}).run(connection, function(err){ console.log(err) })
	r.dbCreate(name).run(connection, function(err){
		if(!err){
			r.db(name).tableCreate('users').run(connection, function(err){ console.log(err) })
			for(i in tables){
				r.db(name).tableCreate(tables[i]).run(connection, function(err){ console.log(err) })
				// if(tables[i]=='events'){ }
			}
			res.redirect('/')
		}
	})
});

app.post('/dropgame', function(req, res) {
	console.log(req.query);
	r.db('main').table('games').get(req.query.id).delete().run(connection, function(err){ console.log(err) })
	r.dbDrop(req.query.game).run(connection, function(err){
		if(!err){
			res.redirect('/')
		}
	})
});

app.post('/session', function(req, res) {
	var user = req.query;
	console.log("New session: "+user.username);
	console.log(user);
	req.session.user = user;
	res.send(true);
});


// socket.io
var connections = [];

io.sockets.on('connection', function(socket){

	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);
	console.log('Handshake: '+socket.handshake.query.username);

	socket.user = {username: socket.handshake.query.username, game: socket.handshake.query.game};

	socket.on('register', function(user){
		socket.user.game=user.game;
		console.log(user);
		// getUsers();
		check({game: user.game, username: user.username, password: user.password}, function(authorized){
			if (!authorized){
				getUsers(function(){
					var index = socket.users.length;
					r.db(user.game).table('users').insert({username: user.username, password: user.password, index: index, game: user.game }).run(connection, function(err, cursor){
						if(!err){
							user.authorized = true;
							user.index = index;
							socket.user = user;
							console.log('Registered: '+socket.user.username)
							initiate(function(){
								socket.emit('authorized', socket.user );
							})
							// r.db(socket.user.game).table('users').filter({username: socket.user.username}).update({online: true}).run(connection, function(err){
							// 	err ? console.log(err) : io.sockets.emit('users') ;
							// });
						} else { console.log(err) }
					});
				});
				
				r.db(user.game).table('resurser').insert({
					username: user.username,
					resurser: {
						"trä": [1,2,3],
						"säd": [1,2],
						"olja": [1],
						"sten": [1,2,3],
						"djur": [1,2],
						"invånare": [1,2,3,4]
					}
				}).run(connection, function(err, cursor){
					if(!err){ } else { console.log(err) }	
				});
				r.db(user.game).table('priser').insert({
					username: user.username,
					priser: {
						"infanteri": {
						    "trupp": {
						      "trä": [],
						      "säd": [1],
						      "olja": [],
						      "sten": [],
						      "djur": [1],
							  "invånare": []
						    },
						    "tung tank": {
						      "trä": [],
						      "säd": [1],
						      "olja": [1,2],
						      "sten": [],
						      "djur": [1],
							  "invånare": []
						    },
						    "lätt tank": {
						      "trä": [],
						      "säd": [1],
						      "olja": [1,2],
						      "sten": [],
						      "djur": [1],
							  "invånare": []
						    },
						    "slagskepp": {
						      "trä": [1,2],
						      "säd": [],
						      "olja": [1],
						      "sten": [],
						      "djur": [],
							  "invånare": []
						    }
						},
						"byggnader": {
						    "stad": {
						      "trä": [],
						      "säd": [1,2],
						      "olja": [],
						      "sten": [1,2,3],
						      "djur": [],
							  "invånare": []
						    },
						    "by": {
						      "trä": [1],
						      "säd": [1],
						      "olja": [1],
						      "sten": [],
						      "djur": [1],
							  "invånare": []
						    },
						    "fabrik": {
						      "trä": [1],
						      "säd": [1,2],
						      "olja": [],
						      "sten": [1,2],
						      "djur": [],
							  "invånare": []
						    },
						    "flygplats": {
						      "trä": [1],
						      "säd": [],
						      "olja": [1,2,3],
						      "sten": [1,2],
						      "djur": [],
							  "invånare": []
						    },
						    "hamn": {
						      "trä": [1],
						      "säd": [1],
						      "olja": [1],
						      "sten": [],
						      "djur": [],
							  "invånare": []
						    },
						    "oljerigg": {
						      "trä": [],
						      "säd": [],
						      "olja": [],
						      "sten": [],
						      "djur": [],
							  "invånare": []
						    },
						    "universitet": {
						      "trä": [],
						      "säd": [],
						      "olja": [],
						      "sten": [],
						      "djur": [],
							  "invånare": []
						    },
						    "väg": {
						      "trä": [1],
						      "säd": [],
						      "olja": [1],
						      "sten": [],
						      "djur": [],
							  "invånare": []
						    },
						    "bro": {
						      "trä": [1,2],
						      "säd": [],
						      "olja": [1],
						      "sten": [],
						      "djur": [],
							  "invånare": []
						    }
						}
					},
					"utdelning": {
						"by": [1],
						"stad": [1,2],
						"fabrik": [1,2,3]
					},
					"bonus": {
						"by": {
							"invånare": [1],
							"valfri": []
						},
						"stad": {
							"invånare": [1,2],
							"valfri": []
						},
						"fabrik": {
							"invånare": [],
							"valfri": [1]
						}
					}
				}).run(connection, function(err, cursor){
					if(!err){ } else { console.log(err) }
				});
				r.db(user.game).table('infanteri').insert({
					username: user.username,
					infanteri: {
					    "trupp": [],
					    "lätt tank": [],
					    "tung tank": [],
					    "slagskepp": []
					}
				}).run(connection, function(err, cursor){
					if(!err){ } else { console.log(err) }
				});
				// r.db(user.game).table('byggnader').insert({
				// 	username: user.username,
				// 	byggnader: []
				// }).run(connection, function(err, cursor){
				// 	if(!err){ } else { console.log(err) }
				// });
				//lägg till alla tables!
	
				
			}
		});
	})

	socket.on('login', function(user){
		check({game: user.game, username: user.username, password: user.password}, function(authorized){
			user.authorized = authorized;
			if(authorized){
				setUser(user, function(){
					console.log('Logged in: '+socket.user.username)
					initiate(function(){
						socket.emit('authorized', socket.user );
					})
					socket.emit('authorized', socket.user );
					console.log('Authorized: '+socket.user.username)
				});
			}
			socket.user = user;
			
			// r.db(socket.user.game).table('users').filter({username: socket.user.username}).update({online: true}).run(connection);
		});
	})

	socket.on('check', function(user){
		check(user, function(authorized){
			var check = user.password ? 'password' : 'username' ;
			authorized ? socket.emit(check, true) : socket.emit(check, false);
			console.log('Cecked '+check+': '+user.username)
		});
	})

	var check = function(user, callback){
		var query = {};
		query.username = user.username;
		if(user.password){ query.password = user.password }
		r.db(user.game).table('users').filter(query).run(connection, function(err, cursor){
			if(!err){
				cursor.toArray(function(err, data){
					data[0] ? callback(true) : callback(false);
				})
			} else {
				console.log(err);
				callback(false);
			}
		})
	}

	var setListeners = function(callback){
		console.log('Setting listener: '+socket.user.username+' resurser');
		callback();
		r.db(socket.user.game).table( 'resurser' ).filter({username: socket.user.username}).changes().run(connection, function(err, cursor){
			if(!err){
				cursor.each(function(err, data){
				    socket.emit( 'resurser' , data.new_val);
				    socket.user.resurser = data.new_val.resurser;
				})
			} else {console.log(err)}
		})
		console.log('Setting listener: '+socket.user.username+' priser');
		r.db(socket.user.game).table( 'priser' ).filter({username: socket.user.username}).changes().run(connection, function(err, cursor){
			if(!err){
				cursor.each(function(err, data){
				    socket.emit( 'priser' , data.new_val);
				    socket.user.priser = data.new_val.priser;
				    socket.user.utdelning = data.new_val.utdelning;
				    socket.user.bonus = data.new_val.bonus;
				})
			} else {console.log(err)}
		})
		console.log('Setting listener: '+socket.user.username+' infanteri');
		r.db(socket.user.game).table( 'infanteri' ).filter({username: socket.user.username}).changes().run(connection, function(err, cursor){
			if(!err){
				cursor.each(function(err, data){
				    socket.emit( 'infanteri' , data.new_val);
				    socket.user.infanteri = data.new_val.infanteri;
				})
			} else {console.log(err)}
		})
		console.log('Setting listener: '+socket.user.username+' byggnader');
		r.db(socket.user.game).table( 'byggnader' ).filter({username: socket.user.username}).changes().run(connection, function(err, cursor){
			if(!err){
				cursor.each(function(err, data){
					console.log('Listener byggnader:')
				    socket.emit( 'update_byggnad' , {new_val: data.new_val, old_val: data.old_val});
				    // socket.user.byggnader[socket.user.byggnader.indexOf(data.old_val) || 0 ] = data.new_val;
				})
			} else {console.log(err)}
		})
		console.log('Setting listener: '+socket.user.username+' player');
		r.db(socket.user.game).table( 'users' ).filter({username: socket.user.username}).changes().run(connection, function(err, cursor){
			if(!err){
				cursor.each(function(err, data){
					console.log('Listener player:')
				    socket.emit( 'player' , data.new_val);
				    // socket.user.byggnader[socket.user.byggnader.indexOf(data.old_val) || 0 ] = data.new_val;
				})
			} else {console.log(err)}
		})
		console.log('Setting listener: '+socket.user.username+' events');
		r.db(socket.user.game).table( 'events' ).changes().run(connection, function(err, cursor){
			if(!err){
				cursor.each(function(err){
					r.db(socket.user.game).table( 'events' ).orderBy({index: r.desc('time')}).limit(7).run(connection, function(err, cursor){
						if(!err){
							cursor.toArray(function(err, data){
								// console.log(datana);
								console.log('last dice set:')
								console.log(data[0]);
								socket.lastdice = data[0];
								socket.emit('notify',{note: socket.lastdice.username+' kastade '+socket.lastdice.dices+'.', lines: 1});
								socket.emit( 'events' , data);
							});
						} else {console.log(err)}
					})		
				})
			} else {console.log(err)}
		})

		// Add listeners


	}

	socket.on('nationer',function(user, nation){
		
		var updateNation = function(nation){
			console.log('Updating: '+socket.user.username+' nation '+nation.index);
			r.db(socket.user.game).table( 'byggnader' ).filter({username: socket.user.username, nation: nation.index}).run(connection, function(err, cursor){
				if(!err){
					cursor.toArray(function(err, data){
						console.log('Listener nation: '+nation.index)
						console.log(data);
						if(data[0]){
							constructNation(data, nation.index, function(new_nation){
								console.log('update_nation: '+nation.index)
								socket.emit( 'update_nation' , {nation: new_nation, index: new_nation.index});
							});
						}else{
							socket.emit( 'update_nation' , {nation: undefined, index: nation.index});
						}
					})
				} else {console.log(err)}
			})
		}
		if(nation){
			updateNation(nation);
		}else{
			getTable('byggnader', function(byggnader){
				var nationer = [];
				byggnader.map(function(byggnad){
					if(byggnad.nation){nationer.push(byggnad.nation)}
				});
				nationer = nationer.sort().filter(function(d,i,a){return d!=a[i-1];});
				nationer.map(function(index){
					updateNation({index: index});
				})
			})
		}
	});

	var getTable = function(table, callback){
		console.log(socket.user);
		r.db(socket.user.game).table(table).filter({username: socket.user.username}).run(connection, function(err, cursor){
			if(!err){
				cursor.toArray(function(err, data){
					console.log('Getting '+table);
					if(data[0]&&data[0][table]){
						socket.user[table] = data[0][table];
					}else{
						socket.user[table] = data;
					}
					// socket.emit(table, data[0]);
					if(callback){callback(data);}
				})
			} else {console.log(err)}
		})
	}
	var getUsers = function(callback){
		r.db(socket.user.game).table('users').run(connection, function(err, cursor){
			if(!err){
				cursor.toArray(function(err, data){
					socket.users = data;
					if(callback){callback()}
				})
			} else {console.log(err)}
		})
	}
	var setUser = function(user, callback){
		var query = {};
		query.username = user.username;
		if(user.password){ query.password = user.password }
		r.db(user.game).table('users').filter(query).run(connection, function(err, cursor){
			if(!err){
				cursor.toArray(function(err, data){
					console.log('Set user');
					socket.user = data[0];
					socket.user.authorized = true;
					callback();
				})
			} 
		})
	}
	// var getPriser = function(callback){
	// 	console.log(socket.user);
	// 	r.db(socket.user.game).table('priser').filter({username: socket.user.username}).run(connection, function(err, cursor){
	// 		if(!err){
	// 			cursor.toArray(function(err, data){
	// 				socket.user.priser = data[0].priser;
	// 				socket.emit('priser', data[0]);
	// 				if(callback){callback(data);}
	// 			})
	// 		} else {console.log(err)}
	// 	})
	// }

	var initiate = function(callback){
		setUser(socket.user, function(){
			r.db(socket.user.game).table( 'events' ).orderBy({index: r.desc('time')}).limit(7).run(connection, function(err, cursor){
				if(!err){
					cursor.toArray(function(err, data){
						// console.log(datana);
						if(data[0]){
							console.log('last dice set:')
							console.log(data[0]);
							socket.lastdice = data[0];
							if(socket.lastdice.username==socket.user.username){ socket.emit( 'dices' , socket.lastdice) }
								else{socket.lastdice = {username: 'bank'};}
							socket.emit( 'events' , data);
						}else{
							socket.lastdice = {username: 'bank'};
						}
					});
				} else {console.log(err)}
			})
			socket.emit('authorized', socket.user );
			socket.emit('player', socket.user )
			getTable('resurser', function(){
				getTable('priser', function(){
					getTable('infanteri', function(){
						setListeners(function(){
							socket.emit('resurser', socket.user)
							socket.emit('priser', socket.user)
							socket.emit('infanteri', socket.user)
							r.db(socket.user.game).table('users').filter({username: socket.user.username}).update({online: true}).run(connection, function(err){
								getUsers(function(){
									err ? console.log(err) : io.sockets.emit('users', socket.users) ;
									if(callback){callback();}
								})
							});
						}); 
					}); 
				});
			});
		});
	}
	if(socket.user.username && socket.user.game){
		initiate()
	}

	socket.on('resurser',function(){
		getTable('resurser', function(data){
			socket.emit('resurser', data[0]);
		})
	});
	socket.on('priser',function(){
		getTable('priser', function(data){
			socket.emit('priser', data[0]);
		})
	});

	socket.on('buy_infanteri', function(item){
		console.log(item);
		keys = Object.keys(socket.user.priser.infanteri[item])
		console.log(keys);
		keys.map(function(res){
			if(socket.user.resurser[res][0]){
				socket.user.priser.infanteri[item][res].map(function(){
					socket.user.resurser[res].pop();
				})
			}else{
				getTable('resurser')
				socket.emit('notify',{note: 'Tyvärr, du har inte råd!', lines: 1})
				return
			}
		})
		var query = 'r.db("'+socket.user.game+'").table("infanteri").filter({username: "'+socket.user.username+'"}).update({infanteri:{'+item+': r.row.getField("infanteri")("'+item+'").append({time: r.now()})}}).run(connection, function(err){console.log(err)})';
		eval(query);
		r.db(socket.user.game).table('resurser').filter({username: socket.user.username}).update({resurser: socket.user.resurser}).run(connection, function(err){
			if(!err){
				socket.emit('notify',{note: 'Du har köpt en '+item+'.', lines: 1})
			}else{
				console.log(err)
			}
		});
	})

	socket.on('buy_byggnad', function(item){
		console.log(item);
		keys = Object.keys(socket.user.priser.byggnader[item])
		keys.map(function(res){
			if(socket.user.resurser[res][0]){
				socket.user.priser.byggnader[item][res].map(function(){
					socket.user.resurser[res].pop();
				})
			}else{
				getTable('resurser')
				socket.emit('notify',{note: 'Tyvärr, du har inte råd!', lines: 1})
				return
			}
		})
		// var query = 'r.db("'+socket.user.game+'").table("byggnader").filter({username: "'+socket.user.username+'"}).update({byggnader: r.row.getField("byggnader").append({time: r.now(), player:"'+socket.user.username+'", type:"'+item+'", nation: false, marker:[] }) }).run(connection, function(err){console.log(err)})';
		// var query = 'r.db("'+socket.user.game+'").table("byggnader").insert({time: r.now(), username:"'+socket.user.username+'", type:"'+item+'", nation: false, marker:[] }).run(connection, function(err){console.log(err)})';
		var utdelning = {
			by: [1],
			stad: [1,2],
			fabrik: [1,2,3]
		};
		var utdelning = socket.user.utdelning;
		var utd = [];
		utdelning[item] ? utd = utdelning[item] : 'pass' ;
		r.db(socket.user.game).table("byggnader").insert({time: r.now(), username: socket.user.username, type: item, nation: false, marker:[{mark: "", nr: "?", value: "?"}], utdelning: utd }).run(connection, function(err){
			console.log('Get byggnader');
			r.db(socket.user.game).table('byggnader').filter({username: socket.user.username}).run(connection, function(err, cursor){
				if(!err){
					cursor.toArray(function(err, data){
						socket.user.byggnader = data;
						socket.emit('byggnader', data);
					})
				} else {console.log(err)}
			})
			console.log(err)
		})
		// eval(query);
		r.db(socket.user.game).table('resurser').filter({username: socket.user.username}).update({resurser: socket.user.resurser}).run(connection, function(err){
			if(!err){
				socket.emit('notify',{note: 'Du har köpt en '+item+'.', lines: 1})
			}else{
				console.log(err)
			}
		});
	})
	
	socket.on('infanteri',function(){
		getTable('infanteri', function(data){
		    socket.emit('infanteri', data[0]);
		})
	});
	socket.on('byggnader',function(data){
	    console.log('Get byggnader');
		r.db(socket.user.game).table('byggnader').filter({username: socket.user.username}).run(connection, function(err, cursor){
			if(!err){
				cursor.toArray(function(err, data){
					socket.user.byggnader = data;
					socket.emit('byggnader', data);
				})
			} else {console.log(err)}
		})
	});
	socket.on('byggnad_change_mark', function(data){
		console.log(data);
		r.db(socket.user.game).table('byggnader').get(data.id).run(connection, function(err, datan){
			console.log(datan);
			var update = [];
			[0,1,2].map(function(i){ if(i==data.updateMark.index){update[i] = data.updateMark}else if(datan.marker[i]){update[i] = datan.marker[i]} });
			console.log(update);
			r.db(socket.user.game).table('byggnader').get(data.id).update({marker: update}).run(connection);
			r.db(socket.user.game).table('byggnader').get(data.id).update({p: update.length}).run(connection);
		});
	});

	socket.on('set nation to byggnad', function(data){
    	r.db(socket.user.game).table('byggnader').get(data.byggnad_id).update({nation: data.nation}).run(connection);
	})
	socket.on('nation bonus',function(data){
		console.log('nation bonus')
    	r.db(socket.user.game).table('byggnader').get(data.byggnad_id).update({bonus: data.bonus}).run(connection);
	});
	socket.on('occupied',function(data){
		console.log('occupied');
    	r.db(socket.user.game).table('byggnader').get(data.byggnad_id).run(connection, function(err, byggnad){
    		if(!err){
    			var nya_marker = [];
    			nya_marker = byggnad.marker.map(function(mark){
    				console.log(mark.value==data.value)
	    			if(mark.value==data.value){ mark.occupied = data.occupied; }
	    			return mark; 
    			});
    			console.log(byggnad.marker);
    			r.db(socket.user.game).table('byggnader').get(data.byggnad_id).update({marker: nya_marker}).run(connection, function(err){console.log(err)});
    		}
    	});
	});
	socket.on('utväcklingskort',function(user){
    	// socket.emit('utväcklingskort', socket.user.utvacklingskort);

	});
	socket.on('users',function(){
		getUsers(function(data){
			socket.emit('users', socket.users);
		})
	});
	socket.on('trade', function(query){
		if(socket.user.game && query){
			console.log('Trade '+query.type);
			// q = "r.db(socket.user.game).table('resurser').filter({username: '"+query.to+"'}).update({resurser:{"+query.type+": r.row('resurser')('"+query.type+"').append(r.row('resurser')('"+query.type+"').count()) }}).run(connection, function(err){console.log(err)});"
			// q2 = "r.db(socket.user.game).table('resurser').filter({username: '"+query.from+"'}).update({resurser:{"+query.type+": r.row('resurser')('"+query.type+"').slice(0,-1) }}).run(connection, function(err){console.log(err)});"
			// io.sockets.emit('notify',{note: query.from+' skickar '+query.type+' till '+query.to+'.', lines: 2});
			// eval(q);
			// eval(q2);
			delResurs(query);

			addResurs(query, function(){
				io.sockets.emit('notify',{note: query.from+' skickar '+query.type+' till '+query.to+'.', lines: 2});
			});
		} else {
			io.sockets.emit('notify',{note: 'Error. Please reload app. '+socket.user.username, lines: 2});
		}
	})
	var addResurs = function(query, callback){
		var q = "r.db(socket.user.game).table('resurser').filter({username: '"+query.to+"'}).update({resurser:{"+query.type+": r.row('resurser')('"+query.type+"').append(r.row('resurser')('"+query.type+"').count()) }}).run(connection, function(err){console.log(err)});"
		eval(q);
		if(callback){callback()}
	}
	var delResurs = function(query, callback){
		var q = "r.db(socket.user.game).table('resurser').filter({username: '"+query.from+"'}).update({resurser:{"+query.type+": r.row('resurser')('"+query.type+"').slice(0,-1) }}).run(connection, function(err){console.log(err)});"
		eval(q);		
		if(callback){callback()}
	}

	var logEvent = function(event){
		event.time = r.now();
		r.db(socket.user.game).table('events').insert(event).run(connection);
	}

	socket.on('skicka_byggnad', function(query){
		console.log('Skicka '+query.type);
		r.db(socket.user.game).table('byggnader').get(query.byggnad_id).update({username: query.to, nation: false}).run(connection, function(err){
			if(!err){
				io.sockets.emit('notify',{note: query.to+' ockuperade <br>'+query.type+' av '+query.from+'.', lines: 2});
			}else{
				console.log(err)
			}
		});
		// {from: user.username, to: $scope.modal.sendTo, type: $scope.modal.selected.type, byggnad_id: $scope.modal.selected.id}	
	})



	socket.on('din_tur', function(){
		r.db(socket.user.game).table('users').filter({username: socket.user.username}).update({din_tur: false}).run(connection);
		console.log(socket.lastdice);
		r.db(socket.user.game).table('users').filter({index: (socket.user.index+1)%socket.users.length}).update({din_tur: true}).run(connection);
	})
	socket.on('dices', function(){
		if(!socket.lastdice){socket.lastdice = {username: 'bank'}}
		console.log(socket.lastdice.username);
		console.log(socket.user.username);
		if(socket.user.din_tur&&socket.lastdice.username!=socket.user.username){
			var dices = Math.ceil(Math.random()*6)+Math.ceil(Math.random()*6);
			var utdelning = [];
			var totalutdelning = {};
			var bonus = {
				"invånare": [],
				"valfri": []
			};
			
			r.db(socket.user.game).table('byggnader').run(connection, function(err, cursor){
				console.log('db')
				cursor.toArray(function(err, byggnader){
				console.log(byggnader)
					if(byggnader[0]){
						byggnader.map(function(byggnad){
							//set bonus
							if(byggnad.bonus){
								if(socket.user.bonus[byggnad.type]){
									bonus['invånare'] = bonus['invånare'].concat(socket.user.bonus[byggnad.type]['invånare']);
									bonus['valfri'] = bonus['valfri'].concat(socket.user.bonus[byggnad.type]['valfri']);
								}
							}
							byggnad.marker.map(function(mark){
								console.log('mark')
								totalutdelning[byggnad.username] ? 'pass' : totalutdelning[byggnad.username] = [];
								if(mark.nr==dices&& !mark.occupied){
									console.log('hit!')
									mark.utdelning.map(function(i){
										addResurs({to: byggnad.username, type: mark.mark});
										totalutdelning[byggnad.username].push(mark.mark);
										if(byggnad.username==socket.user.username){
											utdelning.push(mark.mark);
										}
									})
								}
								if(byggnader[byggnader.length-1]==byggnad && byggnad.marker[byggnad.marker.length-1]==mark){
									console.log('return')
									var event = {username: socket.user.username, type: "dices", dices: dices, utdelning: totalutdelning, bonus: bonus['invånare'].concat(bonus['valfri']) }
									// connections.map(function(s){s.lastdice = event;});
									Object.keys(totalutdelning).map(function(username){
										console.log(username);
										var typ = totalutdelning[username].filter(function(d,i,a){return d!=a[i-1]}).toString();
										connections.map(function(s){console.log(s.user.username); s.user.username==username ? s.emit('notify',{note: 'Du har fått '+typ+'.', lines: 1}) : 'pass' ;});
									});
									logEvent(event);
									socket.emit('dices', {dices: dices, utd: utdelning, bonus: bonus['invånare'].concat(bonus['valfri'])});
								}
							})
							
						})
					}else{
						console.log('inga byggnader')
						console.log(dices)
						var event = {username: socket.user.username, type: "dices", dices: dices, utdelning: totalutdelning }
						// connections.map(function(s){s.lastdice = event;});
						logEvent(event);
						socket.emit('dices', {dices: dices, utd: utdelning, bonus: bonus});
					}
				})
			})
		}
	})


	socket.on('disconnect', function(){
		connections.splice(connections.indexOf(socket));
		console.log('Disconnected: %s sockets connected', connections.length);
		if(socket.user.game){
			r.db(socket.user.game).table('users').filter({username: socket.user.username}).update({online: false}).run(connection);
		}
	})

});






var constructNation = function(input, index, callback){
  input.map(function(city){
    city.nation = index;
    city.p = 0;
  });

  // Remap input buildings 
  // OBS city är här en array av marker endast, ej object!
  var cities = input.map(function(city){ 
    city.menu = [ {'title':'Överge byggnad åt fiende', 'action':'ockuperad_byggnad'},
                  {'title':'Lägg till mark', 'action':'add_mark'} ];
    city.active = false;
    city.rank = 0;
    return city.marker.map(function(mark,i,a){ 
      mark.value = mark.mark+mark.nr;
      mark.byggnad = city;
      // mark.byggnad = city.id;
      mark.byggnad.p = a.length;
      mark.byggnad.marker = [];
      mark.byggnader = [];
      mark.rank=0;
      mark.control = false;
      mark.occupied ? mark.menu = [ {'title':'Återta', 'action':'ockupera'} ] : mark.menu = [ {'title':'Ockuperad av fiende', 'action':'ockupera'} ];
      return mark;
    });
  });

  // Unique mark's
  var unika = [];
  var unika_marker = [];
  cities.map(function(city){ city.map(function(mark){ 
    if(unika.indexOf(mark.value) == -1){ 
      unika.push(mark.value); 
      unika_marker.push(mark);
    } 
  })});


  unika_marker = unika_marker.map(function(mark){ 
    mark.byggnader =  cities.filter(function(city){ 
                        return city.map(function(cmark){
                          return cmark.value==mark.value; //[false, false, true]
                        }).filter(function(bool){
                          return bool==true; // [true]
                        })[0]; 
                      }).map(function(city){
                        return city[0].byggnad
                      });
    mark.rank =       cities.filter(function(city){ 
                        return city.map(function(cmark){
                          return cmark.value==mark.value;
                        }).filter(function(bool){
                          return bool==true;
                        })[0]; 
                      }).map(function(city){
                      	var s = '';
                      	for(var i = 0; i < city.length; i++){
                      		s+='0';
                      	}
                        return parseInt('1'+s)+mark.nr; // rank_val for each city
                      }).reduce(function(rank_prev_city,rank_curr_city){
                        return rank_prev_city+rank_curr_city; // sum up all
                      })+Math.random(); // Needs to be a unique value
    return mark;
  });

  //
  cities.map(function(city){ city.map(function(mark){ 
    mark.byggnad.marker.push(unika_marker.filter(function(m){return m.value==mark.value})[0]);
  })}); 
 

  // Cities marks rank
  cities = cities.map(function(city){ 
    return city.map(function(mark){ 
      mark.rank = unika_marker.filter(function(m){ return m.value==mark.value; })[0].rank; 
      mark.byggnader = unika_marker.filter(function(m){ return m.value==mark.value; })[0].byggnader; 
      return mark;
    }).sort(function(mark_prev,mark_curr){ 
      return mark_curr.rank - mark_prev.rank; 
    })
  }).sort(function(city_prev,city_curr){ 
    var r1 = 0; city_curr.map(function(a){r1 += a.rank;});
    var r2 = 0; city_prev.map(function(a){r2 += a.rank;});
    return r1 - r2;
  });

  var nation = {
    index: index,
    range: {
      alla: [],
      upp: [],
      ner: []
    },
    marker: {
      alla: [],
      upp: [],
      ner: []
    },
    byggnader: {
      alla: [],
      upp: [],
      ner: []
    },
    bonus: input.map(function(b){ if(b){ return b.bonus == true }else{return true;}}).sort()[0],
    menu: [{title:'Aktivera skatt', action:'activate_bonus'},{title:'Splitra nation', action:'split_nation'}]
  }

  // GENERATE NATION ALGORITM
  console.log('Genrate nation '+index)
  while(cities[0]){
    var byggnad = cities[0][0].byggnad;
    if( !nation.marker.alla[0] ){ // Empty array
      console.log('first');
      //if city of class b: 
      if(cities[0].length == 2){
        nation.marker.alla.unshift(cities[0].shift());
        nation.byggnader.alla.unshift([]);
        nation.marker.alla.unshift(undefined);
        nation.byggnader.alla.unshift([]);
        nation.marker.alla.unshift(cities[0].shift());
        nation.byggnader.alla.unshift([]);
      }else{
        while(cities[0][0]){ 
          nation.marker.alla.unshift(cities[0].shift());
          nation.byggnader.alla.unshift([]);
        }
      }
      nation.byggnader.alla[0].push(byggnad);
      cities.shift()
      continue;
    }
    if( cities[0].length == 3 ){ // If pos_class_3
        console.log('c');
      if( nation.marker.alla[0].value + nation.marker.alla[1].value == cities[0][0].value + cities[0][1].value ||  
          nation.marker.alla[0].value + nation.marker.alla[1].value == cities[0][1].value + cities[0][0].value ){ // Dubble matches? Begining
        console.log('dubble beg');
        cities[0].shift()
        cities[0].shift()
        nation.marker.alla.unshift(cities[0].shift()); 
        nation.byggnader.alla.unshift([byggnad]);
        cities.shift()
        continue;
      }
      if( nation.marker.alla[nation.marker.alla.length-1].value + nation.marker.alla[nation.marker.alla.length-2].value == cities[0][0].value + cities[0][1].value ||  
          nation.marker.alla[nation.marker.alla.length-2].value + nation.marker.alla[nation.marker.alla.length-1].value == cities[0][1].value + cities[0][0].value ){ // End
        console.log('dubble end');
        cities[0].shift()
        cities[0].shift()
        nation.marker.alla.push(cities[0].shift());
        nation.byggnader.alla.push([]);
        nation.byggnader.alla[nation.byggnader.alla.length-3].push(byggnad);
        cities.shift()
        continue;
      }
      if( nation.marker.alla[0].value == cities[0][0].value ){ // Match beginning?
        console.log('beg');
        cities[0].shift()
        while(cities[0][0]){
          nation.marker.alla.unshift(cities[0].shift()); // pop: Higest rank at ends.
          nation.byggnader.alla.unshift([]);
        }
        nation.byggnader.alla[0].push(byggnad);
        cities.shift()
        continue;
      }
      if( nation.marker.alla[nation.marker.alla.length-1].value == cities[0][0].value ){ // Match end?
        console.log('end');
        cities[0].shift()
        while(cities[0][0]){
          nation.marker.alla.push(cities[0].shift());
          nation.byggnader.alla.push([]);
        }
        nation.byggnader.alla[nation.byggnader.alla.length-3].push(byggnad);
        cities.shift()
        continue;
      }
        console.log('append');
      while(cities[0][0]){ // Else append in beginning
        nation.marker.alla.unshift(cities[0].shift());
        nation.byggnader.alla.unshift([]);
      }
      nation.byggnader.alla[0].push(byggnad);
      cities.shift()
      continue;
    }
    if( cities[0].length == 2 ){ // If pos_class_2
      console.log('b');
      for(var i=0; i<nation.marker.alla.length-2; i++){ // Search dubble match
        if(cities[0][0]){
          if(nation.marker.alla[i].value + nation.marker.alla[i+2].value == cities[0][0].value + cities[0][1].value ||  
          nation.marker.alla[i].value + nation.marker.alla[i+2].value == cities[0][1].value + cities[0][0].value){
            nation.byggnader.alla[i].push(byggnad);
            byggnad=false;
          }
        }else{ break }
      }
      if(!byggnad){
        console.log('dubble');
        cities.shift()
        continue;
      }
      if(nation.marker.alla[nation.marker.alla.length-1].value == cities[0][0].value){ // Match at end
        console.log('end');
        cities[0].shift()
        nation.marker.alla.push(false); 
        nation.byggnader.alla.push([]);
        nation.marker.alla.push(cities[0].shift()); 
        nation.byggnader.alla.push([]);
        nation.byggnader.alla[nation.byggnader.alla.length-3].push(byggnad)
        cities.shift()
        continue;
      }
      if(nation.marker.alla[nation.marker.alla.length-1].value == cities[0][1].value){ // Match at end
        console.log('end');
        cities[0].pop()
        nation.marker.alla.push(false); 
        nation.byggnader.alla.push([]);
        nation.marker.alla.push(cities[0].shift()); 
        nation.byggnader.alla.push([]);
        nation.byggnader.alla[nation.byggnader.alla.length-3].push(byggnad)
        cities.shift()
        continue;
      }
      if(nation.marker.alla[0].value == cities[0][0].value){ // Match at beginning
        console.log('beg');
        cities[0].shift()
      }else if(nation.marker.alla[0].value == cities[0][1].value){
        console.log('beg');
        cities[0].pop()
      }else{
        console.log('append');
        nation.marker.alla.unshift(cities[0].shift()); // Else append 
        nation.byggnader.alla.unshift([]);
      }
      nation.marker.alla.unshift(false); 
      nation.byggnader.alla.unshift([]);
      nation.marker.alla.unshift(cities[0].shift()); 
      nation.byggnader.alla.unshift([byggnad]);
      cities.shift()
      continue;
    }
    if( cities[0].length == 1 ){ // If pos_class_1
      console.log('a');
      for(i in nation.marker.alla){ // Match?
        if(cities[0][0].value){
          if(nation.marker.alla[i].value == cities[0][0].value){
            nation.byggnader.alla[i].push(byggnad);
            cities.shift();
            break;
          }
        }
      }
      if(cities[0]){ // Else append
        console.log('append');
        nation.marker.alla.push(cities[0].shift()); 
        nation.byggnader.alla.push([byggnad]);
        cities.shift();
      }
    }
  }

  cities.map(function(city){ city.map(function(mark){ 
    mark.byggnad.p = city.length; 
  })})

  console.log(nation.marker.alla);
  console.log(nation.byggnader.alla);

  // Flatten circular arguments...
  // nation.marker.alla = nation.marker.alla.map(function(mark){
  // 	if(mark){ mark.byggnad = {id: mark.byggnad.id}; }
  // 	return mark;
  // });
  nation.byggnader.alla = nation.byggnader.alla.map(function(pos){
  	pos.map(function(byggnad){
	  	byggnad.marker = byggnad.marker.map(function(mark){
		  	mark.byggnad = {
		  		id: mark.byggnad.id,
		  		nation: mark.byggnad.nation, 
		  		marker: mark.byggnad.marker.map(function(m){return {value: m.value};}) 
		  	};
		  	mark.byggnader = mark.byggnader.map(function(b){ 
		  		return {
		  			id: b.id,
		  			nation: b.nation, 
		  			marker: b.marker.map(function(m){return {value: m.value};}) 
		  		};
		  	});
		  	return mark;
		}) 
		return byggnad;
	});
	return pos;
  });

  nation.marker.upp = nation.marker.alla.filter(function(a,i){return i%2==0})
  nation.marker.ner = nation.marker.alla.filter(function(a,i){return i%2==1})
  nation.byggnader.upp = nation.byggnader.alla.filter(function(a,i){return i%2==0})
  nation.byggnader.ner = nation.byggnader.alla.filter(function(a,i){return i%2==1})
  nation.range.alla = nation.marker.alla.map(function(a,i){return i})
  nation.range.upp = nation.marker.upp.map(function(a,i){return i})
  nation.range.ner = nation.marker.ner.map(function(a,i){return i})

  console.log(nation)
  callback(nation);
}

// r.db("main").table('games').filter({game:{name:'game_1'}}).update({online: r.row.getField('online').append('hej') })

// r.db("main").table('games').filter({game:{name:'game_1'}}).update({online:{andreas: true}})



// //Pusher
// var pusher = new Pusher({
//   appId: '129524',
//   key: '49150bc81042dacfac7d',
//   secret: '62abcbeb19f142a64291',
//   encrypted: true
// });
// pusher.port = 443;

// app.post('/pusher/auth', function(req, res) {
// 	var socketId = req.body.socket_id;
// 	var channel = req.body.channel_name;
// 	var auth = pusher.authenticate(socketId, channel);
// 	res.send(auth);
// });






// var db_settings_events_created = new Array();
// var create_pushing_events_db_settings = function (db_name){
// 	console.log('\nCreating pushing events for database: '+db_name+'.settings:');
// 	r.db(db_name).table('settings').without('id', 'color', 'typer').map(function (obj) {return obj.keys();}).run(connection, function (err, cursor) {//...lista tables i databas
// 		db_settings_events_created.push(db_name);
// 		cursor.each(function (err, settings_keys) {
// 			var eval_string='';
// 			for(k in settings_keys){
// 				eval_string += "console.log('Channel: channel_"+db_name+", Event: update_"+settings_keys[k]+"');"+
// 				"r.db('"+db_name+"').table('settings')('"+settings_keys[k]+"').changes().run(connection, function (err, cursor) {"+
// 	    			"if(err){"+
// 	    				"console.log('Error: ');"+
// 	    			"}else{"+
// 					    "cursor.each(function (err, result) {"+
// 					        "console.log('Triggered event: update_"+settings_keys[k]+", on channel: channel_"+db_name+"');"+
// 					        "pusher.trigger('channel_"+db_name+"', 'update_"+settings_keys[k]+"', JSON.stringify(result.new_val, null, 2));"+
// 					    "});"+
// 					"}"+
// 				"});";
// 	    	}
// 		    eval(eval_string);
//     	});
// 	});
// }


// //client updater
// var player_events_created = new Array();
// var create_pushing_events_player = function (game, player, prChannel) {
// 	console.log('Creating pushing events for: '+game+'.'+player);
// 	r.db(game).table(player).map(function (obj) {return obj.keys();}).run(connection, function(err, cursor) {
// 		player_events_created.push(game+player);
// 		cursor.each(function (err, result) {
// 			var keys=result;
// 			//Generates an event for all attributes in player table that will be pushed to player on changes.
// 			var eval_string="";
// 			for(k in keys){
// 				eval_string += "console.log('Channel: "+prChannel+", Event: update_"+keys[k]+"');"+
// 				"r.db('"+game+"').table('"+player+"').withFields('"+keys[k]+"').changes().run(connection, function (err, cursor) {"+
// 	    			"if(err){"+
// 	    				"console.log('Error: ');"+
// 	    			"}else{"+
// 					    "cursor.each(function (err, result) {"+
// 					        "console.log('Triggered event: update_"+keys[k]+", on channel: "+prChannel+"');"+
// 					        "pusher.trigger('"+prChannel+"', 'update_"+keys[k]+"', JSON.stringify(result.new_val, null, 2));"+
// 					    "});"+
// 					"}"+
// 				"});";
// 			}
// 			eval(eval_string);
// 		});
// 	});
// }

// //node.js server http requests
// app.get('/list_all_games', function(req, res) {
// 	var list = [];
// 	var db_list = [];
// 	var games_list = [];

// 	async.waterfall([
// 		function (cb){
// 			r.dbList().run(connection, function(err, results){
// 				results.splice(results.indexOf('rethinkdb'),1);
// 				db_list = results;
// 				for(i in db_list){
// 					if(typeof db_list[i] == "string"){
// 						var txt = db_list[i].substr(0,5);
// 						if(txt=='game_'){
// 							games_list[i] = db_list[i];
// 						} 
// 					} 
// 				}
// 				cb(null, games_list);
// 			});
// 		},
// 		function (games_list, cb){
// 			games_list.forEach(function(err,i){
// 				if(db_settings_events_created.indexOf(games_list[i]) == -1){
// 					create_pushing_events_db_settings(games_list[i]);
// 				}else{
// 					console.log('The game-settings events have already been created for '+games_list[i]+'.');
// 				}
// 				r.db(games_list[i]).table('settings').withFields('players', 'date', 'active').run(connection, function(err, cursor) {
// 					cursor.toArray(function(err, results) {
// 						list[i] = {
// 							players: results[0].players, 
// 							date: results[0].date, 
// 							index: i, 
// 							name: 'Game '+(i+1),
// 							active: results[0].active
// 						};
// 						if(i==games_list.length-1){
// 							res.send(list);
// 						}
// 					}); 
// 				});
// 			});
// 		}
// 	], 
// 	function (err) {
// 		res.send('Sorry, something went wrong! Error msg:'+err.message);
// 	});
// });

// //node.js server http requests
// app.get('/db/:database/:table', function(req, res) {
// 	console.log('REQUEST:'+req);
//     var database = req.params.database;
//     var table = req.params.table;
//     var query = req.query;
//     var eval_string = 'r.db(database).table(table)';
//     for (key in query){
//         // Valid querys:
// 	    if( key=='withFields' || 
// 	    	key=='hasFields' || 
// 	    	key=='orderBy'){ eval_string+='.'+key+'("'+query[key]+'")'; }
//     }
//     eval_string +='.run(connection, function(err, cursor) { cursor.toArray(function(err, result) {res.send(result); }); });';
//     eval(eval_string);
// });

// app.post('/addGame', function(req, res) {
// 	var new_game = req.body.new_game;
// 	console.log(new_game);


// //Create database 'game_1'
// 	r.dbCreate('game_'+(new_game.index+1)).run(connection, function(err, cursor) {
// 	    if (err) throw err; 
// 	    console.log('create db game_'+(new_game.index+1)+': '+err);
// 		create_pushing_events_db_settings('game_'+(new_game.index+1));
		
// 		r.db('game_'+(new_game.index+1)).tableCreate('byggnader').run(connection, function(err, cursor) {
// 		    if (err) throw err; 
// 			console.log('create table: byggnader '+err+' '+JSON.stringify(cursor.config_changes[0].new_val.id, null, 2));

// 		    //for(var i=0;i<new_game.players.length;i++){
// 		    new_game.players.forEach( function (player) {
		    
// 		    	//Create table 'Player1'
// 				r.db('game_'+(new_game.index+1)).tableCreate(player.name).run(connection, function(err, cursor) {
// 			    	if (err) throw err; 
// 			    	console.log('create table: player '+err+' '+JSON.stringify(cursor.config_changes[0].new_val.id, null, 2));
// 			    	//Insert player start
// //			    	setTimeout(function() {
// 			    	r.db('game_'+(new_game.index+1)).table(player.name).insert([{
// 			    			typer: new_game.typer, 
// 			    			resurser: new_game.resurser, 
// 			    			player: player, 
// 			    			byggnader: new_game.byggnader, 
// 			    			byggnads_info: new_game['byggnads-info'], 
// 			    			infanteri: new_game.infanteri
// 			    		}]).run(connection, function(err, cursor) {
// 				    	if (err) throw err; 
// 				    	console.log('add player settings: '+err+' '+JSON.stringify(cursor.generated_keys[0], null, 2));
				    	
// 					});
// 			    	//}, 1000);
// 				});
// 			});
// 			//Append games
// 				    	r.db('settrisk').table('games').insert(new_game).run(connection, function(err, cursor) {
// 						    if (err) throw err;
// 						    console.log('append games: '+err); 
// 						    console.log(cursor);
// 				    		//Return
// 				    		res.send(JSON.stringify(cursor, null, 2));
// 						});
// 		});	
// 	});
// });

// app.get('/delete/:game_nr/:id', function(req, res) {
//     var id = req.params.id;
//     var game_nr = req.params.game_nr;
// 	r.db('settrisk').table('games').get(id).delete().run(connection, function(err, cursor){
// 	    console.log('Splice games table: '+err);
// 	    if (err) throw err; 
// 	});
	
// 	r.dbDrop(game_nr).run(connection, function(err, cursor){
// 	    console.log('Drop db '+game_nr+': '+err);
// 	    if (err) throw err;
// 	    res.send(JSON.stringify(cursor, null, 2));
// 	});
	
// });


// app.post('/signin', function(req, res) {
// 	var player = req.body.player;
// 	var game = req.body.game;
// 	//var id = req.body.id;
// 	var active = false;
// 	var players;

// 	if(player=='Bank'){
// 		r.db('game_'+game).table('settings')('players').run(connection, function(err, cursor) {
// 			cursor.toArray(function(err, result) {
// 		        players = result;
// 				res.render('bank', {
// 					game: game,
// 					players: players
// 				});
// 			});
// 		});
// 	}else{

// 		if(player_events_created.indexOf("game_"+game+player) == -1){
// 			create_pushing_events_player('game_'+game, player, 'private-game_'+game+'-'+player);
// 		}else{
// 			console.log('The player events have already been created for this game.');
// 		}

// 		r.db('game_'+game).table(player).hasFields('player').run(connection, function(err, cursor) {
// 			if (err) throw err;
// 			cursor.toArray(function(err, results) {
// 				if (err) throw err;
// 				var playerSettings = results[0];//JSON.stringify(results[0], null, 2).toString();

// 				r.db('game_'+game).table(player).hasFields('player').run(connection, function(err, cursor) {
// 					if (err) throw err;
// 					cursor.toArray(function(err, results) {			
// 						if (err) throw err;
// 						var playerKorg = results[0];
// 						var keyarr = Object.keys(playerKorg.resurser);
// 						for(i in keyarr){playerKorg.resurser[keyarr[i]]=[];}
// 						var keyarr = Object.keys(playerKorg.infanteri);
// 						for(i in keyarr){playerKorg.infanteri[keyarr[i]]=[];}
// 						var keyarr = Object.keys(playerKorg.byggnader);
// 						for(i in keyarr){playerKorg.byggnader[keyarr[i]]=[];}
// 						//JSON.stringify(results, null, 2);
						
// 						r.db('settrisk').table('priser').run(connection, function(err, cursor) {
// 							if (err) throw err;
// 							cursor.toArray(function(err, results) {
// 								var priser = results[0];//JSON.stringify(results, null, 2);
								
// 								r.db('game_'+game).table('settings')('players').run(connection, function(err, cursor) {
// 									if (err) throw err;
// 									cursor.toArray(function(err, result) {
// 								        if (err) throw err;
// 								        players = result[0];
// 								        //Om redan true, returnera med index, annars sätt till true.
// 								        for(i in players){
// 								        	if(player==players[i]['name'] ){ 
// 								        		if(players[i]['active']){res.render('index', {message: player+' har redan loggat in!', bool: true});}
// 								        		active = players[i]['active']; players[i]['active']=true; }
// 								        }
// 							    		console.log(player+' cheching if active: '+err+' '+active);
// 							    		//console.log(players);

// 							    		r.db('game_'+game).table('byggnader').hasFields(player).run(connection, function(err, cursor) {
// 											if (err) throw err;
// 											cursor.toArray(function(err, result) {
// 										        if (err) throw err;
// 										        playerSettings.byggnads_info = result;
// 										        var nationer={};
// 										        for(i in result){if(result[i].nation!=''){nationer[result[i].nation]=false;}}
// 										        //console.log(playerSettings);

// 									    		if(!active || true){
// 													active = true;
// 													r.db('game_'+game).table('settings').update({players:players}).run(connection, function(err, cursor) {
// 														//if (err) throw err;
// 														console.log(players);
// 														//plocka bort spelaren ur array och indexa om! 
// 										    			for(i in players){ if(player==players[i]['name']){ players.splice(i,1); }}
// 										    			var x=0;
// 											        	while(x<players.length){players[x]['index']=(x+1); x++;}
// 												        console.log(player+' is now active! Error: '+err);
// 														res.render('playertest', {
// 															player: player,
// 															game: game,
// 															dintur: false,
// 															id: 'id',
// 															players: players,
// 															playerSettings: playerSettings,
// 															playerKorg: playerKorg,
// 															nationer: nationer,
// 															priser: priser
// 														});
// 													});
// 												} else {res.render('index', {message: player+' has already signed in!', bool: active});}
// 											});
// 										});
// 								    });
// 								});
// 							});
// 						});
// 					});
// 				});
// 			});
// 		});
// 	}
// });



// app.post('/logout', function(req) {
// 	var playername = req.body.playername;
// 	var game_index = req.body.game_index;
// 	r.db('game_'+game_index).table('settings')('players').run(connection, function(err, cursor) {
// 		cursor.toArray(function(err, results) {			
// 			if (err) throw err;
// 			console.log(results[0]);
// 			var players = results[0];
// 			for(p in players){if(players[p].name==playername){players[p].active=false}}
// 			console.log(players);
// 			r.db('game_'+game_index).table('settings').update({'players': players}).run(connection, function(err, cursor) {
// 				console.log(playername+' har loggat ut.');
// 			});
// 		});
// 	});
// });



// app.post('/ping', function(req, res){
// 	res.send('Ping!');
// 	d = Date.now();
// 	var players = req.body.players;
// 	var id = req.body.id;
// 	for(i in players){
// 		pusher.trigger('private-channel_'+players[i].name, 'client-ping', { "data": "ping"});
// 		players[i].active=false;
// 	}
// 	r.db('settrisk').table('games').get(id).update({'players': players}).run(connection, function(err, cursor) {
// 		console.log('Ping!');
// 		app.post('/pong', function(req, res){
// 			res.send('Pong!');
// 			var player = req.body.player;
// 			//console.log(player);
// 		    for(i in players){if (players[i].name==player){players[i].active=true;}}
// 		    //console.log(players);
// 	    	r.db('settrisk').table('games').get(id).update({'players': players}).run(connection, function(err, cursor) {
// 				console.log(player+' Pong! '+(Date.now()-d)+'ms');
// 			});
// 		});
// 	});
// });


// app.post('/buyItems', function(req, res) {
// 	var data = req.body.data;
// 	var player = req.body.player;
// 	var id = req.body.id;
// 	var game = req.body.game;
// 	var type = req.body.type;
// 	console.log(req.body);
// 	//check if posible!!!
// 	var p={};
// 	var currdata={}
// 	var txt='';
// 	var order='';
// 	//var datain={};
// 	var callb = function (currdata) {
// 		//order+='bygg['+antal+'] = {'+player+': player, type: '+inf+', nation: "", mark1: [0,""], mark2: [0,""], mark3: [0,""]};';
// 		var bygg=[];
// 		console.log(order);
// 		eval(order);
// 		if(bygg[0]){
// 			for(b in bygg){
// 				r.db(game).table('byggnader').insert(bygg).run(connection, function (err, results) {
// 					if (err) throw err;
// 					console.log(results);
// 					console.log(b==bygg.length);
// 					console.log(b+' =? '+bygg.length);
// 					currdata[type][bygg[b]['type']].push(results.generated_keys[0]);
// 					if((b+1)==bygg.length){
// 						r.db(game).table(player).update(currdata).run(connection, function (err, cursor) {
// 							if (err) throw err;
// 							res.send("Hej; got your req!");
// 							pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Du har köpt "+txt, "color": "success"});
// 						});
// 						console.log(currdata);
// 					}
// 				});		
// 			}
// 		}else{
// 			r.db(game).table(player).update(currdata).run(connection, function (err, cursor) {
// 				if (err) throw err;
// 				res.send("Hej; got your req!");
// 				pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Du har köpt "+txt, "color": "success"});
// 			});
// 			console.log(currdata);
// 		}
// 	}

// 	r.db(game).table('settings').withFields('priser').run(connection, function (err, cursor) {
// 		if (err) throw err;
// 		cursor.toArray(function(err, result) {
// 	        if (err) throw err;
// 	        p = result[0].priser;
// 	    });
// 		console.log(game);

// 		r.db(game).table(player).withFields(type, 'resurser').run(connection, function (err, cursor) {
// 			if (err) throw err;
// 			cursor.toArray(function(err, result) {
// 		        if (err) throw err;
// 		        currdata = result[0];
		        
// 		        Object.keys(data[type]).forEach(function (inf) {
// 					var ex=0;
// 					for(antal in data[type][inf]){
// 						//checka kostnad
// 						var dyrt=0;
// 			            Object.keys(p[inf]).forEach( function (res){
// 			                if(currdata.resurser[res].length<p[inf][res].length){dyrt=1};
// 			            });

// 			            if(!dyrt){
// 			            	ex++;
// 			            	//dra av kostnad
// 							Object.keys(p[inf]).forEach(function (res) {
// 								for(pres in p[inf][res]){
// 									currdata.resurser[res].pop();
// 								}
// 							});
// 							//lägg till en enhet
// 							if(inf=='fabrik' || inf=='by' || inf=='stad'){
// 								//lägg till nya valmöjligheter som tex infanteri
// 								order+='bygg['+antal+'] = {player: "'+player+'", type: "'+inf+'", nation: "", mark1: "", nr1: 0, mark2: "", nr2: 0, mark3: "", nr3: 0 };';
								
// 							}else{currdata[type][inf].push(currdata[type][inf].length+1);}
// 			            }else{
// 			            	pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Du har inte råd!", "color": "danger"});
// 			            }
// 					}
// 					if(ex!=0){txt+=' '+ex+' '+inf;}
// 				});
// 				callb(currdata);
// 		    });
// 		});
// 	});

// });

// app.post('/sendResurs', function(req, res) {
// 	var game = req.body.game;
// 	var player = req.body.player;
// 	var toPlayer = req.body.toPlayer;
// 	var resurs = req.body.resurs;
// 	var id = req.body.id;
// 	console.log(req.body);

// 	r.db(game).table(player).withFields('resurser').run(connection, function (err, cursor) {
// 		if (err) throw err;
// 		cursor.toArray(function(err, result) {
// 	        if (err) throw err;
// 	        console.log(result[0]);
// 	        var fromPlayerResurser = result[0].resurser;
	    

// 			r.db(game).table(toPlayer).withFields('resurser').run(connection, function (err, cursor) {
// 				if (err) throw err;
// 				cursor.toArray(function(err, result) {
// 			        if (err) throw err;
// 			        var toPlayerResurser = result[0].resurser;

// 					if(fromPlayerResurser[resurs].length>0){
// 						fromPlayerResurser[resurs].pop(fromPlayerResurser[resurs].length);
// 						toPlayerResurser[resurs].push(toPlayerResurser[resurs].length);
// 						r.db(game).table(player).update({'resurser':fromPlayerResurser}).run(connection, function (err, results) {
// 							if (err) throw err;
// 							console.log(result);
// 							pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Handel: Du har bytt bort "+resurs+"!", "color": "info"});
// 							r.db(game).table(toPlayer).update({'resurser':toPlayerResurser}).run(connection, function (err, results) {
// 								if (err) throw err;
// 								console.log(result);
// 								pusher.trigger('private-'+game+'-'+toPlayer, 'client-log_event', { "note": "Handel: Du har fått "+resurs+"!", "color": "info"});
// 	        					res.send(result);
// 							});
// 						});
// 					}else{pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Handel: Du har ingen "+resurs+"!", "color": "danger"});res.send(result);}
// 			    });
// 			});
// 		});
// 	});
// });


// app.post('/ockupera', function(req, res) {
// 	var game = req.body.game;
// 	var player = req.body.player;
// 	var nationer = req.body.nationer;
// 	console.log(req.body);

// 	r.db(game).table(player).update({'nationer': nationer}).run(connection, function (err, cursor) {
// 		if (err) throw err;
// 		 //cursor.toArray(function(err, result) {
// 	        //if (err) throw err;
// 	        console.log(cursor);
// 	        res.send(cursor);
// 	        pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Ockupation uppdaterad", "color": "success"})
// 		//});
// 	});

// });



// app.post('/byggnads_info', function(req, res) {
// 	var game = req.body.game;
// 	var player = req.body.player;
// 	var byggnads_info = req.body.byggnads_info;
// 	var id = req.body.byggnads_info.id;
// 	console.log(req.body);

// 	r.db(game).table('byggnader').get(id).update(byggnads_info).run(connection, function (err, cursor) {
// 		if (err) throw err;
// 		 //cursor.toArray(function(err, result) {
// 	        //if (err) throw err;
// 	        console.log(cursor);
// 	        res.send(cursor);
// 	        pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": "Placerad: "+byggnads_info.type, "color": "success"})
// 		//});
// 	});

// });



// app.post('/dintur', function(req, res) {
// 	var game = req.body.game;
// 	var id = req.body.id;
// 	var player = req.body.player;
// 	var newplayer = req.body.newplayer;
// 	console.log(req.body);

// 	if(player!='bank'){
// 		r.db(game).table(player).update({'player': {'dintur':false}}).run(connection, function (err, cursor) {
// 			if (err) throw err;
// 			 //cursor.toArray(function(err, result) {
// 		        //if (err) throw err;
// 		        console.log(cursor);
// 		        var s=''
// 		        if(newplayer[-1]!='s'){s='s'}
// 		        pusher.trigger('private-'+game+'-'+player, 'client-log_event', { "note": newplayer+s+" tur!", "color": "success"});
// 			//});
// 		});
// 	}

// 	r.db(game).table(newplayer).update({'player': {'dintur':true}}).run(connection, function (err, cursor) {
// 		if (err) throw err;
// 		 //cursor.toArray(function(err, result) {
// 	        //if (err) throw err;
// 	        console.log(cursor);
// 	        res.send(cursor);
// 	        pusher.trigger('private-'+game+'-'+newplayer, 'client-log_event', { "note": "Din tur!", "color": "success"});
// 		//});
// 	});

// });


// app.post('/dices', function(req, res) {
// 	var game = req.body.game;
// 	var player = req.body.player;

// 	var dices =[];


// 	if(player!='bank'){
// 		r.db(game).table(player)('din_tur').run(connection, function (err, dintur) {
// 			console.log(dintur);
// 			if(dintur){
// 				dices = [ Math.ceil(Math.random()*6) , Math.ceil(Math.random()*6) ];
// 				r.db(game).table('settings').update({d: dices}).run(connection, function (err) {
// 					if(err){
// 						res.send(false);
// 					}else{
// 						res.send(dices);
// 						utdelning(game, dices);
// 					}
// 				});
// 			}
// 		});
// 	}
// });

// function utdelning (game, dices) {
// 	nr = dices[0]+dices[1];
// 	console.log('dice: '+nr+' game: '+game);
// 	r.db(game).table('byggnader')
// 	.hasFields('mark1')
// 	.filter(function(row){
// 	  return row('nr1').eq(nr) || row('nr2').eq(nr) || row('nr3').eq(nr);
// 	})
// 	.run(connection, function (err, cursor) {
// 		cursor.toArray(function (err, data) {
// 			var utdelning = {};
// 			var txt ='';
// 			for(d in data){utdelning[data[d].player]='';}
// 			for(d in data){
// 				var num = ["nr1", "nr2", "nr3"];
// 				var marker = ["mark1", "mark2", "mark3"];
// 				if(data[d]=='fabrik'){
// 					var num = ["nr1", "nr2", "nr3", "nr1", "nr2", "nr3"];
// 					var marker = ["mark1", "mark2", "mark3", "mark1", "mark2", "mark3"];
// 				}
// 				for(i in num){
// 					if(data[d][num[i]]==nr){
// 						utdelning[data[d].player] += ' '+data[d][marker[i]];
// 						txt += 
// 						'r.db("'+game+'").table("'+data[d].player+'").update({'+
// 						  '"resurser": {'+
// 						    '"'+data[d].mark1+'": r.branch( '+
// 						      'r.row("resurser")("'+data[d][marker[i]]+'").eq([]),'+
// 						      'r.row("resurser")("'+data[d][marker[i]]+'").append(0),'+
// 						      'r.row("resurser")("'+data[d][marker[i]]+'").append('+
// 						        'r.row("resurser")("'+data[d][marker[i]]+'").nth(-1).add(1)'+
// 						      ')'+
// 						    ')'+
// 						  '}'+
// 						'}).run(connection, function (err) { if(err){console.log("Error!?");} });';
// 						console.log('Utdelning! 1 '+data[d].player+' '+data[d][marker[i]]);
// 						pusher.trigger('private-'+game+'-'+data[d].player, 'client-log_event', { "note": "Utdelning: "+utdelning[data[d].player], "color": "success"})
// 					}
// 				}
// 			}
// 			eval(txt);
// 		});

// 		/*var fetchNext = function(err, data) {
// 			console.log(data);
// 		    if (err) {
// 		        if (((err.name === "ReqlDriverError") && err.message === "No more rows in the cursor.")) {
// 		            console.log("No more data to process")
// 		        }
// 		    }
// 		    else {
// 		    	if(data.nr1==nr){
// 					r.db(game).table(data.player)('resurser')(data.mark1).run(connection, function (err, resarr) {
// 						if (err){console.log('Err'+err)}
// 						r.db(game).table(data.player)('resurser')(data.mark1).append(resarr.length).run(connection, function (err, d) {
// 							console.log('Utdelning! 1 '+data.player+' '+data.mark1);
// 		        			cursor.next(fetchNext);
// 						});
// 					});
// 				}
// 				if(data.nr2==nr){
// 					r.db(game).table(data.player)('resurser')(data.mark1).run(connection, function (err, resarr) {
// 						if (err){console.log('Err'+err)}
// 						r.db(game).table(data.player)('resurser')(data.mark1).append(resarr.length).run(connection, function (err, d) {
// 							console.log('Utdelning! 2 '+data.player+' '+data.mark2);
// 		       			 	cursor.next(fetchNext);
// 						});
// 					});
// 				}
// 				if(data.nr3==nr){
// 					r.db(game).table(data.player)('resurser')(data.mark1).run(connection, function (err, resarr) {
// 						if (err){console.log('Err'+err)}
// 						r.db(game).table(data.player)('resurser')(data.mark1).append(resarr.length).run(connection, function (err, d) {
// 							console.log('Utdelning! 3 '+data.player+' '+data.mark3);
// 							cursor.next(fetchNext);
// 						});
// 					});
// 				}
// 		    }
// 		}
// 		cursor.next(fetchNext);*/
// 	});
// }


// app.get('/*', function(req, res) {
// 	//load data from db?
// 	res.render('index', {message: '', bool: 'false'});
// });



//Listen!
server.listen(3000);
