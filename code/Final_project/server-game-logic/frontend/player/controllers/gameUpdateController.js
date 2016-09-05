// GameUpdateController

var SoundController = require('./sound/soundController.js');
var gameLogsContainer = document.getElementById('game-logs');
var serverDataContainer = document.getElementById('server-data');
var serverDataContainer2 = document.getElementById('server-data2');
var roomDebugContainer = document.getElementById('room');

var GameUpdateController = function (playerClientSocket) {
  this.playerClientSocket = playerClientSocket;  // check if storing is possible
  this.soundController = null;
  this.game = null
}

GameUpdateController.prototype.startGame = function (game) {
  var self = this
  self.soundController = new SoundController(game)
  self.soundController.playGameStartSounds(function () {
    self.soundController.updateScene(game.level, function(){
      self.soundController.startSounds()
    })
  })
}

GameUpdateController.prototype.stopGame = function () {
  if (this.soundController) this.soundController.stopSounds()
}

GameUpdateController.prototype.updateListenerViewDirection = function(viewDirection){
  if (this.soundController) this.soundController.updateListenerViewDirection(viewDirection)
}

GameUpdateController.prototype.deleteCollectableSound = function (collectableId) {
  if (this.soundController) this.soundController.deleteCollectableSound(collectableId)
}

GameUpdateController.prototype.listenToServerUpdates = function () {
  var self = this;

  self.playerClientSocket.on('game-start', function (game) {
    if (showConsoleLogs) gameLogsContainer.innerHTML = "game started"
    self.startGame(game)
  });

  self.playerClientSocket.on('game-stop', function () {
    if (showConsoleLogs) gameLogsContainer.innerHTML += "   + game stopped"
    if (self.soundController) self.soundController.announceGameStop()
    self.stopGame()
  });

  self.playerClientSocket.on('collectable-deleted', function (data) {
    if (showConsoleLogs) gameLogsContainer.innerHTML = gameLogsContainer.innerHTML + ' + collectable-deleted event for collectableId: ' + data.collectableId
    self.deleteCollectableSound(data.collectableId)
  });

  self.playerClientSocket.on('level-update', function (data) {
    if(self.soundController) {
      if (showConsoleLogs) gameLogsContainer.innerHTML = gameLogsContainer.innerHTML + ' + level-update'
      var level = data.game.level
      if (level) {
        if (self.soundController) {
          if (showConsoleLogs) gameLogsContainer.innerHTML = 'level-update > soundController : -updateScene'
          self.soundController.updateScene(level, function(){
            self.soundController.startSounds()
          })
        } else {
          if (showConsoleLogs) console.log("level-update: no soundController!")
        }
      }
    }
  });
  
  self.playerClientSocket.on('room-update', function (data) {
    if (self.soundController) {
      // if (showConsoleLogs) gameLogsContainer.innerHTML =  gameLogsContainer.innerHTML + " updateRoom " + game.room.width + " / " + game.room.height + " / " + game.room.length

      // roomDebugContainer.innerHTML = ">> updateRoom roomSize in new SceneModel: w: " + room.width + " / l: " + room.width
      //
      // self.soundController.updateRoom(room)
    }
  });

  self.playerClientSocket.on('player-position-update', function (data) {
    if(self.soundController){
      var location = data.location
      if (location) {
        self.soundController.updateListenerPosition(location)
        if (location) {
        var locationString =  "<br />hipPosition:<br />x: " + location.hipPosition.x + "<br />y: " + location.hipPosition.y + "<br />z: " +  location.hipPosition.z + "<br />distanceToHead: " + location.distanceToHead
          serverDataContainer.innerHTML = "data update for playerId: " + data.playerId + ": " + locationString
        }
      }
    }
  });

  self.playerClientSocket.on('collectable-update', function (data) {
    var collectable = data.collectable
    if (collectable) {
      if (showConsoleLogs) gameLogsContainer.innerHTML = "collectable-update " + collectable.id + "   location: x: " + collectable.location.x + " y: " + collectable.location.y + " z: " + collectable.location.z
      self.soundController.updateCollectable(collectable.id, collectable.location)
    }
  });

  self.playerClientSocket.on('game-pause', function () {

  });

  self.playerClientSocket.on('disconnect', function () {
    if (showConsoleLogs) gameLogsContainer.innerHTML = "playerClientSocket disconnect"
    if (self.soundController) self.soundController.stopSounds()
  })

  self.playerClientSocket.on('error', function () {
    if (showConsoleLogs)  gameLogsContainer.innerHTML = "playerClientSocket error"
    if (self.soundController) self.soundController.stopSounds()
  })

  // Announcements

  self.playerClientSocket.on('player-footstep', function (footstep) {
    if (self.soundController) self.soundController.playFootstepSound(footstep.position, footstep.footstep)
  })

  self.playerClientSocket.on('game-won', function (data) {
    if (showConsoleLogs) gameLogsContainer.innerHTML += "game stopped .. won by player " + data.winnerId
    if (self.soundController) self.soundController.announceWinner(data.winnerId)
  });

  self.playerClientSocket.on('collision-detection', function (data) {
    if (showConsoleLogs) gameLogsContainer.innerHTML = gameLogsContainer.innerHTML + ' + collision-detection player: ' + data.playerId
    if (self.soundController) self.soundController.announcePlayerPointed(data.playerId)
  });


}

module.exports = GameUpdateController