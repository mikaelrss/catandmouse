game_core = function(instance){
    this.cat = positionPlayer(instance.player_host.id);
    this.mouse = positionPlayer(0);
    
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    function getCat(){
        if (cat == null && mouse == null) return (getRandomInt(0,1) == 0);
        if (cat == null) return !mouse.cat
        if (mouse == null) return !cat.cat
    }

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

    function assignCatAndMouse(id){
        if(mouse == null){
            mouse = positionPlayer(id);
        }
        else if(cat == null){
            cat = positionPlayer(id);
        }
    }
}