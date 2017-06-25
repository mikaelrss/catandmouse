var game_lobby = module.exports = { clientNames: {}, clientCount: 0, activeRooms: {}, roomCount: 0};

var sentencer = require('sentencer');
var gameServer = require('./game.server.js');

game_lobby.createServer = function(clientName) {
    gameServer.createGame(this.clientNames[clientName], clientName);
    this.activeRooms[clientName] = this.clientNames[clientName];
    this.roomCount++;
}

game_lobby.connect = function(client) {
    var randomName = sentencer.make("{{adjective}} {{noun}}").replace(/\s+/g, '-').toLowerCase();

    while(this.clientNames.hasOwnProperty(randomName)){
        randomName = sentencer.make("{{adjective}} {{noun}}").replace(/\s+/g, '-').toLowerCase();
    };

    this.clientNames[randomName] = client;
    this.clientCount++;
    client.lobby_name = randomName;
    client.emit("initRoom", {name: randomName, activeRooms: Object.keys(this.activeRooms)});
}

game_lobby.disconnect = function(roomName){
    if(this.clientNames.hasOwnProperty(roomName)){
        delete this.clientNames[roomName];
        this.clientCount--;
    }
    if(this.activeRooms.hasOwnProperty(roomName)){
        delete this.activeRooms[roomName];
        this.roomCount--;
    }
}
