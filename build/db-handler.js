var io = require('socket.io')();

var connections = []

io.on('connection', function(socket){
	
	connections.push(socket)
	console.log('Connected: %s sockets connected', connections.length)

	socket.on('disconnect', function(){
		connections.splice(connections.indexOf(socket));
		console.log('Disconnected: %s sockets connected', connections.length);
	})

	socket.on('login', function(data){
		console.log('Login: %s pin: %d', data.username, data.password );
		socket.emit('authorized', {authorized: true})
	})

	socket.on('checkPass', function(data){
		console.log('Login: %s pin: %d', data.username, data.password );
		socket.emit('authorized', {authorized: true})
	})
});
io.listen(3000);
