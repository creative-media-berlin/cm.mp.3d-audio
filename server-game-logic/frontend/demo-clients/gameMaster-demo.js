var gameMasterClientSocket = io.connect('http://'+serverIP+':8080/game-master');

var sender = null

gameMasterClientSocket.on('connect', function () {
  // sender = setInterval(startSendingGameMasterData, 10000);
  startSendingGameMasterData()
  document.getElementById("game-master-demo-state").style.backgroundColor = "green";
  gameMasterClientSocket.on('game-master-updates', function (data) {
    // visualize game data
    if (showConsoleLogs) document.getElementById("game-master-demo-data").innerHTML = "level(id:",data.level.id,", collectables:",data.level.collectables,", scene:", data.level.scene,")"
    //console.log("game data update: " , data)
  });

  document.getElementById('start-game').onclick = function(){
        console.log("start-game")
        gameMasterClientSocket.emit("game-start", {})
    }
    document.getElementById('start-game-1').onclick = function(){
        console.log("start-game-1")
        gameMasterClientSocket.emit("game-start", {gameId:1})
    }

  document.getElementById('stop-game').onclick = function(){
    console.log("stop-game")
    gameMasterClientSocket.emit("game-stop")
  }
  document.getElementById('reset-player-vd').onclick = function(){
    console.log("reset-player-vd")
    gameMasterClientSocket.emit("reset-player-vd")
  }
});

gameMasterClientSocket.on('disconnect', function(err) {
  document.getElementById("game-master-demo-state").style.backgroundColor = "red";
  document.getElementById("game-master-demo-data").innerHTML = err
  if(sender) clearInterval(sender);
});

gameMasterClientSocket.on('error', function(err) {
  document.getElementById("game-master-demo-state").style.backgroundColor = "red";
  document.getElementById("game-master-demo-data").innerHTML = err
  if(sender) clearInterval(sender);
});


function startSendingGameMasterData(){
  gameMasterClientSocket.emit("collectable-location-data", {
    collectable:
      {
        id: 1,
        location: {
          x: 0.4,
          y: 0.5,
          z: 0.6
        }
      }
  });
}
