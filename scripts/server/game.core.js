var numberOfCheesePieces = 10;

game_core = function(instance){
    this.cat = positionPlayer(instance.player_host.id);
    this.mouse = positionPlayer(0);
    this.cheesePieces = positionCheese();
    this.gameName = instance.gameName;
    
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    function positionPlayer(id){
        var data = {
            id: id,
            x: getRandomInt(0, 23),
            y: getRandomInt(0, 23),
            waiting: false
        }
        return data;
        //TODO: create method for ensuring sufficient initial separation of cat and mouse.
    };

    function positionCheese() {
        var cp = [];
        for (var i = 0; i < numberOfCheesePieces; i++){
            var cheese = {
                x: getRandomInt(0, 23),
                y: getRandomInt(0, 23)
            };  
            cp.push(cheese);
        }
        return cp;
    }
}