var io = require('socket.io')();

var connections = []

io.on('connection', function(socket){
	
	connections.push(socket)
	console.log('Connected: %s sockets connected', connections.length)

	socket.on('disconnect', function(){
		connections.splice(connections.indexOf(socket));
		console.log('Disconnected: %s sockets connected', connections.length);
	})

	/***** Login *****/

	socket.on('checkUser', function(data){
		if(data.username == 'Andreas'){
			console.log('User: %s', data.username );
			socket.emit('user_excists', true)
		}
	})

	socket.on('checkPass', function(data){
		console.log('User: %s pin: %d', data.username, data.password );
		if(data.username == 'Andreas' && data.password==1234){
			socket.emit('authorized', true)
		}
	})

	socket.on('login', function(data){
		console.log('Login: %s pin: %d', data.username, data.password );
		if(data.username == 'Andreas' && data.password==1234){
			socket.emit('login', true)
		}
	})

	socket.on('registration', function(data){
		console.log('Login: %s pin: %d', data.username, data.password );
		if(data.username && data.password){
			socket.emit('registration_done', true)
		}
	})

});
io.listen(3000);
