var playerClientSocket1 = io.connect('http://'+serverIP+':8080/player');

var sender1 = null
var sender2 = null

playerClientSocket1.on('connect', function () {
  playerClientSocket1.emit('player-registration', 1);
  var stateMarker = document.getElementById("player1-demo-state")
  var container = document.getElementById("player1-demo-data")
  stateMarker.style.backgroundColor = "green";
  playerClientSocket1.on('updates', function (data) {
    var locationString =  "<br />hipPosition:<br />x: " + data.location.hipPosition.x + "<br />y: " + data.location.hipPosition.y + "<br />z: " +  data.location.hipPosition.z + "<br />distanceToHead: " + data.location.distanceToHead
    if (data.viewDirection) {
      container.innerHTML = "<b>data update for playerId: " + data.playerId + "</b>: " + locationString + "<br />view direction:\nx: " +  data.viewDirection.x + "<br />y: " +  data.viewDirection.y + "<br />z: " +  data.viewDirection.z
    } else {
      container.innerHTML = "<b>data update for playerId: " + data.playerId + "</b>: " + locationString + "<br />view direction:\nx: ...<br /><br />"
    }
  })
  playerClientSocket1.on('disconnect', function (err) {
    stateMarker.style.backgroundColor = "red";
    container.innerHTML = err
  })
  playerClientSocket1.on('error', function (err) {
    stateMarker.style.backgroundColor = "red";
    container.innerHTML = err
  })


  sender1 = setInterval(startSendingGyroData, 1000);
});

playerClientSocket1.on('disconnect', function(err) {
  showError1(err)
});

playerClientSocket1.on('disconnect', function(err) {
  showError1(err)
});

function startSendingGyroData() {
 playerClientSocket1.emit('view-direction-data', {
   viewDirection: {
     x: 0,
     y: 0,
     z: 0
   }
 })
}

function showError1(err){
  document.getElementById("player1-demo-state").style.backgroundColor = "red";
  document.getElementById("player1-demo-data").innerHTML = err
  if(sender1) clearInterval(sender1);
}

//////////////////////////////


var playerClientSocket2 = io.connect('http://'+serverIP+':8080/player');


playerClientSocket2.on('connect', function () {
  playerClientSocket2.emit('player-registration', 2);
  var container = document.getElementById("player2-demo-data")
  var stateMarker = document.getElementById("player2-demo-state")
  stateMarker.style.backgroundColor = "green";
  playerClientSocket2.on('updates', function (data) {
    var locationString =  "<br />hipPosition:<br />x: " + data.location.hipPosition.x + "<br />y: " + data.location.hipPosition.y + "<br />z: " +  data.location.hipPosition.z + "<br />distanceToHead: " + data.location.distanceToHead
    if (data.viewDirection) {
      container.innerHTML = "<b>data update for playerId: " + data.playerId + "</b>: " + locationString + "<br />view direction:\nx: " +  data.viewDirection.x + "<br />y: " +  data.viewDirection.y + "<br />z: " +  data.viewDirection.z
    } else {
      container.innerHTML = "<b>data update for playerId: " + data.playerId + "</b>: " + locationString + "<br />view direction:\nx: ...<br /><br />"
    }
  })
  playerClientSocket2.on('disconnect', function (err) {
    stateMarker.style.backgroundColor = "red";
    container.innerHTML = err
  })
  playerClientSocket2.on('error', function (err) {
    stateMarker.style.backgroundColor = "red";
    container.innerHTML = err
  })
  sender2 = setInterval(startSendingGyroData2, 1000);
});

playerClientSocket2.on('disconnect', function(err) {
  showError2(err)
});

playerClientSocket2.on('error', function(err) {
  showError2(err)
});

function showError2(err){
  document.getElementById("player2-demo-state").style.backgroundColor = "red";
  document.getElementById("player2-demo-data").innerHTML = err
  if(sender2) clearInterval(sender2);
}

function startSendingGyroData2() {
 playerClientSocket2.emit('view-direction-data', {
   viewDirection: {
     x: 0,
     y: 0,
     z: 0
   }
 })
}
