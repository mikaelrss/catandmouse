//identifiers
var socket;
var game;
var id;

//sounds
var bgMusic;

//grid
var canvasSize = 576;
var numberOfColumns = 24;
var gridSize = canvasSize / numberOfColumns;

//entities
var mouse;
var ghost;
var cat;
var allowedMovesMouse = 2;
var allowedMovesCat = 3;

//dynamics
var hasMoved = false;
var gameStarted = false;
var isMouse = false ;
var numberOfCheesePieces = 0;
var mouseScore = 0;

//
var cheese = [];
var bgColor = Colors.background;

function preload(){
    // bgMusic = loadSound("../sounds/bensound-buddy.mp3");
}

function setup() {
    document.getElementById('defaultCanvas0').style.display = "none";
    createCanvas(canvasSize + 1, canvasSize + 1);
    
    socket.on('message', function(id){
        this.id = id;
    });

    registerEventListener('init', init)
    registerEventListener('movePieces', movePieces)
    registerEventListener('catWon', catWon);
    registerEventListener('mouseWon', mouseWon);
    registerEventListener('cheeseEaten', cheeseEaten);
    registerEventListener('catReady', catReady);
    registerEventListener('mouseReady', mouseReady);
    registerEventListener('gameEnded', gameEnded);
}

function draw() {
    noStroke();
    background(bgColor);

    if(!gameStarted) return;

    initializeGrid();

    cheese.forEach(function(key, value){
        key.show();
    });

    ghost.show();
    mouse.show();
    cat.show();
}

function goLeft(){
    if(!gameStarted) return;
    var originalPos; 
    var keyCode = RIGHT_ARROW;
    if(isMouse){
        originalPos = {x: mouse.x, y:mouse.y}
    }
    else{
        originalPos = {x: cat.x, y: cat.y};
    }
    ghost.move(keyCode, originalPos);
};

function goRight(){
    if(!gameStarted) return;
    var originalPos; 
    var keyCode = LEFT_ARROW;
    if(isMouse){
        originalPos = {x: mouse.x, y:mouse.y}
    }
    else{
        originalPos = {x: cat.x, y: cat.y};
    }
    ghost.move(keyCode, originalPos);
};

function goUp(){
    if(!gameStarted) return;
    var originalPos;
    var keyCode = UP_ARROW; 
    if(isMouse){
        originalPos = {x: mouse.x, y:mouse.y}
    }
    else{
        originalPos = {x: cat.x, y: cat.y};
    }
    ghost.move(keyCode, originalPos);
};

function goDown(){
    if(!gameStarted) return;
    var originalPos; 
    var keyCode = DOWN_ARROW;
    if(isMouse){
        originalPos = {x: mouse.x, y:mouse.y}
    }
    else{
        originalPos = {x: cat.x, y: cat.y};
    }
    ghost.move(keyCode, originalPos);
};

function commit(){
    hasMoved = true;
    var data = {    
        gameid: game.id,
        playerid: socket.id,
        x: ghost.x,
        y: ghost.y
    };
    socket.emit('pieceMoved', data);
};

function keyPressed(){
    if(key === "M"){
        if(bgMusic.isPlaying()){
            bgMusic.stop();
        }else{
            bgMusic.loop();
            bgMusic.amp(0.05);
        }
    }
    if(!gameStarted) return;
    if(!hasMoved){
        var originalPos; 
        if(isMouse){
            originalPos = {x: mouse.x, y:mouse.y}
        }
        else{    
            originalPos = {x: cat.x, y: cat.y};
        }
        ghost.move(keyCode, originalPos);

        if (key === ' '){
            commit();
        }
    }
    else{
        console.log("You have to wait for the other player to move!");
    }
}

