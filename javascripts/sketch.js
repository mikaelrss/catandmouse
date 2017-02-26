//identifiers
var socket;
var game;
var id;

//grid
var canvasSize = 580;
var numberOfColumns = 24;
var gridSize = canvasSize / numberOfColumns;

//entities
var mouse;
var ghost;
var cat;
var allowedMovesMouse = 2;
var allowedMovesCat = 4;

//dynamics
var hasMoved = false;
var gameStarted = false;
var isMouse = false ;

//
var cheese = [];

function setup() {
    // Use for local development.
    // Also switch port variable in nodeserver.js

    // socket = io.connect('http://localhost:3001');
    socket = io.connect('http://serene-sands-13615.herokuapp.com/');
    createCanvas(canvasSize + 1, canvasSize + 1);

    socket.on('connect', function(){
        id = socket.id;
    });

    socket.on('init', function(data){
        game = data;
        console.log(data);
        initializePlayers(data.core);
        if(isMouse){
            initializeCheese(data.core.cheesePieces);
        }
        gameStarted = true;
    });

    socket.on('movePieces', function(data){
        hasMoved = false;
        mouse.x = data.core.mouse.x;
        mouse.y = data.core.mouse.y;
        cat.x = data.core.cat.x;
        cat.y = data.core.cat.y;
    });

    socket.on('catWon', function(){
        gameStarted = false;
        console.log("Cat won!");
    });

    socket.on('cheeseEaten', function(cheeses){
        console.log("ateCHeese");
        initializeCheese(cheeses.cheese);
    });

    socket.on('mouseWon', function(){
        gameStarted = false;
        console.log("Mouse won!");
    });
}

function draw() {
    noStroke();
    background(Colors.background);

    if(!gameStarted) return;

    initializeGrid();

    cheese.forEach(function(key, value){
        // console.log(key)
        key.show();
    });

    ghost.show();
    mouse.show();
    cat.show();
}

function keyPressed(){
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
            hasMoved = true;
            var data = {    
                gameid: game.id,
                playerid: socket.id,
                x: ghost.x,
                y: ghost.y
            };
            socket.emit('pieceMoved', data);
        }
    }
    else{
        console.log("You have to wait for the other player to move!");
    }
}

function initializeGrid(){
    strokeWeight(2);
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

    if(this.id == data.cat.id){
        ghost = new Square(data.cat.x, data.cat.y, gridSize, numberOfColumns, Colors.sweetBrown, allowedMovesCat);
    }
    else{
        isMouse = true;
        ghost = new Square(data.mouse.x, data.mouse.y, gridSize, numberOfColumns, Colors.sweetBrown, allowedMovesMouse);
    }
}

function initializeCheese(cheeseArray){
    console.log(cheeseArray)
    cheese = [];

    cheeseArray.forEach(function(key, value){
        cheese.push(new Square(key.x, key.y, gridSize, numberOfColumns, Colors.cheese));
    });
}