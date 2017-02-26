var http = require('http');
var path = require('path');
var fs = require('fs');
var promsie = require('promise');

function handleRequest(req, res){
    var pathname = req.url;

    if(pathname == '/'){
        pathname = '/index.html';
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
var port = 3001;
// var port = process.env.PORT || 8080;
server.listen(port);

var gameServer = require('./game.server.js');
var io = require('socket.io').listen(server);

io.sockets.on('connection',
  function (client) {
    gameServer.findGame(client);

    client.on('pieceMoved', function(data) {
        gameServer.pieceMoved(data);
    });

    client.on('message', function(data){
        gameServer.handleClientMessage(client, data);
    });
    
    client.on('disconnect', function() {
        gameServer.endGame(client.game.id, client.id);
    });   
  });