function initializeGrid(){
    strokeWeight(1);
    stroke(Colors.gridStroke);

    var startX = (mouse.x - mouse.allowedMoves) < 0 ? 0 : mouse.x - mouse.allowedMoves;
    var startY = (mouse.y - mouse.allowedMoves) < 0 ? 0 : mouse.y - mouse.allowedMoves;
    var endX = (mouse.x + mouse.allowedMoves) > numberOfColumns ? numberOfColumns : mouse.x + mouse.allowedMoves;
    var endY = (mouse.y + mouse.allowedMoves) > numberOfColumns ? numberOfColumns : mouse.y + mouse.allowedMoves;

    var startCatX = (cat.x - cat.allowedMoves) < 0 ? 0 : cat.x - cat.allowedMoves;
    var startCatY = (cat.y - cat.allowedMoves) < 0 ? 0 : cat.y - cat.allowedMoves;
    var endCatX = (cat.x + cat.allowedMoves) > numberOfColumns ? numberOfColumns : cat.x + cat.allowedMoves;
    var endCatY = (cat.y + cat.allowedMoves) > numberOfColumns ? numberOfColumns : cat.y + cat.allowedMoves;

    for (var i = 0; i < numberOfColumns; i++){
        for (var u = 0; u < numberOfColumns; u++){
            var bg = true;
            if(i >= startCatX && i <= endCatX && u >= startCatY && u <= endCatY){
                fill(Colors.catRange);
                bg = false;
            }
            if(i >= startX && i <= endX && u >= startY && u <= endY) {
                fill(Colors.range);
                bg = false;
            }
            if(bg){
                fill(Colors.background);
            }
            rect(i*gridSize, u*gridSize, gridSize, gridSize);
        }
    }
}

function initializePlayers(data) {
    mouse = new Square(data.mouse.x, data.mouse.y, gridSize, numberOfColumns, Colors.mouseColor, allowedMovesMouse);
    cat = new Square(data.cat.x, data.cat.y, gridSize, numberOfColumns, Colors.catColor, allowedMovesCat);
    console.log("ID", this.id);
    if(!isMouse){
        ghost = new Square(data.cat.x, data.cat.y, gridSize, numberOfColumns, Colors.sweetBrown, allowedMovesCat);
    }
    else{
        // this.isMouse = true;
        ghost = new Square(data.mouse.x, data.mouse.y, gridSize, numberOfColumns, Colors.sweetBrown, allowedMovesMouse);
    }
}

function initializeCheese(cheeseArray){
    cheese = [];

    cheeseArray.forEach(function(key, value){
        cheese.push(new Square(key.x, key.y, gridSize, numberOfColumns, Colors.cheese));
    });
}

function registerEventListener(eventName, eventFunction){
    socket.on(eventName, eventFunction);
} 

function cheeseEaten(cheeses) {
    mouseScore += 1;
    document.getElementById('score__mouse').innerHTML = numberOfCheesePieces - mouseScore;
    if(isMouse){
        initializeCheese(cheeses.cheese);
    }
}

function catWon(){
    bgColor = Colors.catColor;
    gameStarted = false;
    console.log("Cat won!");
}
function mouseWon(){
    bgColor = Colors.mouseColor; 
    gameStarted = false;
    console.log("Mouse won!");
}

function catReady(){
    document.getElementById('cat-status').className = 'loaded';
}

function mouseReady(){  
    document.getElementById('mouse-status').className = 'loaded';
}

function gameEnded(){  
    if(isMouse){
        document.getElementById('cat-status').className = 'disconnected';
    }else{
        document.getElementById('mouse-status').className = 'disconnected';
    }
    alert('Aw shucks! The other player disconnected :(');
}

function movePieces(data){
    hasMoved = false;
    mouse.x = data.core.mouse.x;
    mouse.y = data.core.mouse.y;
    cat.x = data.core.cat.x;
    cat.y = data.core.cat.y;
    document.getElementById('mouse-status').className = 'loader';
    document.getElementById('cat-status').className = 'loader';
}

function init(data) {
    numberOfCheesePieces = data.core.cheesePieces.length;
    document.getElementById('score__mouse').innerHTML = numberOfCheesePieces;
    game = data;
    if(this.id !== data.core.cat.id){
        isMouse = true;
    }
    // bgMusic.loop();
    // bgMusic.amp(0.05);
    initializePlayers(data.core);
    if(isMouse){
        initializeCheese(data.core.cheesePieces);
    }
    gameStarted = true;
}