var http = require('http');
var path = require('path');
var fs = require('fs');
var promise = require('promise');
var gameServer = require('./scripts/server/game.server.js');
var lobbyServer = require('./scripts/server/game.lobby.js');

function handleRequest(req, res){
    var pathname = req.url;

    if(pathname === '/'){
        // pathname = '/index.html';
        pathname = '/lobby-index.html';
    }

    var ext = path.extname(pathname);

    var typeExt = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
    };

    var contentType = typeExt[ext] || 'text/plain';
    fs.readFile(__dirname + pathname,
    function(err, data){
        if(err){
            res.writeHead(500);
            return res.end('Error loading ' + pathname);
        }

        res.writeHead(200,{'Content-Type': contentType});
        res.end(data);
    });
};

var server = http.createServer(handleRequest);

// Use for local development. Also switch io connection in sketch.js
var port = process.env.PORT || 3001;
console.log("PORT", process.env.PORT);
server.listen(port);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (client) {
    lobbyServer.connect(client);

    client.on('gameCreated', function(data){
        lobbyServer.createServer(data.clientName);
        io.sockets.emit("new-game-created", Object.keys(lobbyServer.activeRooms));
    });

    client.on('pieceMoved', function(data) {
        lobbyServer.pieceMoved(data);
    });

    client.on('joinGame', function(data){
        io.sockets.emit("game-removed", data.roomName);
        lobbyServer.joinGame(data.clientName, data.roomName);
    });
    
    client.on('disconnect', function() {
        var roomName = client.lobby_name;
        console.log("NODE_DISCONNECT", roomName);
        lobbyServer.disconnect(roomName);
        io.sockets.emit("game-removed", roomName);
    });
});   