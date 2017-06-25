var socket = io.connect('http://localhost:3001');
var clientName;
var roomListDOM;
var roomDOMEntries = {};

registerEventListener("initRoom", initRoom);
registerEventListener("new-game-created", updateGameList);
registerEventListener("game-removed", removeRoom);

socket.on('connect', function(){
    roomListDOM = document.getElementById('room-list');
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

function createPrivateRoom(){
    var data = {
        clientName: clientName
    };
    socket.emit('gameCreated', data);
}

function appendRoomDOM(roomName){
    var aTag = document.createElement('a');
    aTag.setAttribute('href',"/index.html");
    aTag.setAttribute('id', roomName);
    aTag.innerHTML = "<span>" + roomName + "</span>";
    if(!roomDOMEntries.hasOwnProperty(roomName)){
        roomListDOM.appendChild(aTag);
    }
    roomDOMEntries[roomName] = aTag;
}

function removeRoom(roomName){
    if(roomDOMEntries.hasOwnProperty(roomName)){
        roomListDOM.removeChild(document.getElementById(roomName));
        delete roomDOMEntries[roomName];
    }
}