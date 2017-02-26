var canvasSize = 580;
var numberOfColumns = 24;
var gridSize = canvasSize / numberOfColumns;
var enemySquare;
var mouse;
var ghost;
var socket;
var cat;
var hasMoved = false;
var gameStarted = false;
var id;
var isMouse = false;
var players = [];
var game;

function setup() {
    // Use for local development.
    // Also switch port variable in nodeserver.js

    // socket = io.connect('https:localhost:3001');
    socket = io.connect('http://serene-sands-13615.herokuapp.com/');
    createCanvas(canvasSize + 1, canvasSize + 1);

    socket.on('connect', function(){
        id = socket.id;
    });

    socket.on('init', function(data){
        game = data;
        initializePlayers(data.core);
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
}

function draw() {
    noStroke();
    background(Colors.background);

    if(!gameStarted) return;

    initializeGrid();

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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    mouse = new Square(data.mouse.x, data.mouse.y, gridSize, numberOfColumns, Colors.mouseColor, 2);
    cat = new Square(data.cat.x, data.cat.y, gridSize, numberOfColumns, Colors.catColor, 3);

    if(this.id == data.cat.id){
        ghost = new Square(data.cat.x, data.cat.y, gridSize, numberOfColumns, Colors.sweetBrown, 3);
    }
    else{
        isMouse = true;
        ghost = new Square(data.mouse.x, data.mouse.y, gridSize, numberOfColumns, Colors.sweetBrown, 2);
    }
}