var game_lobby = module.exports = { clientNames: {}, activeRooms: {}, roomsPlaying: {}, roomsPlayingCount: 0};

var sentencer = require('sentencer');
var gameServer = require('./game.server.js');

game_lobby.createServer = function(clientName) {
    var id = gameServer.createGame(this.clientNames[clientName], clientName);
    this.activeRooms[clientName] = id;
    if(this.clientNames.hasOwnProperty(clientName)){
        delete this.clientNames[clientName]
    }
}

game_lobby.connect = function(client) {
    var randomName = sentencer.make("{{adjective}} {{noun}}").replace(/\s+/g, '-').toLowerCase();

    while(this.clientNames.hasOwnProperty(randomName) || this.activeRooms.hasOwnProperty(randomName) || this.roomsPlaying.hasOwnProperty(randomName) ){
        randomName = sentencer.make("{{adjective}} {{noun}}").replace(/\s+/g, '-').toLowerCase();
    };

    this.clientNames[randomName] = client;
    client.lobby_name = randomName;
    client.emit("initRoom", {name: randomName, activeRooms: Object.keys(this.activeRooms)});
}

game_lobby.joinGame = function(clientName, roomName) {
    var id = this.activeRooms[roomName];
    var player = this.clientNames[clientName];
    player.lobby_name = roomName;
    this.roomsPlaying[roomName] = id;
    this.roomsPlayingCount++;

    delete this.activeRooms[roomName];

    delete this.clientNames[clientName];
    console.log("PLAYING", this.roomsPlaying)
    gameServer.joinExistingGame(player, id);
}

game_lobby.pieceMoved = function(data){
    gameServer.pieceMoved(data);
}

game_lobby.handleClientMessage = function(clientName, message){
    var client = this.clientNames[clientName];
    lobbyServer.handleClientMessage(client, data);
}

game_lobby.disconnect = function(roomName){
    console.log("LOBBY_DISCONNECT", roomName);
    if(this.clientNames.hasOwnProperty(roomName)){
        console.log("CL")
        delete this.clientNames[roomName];
    }
    if(this.activeRooms.hasOwnProperty(roomName)){
        console.log("AR")
        delete this.activeRooms[roomName];
    }
    if(this.roomsPlaying.hasOwnProperty(roomName)){
        console.log("RP")
        var gameId = this.roomsPlaying[roomName];
        gameServer.endGame(gameId);
        delete this.roomsPlaying[roomName];
        this.roomsPlayingCount--;
    }
}
