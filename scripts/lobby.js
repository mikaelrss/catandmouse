socket = io.connect('https://serene-sands-13615.herokuapp.com/');
// var socket = io.connect('http://localhost:3001');
var clientName;
var roomListDOM;
var roomDOMEntries = {};
var gameDOM;
var lobbyDOM;
var gameNameDOM;

registerEventListener("initRoom", initRoom);
registerEventListener("new-game-created", updateGameList);
registerEventListener("game-removed", removeRoom);

socket.on('connect', function(){
    roomListDOM = document.getElementById('room-list');
    gameDOM = document.getElementById('game');
    lobbyDOM = document.getElementById('lobby');
    gameNameDOM = document.getElementById('game-name');
    gameDOM.style.display = 'none';
});

function updateGameList(gameList){
    gameList.forEach(function(element) {
        appendRoomDOM(element);
    }, this);
}

function initRoom(data) {
    clientName = data.name;
    data.activeRooms.forEach(function(element) {
        appendRoomDOM(element);
    }, this);
}

function registerEventListener(eventName, eventFunction){
    socket.on(eventName, eventFunction);
} 

function joinGame(roomName){
    var data = {
        roomName: roomName,
        clientName: clientName
    };
    console.log("JOIN", data)
    socket.emit("joinGame", data);
    initializeRoomName(roomName);
    switchView();
}

function createPrivateRoom(){
    var data = {
        clientName: clientName
    };
    socket.emit('gameCreated', data);
    initializeRoomName(clientName)
    switchView();
}

function appendRoomDOM(roomName){
    var liTag = document.createElement('li');
    liTag.setAttribute('id', roomName);
    liTag.innerHTML = roomName   ;
    if(!roomDOMEntries.hasOwnProperty(roomName)){
        roomListDOM.appendChild(liTag);
    }
    roomDOMEntries[roomName] = liTag;
}

function removeRoom(roomName){
    if(roomDOMEntries.hasOwnProperty(roomName)){
        roomListDOM.removeChild(document.getElementById(roomName));
        delete roomDOMEntries[roomName];
    }
}

function switchView(){
    gameDOM.style.display = "block";
    lobbyDOM.style.display = "none";
    document.getElementById('defaultCanvas0').style.display = "block";
}

function initializeRoomName(roomName){
    gameNameDOM.innerHTML = "<h1>" + roomName + "</h1>";
}
