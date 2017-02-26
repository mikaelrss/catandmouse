var game_server = module.exports = { games: {}, game_count: 0};
var UUID = require('node-uuid');

require('./game.core.js');

game_server.createGame = function(host){
    var game = {
        id: UUID(),
        player_host: host,
        player_client: null,
        player_count: 1
    };

    this.games[game.id] = game;
    this.game_count++;

    game.gamecore = new game_core(game);
    console.log("Host will be: " + host.id);

    host.game = game.gamecore;
};

game_server.endGame = function(gameid, userid){
    var gameToEnd = this.games[gameid];

    if(gameToEnd){
        delete this.games[gameid];
        this.game_count--;
        console.log("deleted");
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

        if(_core.cat.waiting && _core.mouse.waiting){
            console.log("both moved");

            _core.cat.waiting = false;
            _core.mouse.waiting = false;

            if(_core.cat.x == _core.mouse.x && _core.cat.y == _core.mouse.y){
                gameToUpdate.player_host.emit('catWon');
                gameToUpdate.player_client.emit('catWon');

                console.log("won");
            }

            gameToUpdate.player_host.emit('movePieces', {core: _core});
            gameToUpdate.player_client.emit('movePieces', {core: _core});
        }

        console.log(playerToUpdate);
    }
};

game_server.startGame = function(gameInstance){
    gameInstance.player_host.send(gameInstance.player_client.id);
    gameInstance.player_client.send(gameInstance.player_host.id);

    gameInstance.player_host.emit('init', {core: gameInstance.gamecore, id: gameInstance.id});
    gameInstance.player_client.emit('init', {core: gameInstance.gamecore, id: gameInstance.id});
};

game_server.findGame = function(player){
    console.log("Looking for game. There are currently: " + this.game_count + " games");

    //game exists
    if(this.game_count){
        for (var gameId in this.games){
            var gameInstance = this.games[gameId];

            if(gameInstance.player_count < 2){
                gameInstance.player_client = player;
                gameInstance.gamecore.mouse.id = player.id;
                gameInstance.player_count++;
                
                player.game = gameInstance;
                this.startGame(gameInstance);
            }
            else{
                this.createGame(player);
            }
        }
    }
    else{
        this.createGame(player);
    }
};