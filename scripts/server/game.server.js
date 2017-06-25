var game_server = module.exports = { games: {}, game_count: 0};
var UUID = require('node-uuid');

require('./game.core.js');

game_server.createGame = function(host, gameName){
    var game = {
        id: UUID(),
        gameName: gameName,
        player_host: host,
        player_client: null,
        player_count: 1
    };

    this.games[game.id] = game;
    this.game_count++;

    game.gamecore = new game_core(game);
    host.game = game.gamecore;
    return game.id;
};

game_server.endGame = function(gameid){
    var gameToEnd = this.games[gameid];
    console.log("GAME_DISCONNECT", gameid);
    if(gameToEnd){
        console.log("ENDIT")
        var host = gameToEnd.gamecore.player_host;
        var client = gameToEnd.gamecore.player_client;
        emitEventToBothPlayers(gameToEnd, "gameEnded");
        delete this.games[gameid];
        this.game_count--;
    }
};

game_server.pieceMoved = function(data){
    var gameToUpdate = this.games[data.gameid];
    if(gameToUpdate) {
        var _core = gameToUpdate.gamecore;
        var playerToUpdate = (_core.cat.id == data.playerid) ? _core.cat : _core.mouse;

        playerToUpdate.x = data.x;
        playerToUpdate.y = data.y;
        playerToUpdate.waiting = true;

        if (playerToUpdate === _core.cat){
            emitEventToBothPlayers(gameToUpdate, "catReady");
        } else{
            emitEventToBothPlayers(gameToUpdate, "mouseReady");
        } 
        if(_core.cat.waiting && _core.mouse.waiting){
            _core.cat.waiting = false;
            _core.mouse.waiting = false;

            if(_core.cat.x == _core.mouse.x && _core.cat.y == _core.mouse.y){
                emitEventToBothPlayers(gameToUpdate, "catWon");
            }

            var cheeseEaten = false;
            _core.cheesePieces.forEach(function(cheese, index){
                if(_core.mouse.x == cheese.x && _core.mouse.y == cheese.y){
                    var index = -1;
                    index = _core.cheesePieces.indexOf(cheese);
                    if(index != -1) {
                        cheeseEaten = true;
                        _core.cheesePieces.splice(index,1);
                    }
                }
            });

            if(cheeseEaten) {
                emitEventToBothPlayers(gameToUpdate, "cheeseEaten", {cheese: _core.cheesePieces});
            }
            cheeseEaten = false;            

            if(_core.cheesePieces.length < 1){
                emitEventToBothPlayers(gameToUpdate, "mouseWon");
            }
            emitEventToBothPlayers(gameToUpdate, "movePieces", {core: _core});
        }
    }
};

game_server.startGame = function(gameInstance){
    var hostId = gameInstance.player_host.id
    var clientId = gameInstance.player_client.id
    gameInstance.player_host.send(hostId);
    gameInstance.player_client.send(clientId);

    console.log(hostId);
    console.log(clientId);

    emitEventToBothPlayers(gameInstance, "init", {core: gameInstance.gamecore, id: gameInstance.id});
};

game_server.joinExistingGame = function(player, gameId){
    if(this.game_count){
        var gameInstance = this.games[gameId];
        if(gameInstance.player_count >= 2) return;
        gameInstance.player_client = player;
        gameInstance.gamecore.mouse.id = player.id;
        gameInstance.player_count++;

        player.game = gameInstance;
        this.startGame(gameInstance);
    };
};

function emitEventToBothPlayers(gameToUpdate, eventName, data){
    var data = data || {};
    gameToUpdate.player_host.emit(eventName, data);
    gameToUpdate.player_client.emit(eventName, data);
};