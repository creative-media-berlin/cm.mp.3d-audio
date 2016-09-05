// PlayerUpdateController

var playerConnector = require('./connectors/playerConnector.js'),
  ViewDirectionUpdateController = require('./viewDirectionUpdateController.js');

var PlayerUpdateController = function (dataManager, debugLogs, debugDataLogs) {
  this.dataManager = dataManager
  this.playerSockets = new Array()
  this.debugLogs = debugLogs
  this.debugDataLogs = debugDataLogs
  this.viewDirectionUpdateController = new ViewDirectionUpdateController(dataManager, debugLogs, debugDataLogs)
}

//// Listening to player events / connections

PlayerUpdateController.prototype.listenForPlayerConnection = function (serverSocket, callback) {
  var self = this
  playerConnector.getPlayerServerConnection(serverSocket, function (socket) {
    if (self.playerSockets.length >= 2) callback(0)
    socket.on('player-registration', function (playerId) {
      if (self.debugLogs) console.log('- - - - > PLAYER receive player { ' + playerId + '} connection socket { ', socket.id + " }");
      addPlayerIfNecessary(playerId, socket, self.playerSockets, self.dataManager, callback)
    });

    socket.on('disconnect', function () {
      if (self.playerSockets.length > 0) {
        console.log("socket " + this.id + " disconnected")
        var disconnectedPlayerId = playerIdForSocket(this, self.playerSockets)
        self.playerSockets = filteredSockets(this, self.playerSockets)
        self.dataManager.removePlayer(disconnectedPlayerId) // todo: check is necessary
        // self.dataManager.setPlayerInactive(disconnectedPlayerId)
      } else {
        console.log("nothing to remove")
      }
    });
  });
}

PlayerUpdateController.prototype.listenForPlayersViewDirectionUpdates = function (playerId, callback) {
  // start listening to viewDirection changes of newly connected user
  var self = this
  var playerSocket = socketForPlayerId(playerId, this.playerSockets)
  this.viewDirectionUpdateController.listenForPlayersViewDirectionUpdates(playerId, playerSocket, function(){
    
  })
}

PlayerUpdateController.prototype.listenForPlayersFakePositionMatch = function (playerId) {
  var self = this
  var playerSocket = socketForPlayerId(playerId, this.playerSockets)
  playerSocket.on('fake-position-match', function () {
    var collectables = self.dataManager.getCollectables()
    if (collectables) {
      var collectablesNumber = collectables.length
      if (collectablesNumber > 0) {
        var collectablePosition = collectables[0].location
        self.dataManager.updatePlayerLocation(playerId, collectablePosition, 80)
      }
    }
  })
}

//// Sending events and data to player

// PlayerUpdateController.prototype.sendViewDirectionUpdateToPlayer = function (playerId) {
//   var self = this
//   var player = this.dataManager.currentGame.playerCollection.playerForId(playerId)
//   if (player) {
//     self.sendToPlayer(player.id, "player-vd-updates", {
//       viewDirection: player.viewDirection,
//       playerId: playerId
//     })
//   }
// }

////// Sending Game events to player

// to all player

PlayerUpdateController.prototype.resetAllPlayersVD = function () {
  this.sendToAllPlayer("reset-vd")
}

PlayerUpdateController.prototype.sendPositionsUpdateToAllPlayer = function () {
  var self = this
  var players = this.dataManager.getPlayers()
  players.forEach(function (player) {
    if (player) {
      self.sendToPlayer(player.id, "player-position-update", {
        location: player.location,
      })
    }
  })
}

PlayerUpdateController.prototype.sendCollectableDeletedEventToAllPlayer = function (collectableId) {
  this.sendToAllPlayerIfGameRunning("collectable-deleted", {
    collectableId: collectableId
  })
}

PlayerUpdateController.prototype.sendCollectableUpdateToAllPlayer = function (collectable) {
  this.sendToAllPlayerIfGameRunning("collectable-update", {
    collectable: collectable
  })
}

PlayerUpdateController.prototype.sendLevelUpdateToAllPlayer = function () {
  this.sendToAllPlayerIfGameRunning("level-update", {
    game: this.dataManager.currentGame
  })
}

PlayerUpdateController.prototype.sendRoomToAllPlayer = function () {
  // TODO: check if needed
  var room = this.dataManager.currentGame.room
  console.log(room)
  this.sendToAllPlayerIfGameRunning("room-update", {
    room: room
  })
}

PlayerUpdateController.prototype.sendStartGame = function () {
  var currentGame = this.dataManager.currentGame
  this.sendToAllPlayer("game-start", currentGame)
}

PlayerUpdateController.prototype.sendStopGame = function () {
  var winnerId = this.dataManager.getWinnerId()
  if (winnerId) {
    this.sendGameWonToAllPlayer(winnerId)
  }
  this.sendToAllPlayer("game-stop", null)
}

PlayerUpdateController.prototype.sendCollisionDetectionEvent = function (playerId) {
  this.sendToAllPlayerIfGameRunning("collision-detection", {
    playerId: playerId
  })
}

PlayerUpdateController.prototype.sendGameWonToAllPlayer = function (winnerId) {
  this.sendToAllPlayer("game-won", { winnerId: winnerId })
}

//////// Helper methods

PlayerUpdateController.prototype.sendToAllPlayerIfGameRunning = function (eventName, data) {
  if (this.dataManager.currentGame.isRunning) {
    this.sendToAllPlayer(eventName, data)
  }
}

PlayerUpdateController.prototype.sendToAllPlayer = function (eventName, data) {
  var self = this
  var players = this.dataManager.getPlayers()
  players.forEach(function (player) {
    self.sendToPlayer(player.id, eventName, data)
  })
}

PlayerUpdateController.prototype.sendToPlayer = function (playerId, eventName, data) {
  var playerSocket = socketForPlayerId(playerId, this.playerSockets)
  if (playerSocket) {
    playerSocket.emit(eventName, data)
  } else {
    this.removeAllActionsForPlayer(playerId)
  }
}

PlayerUpdateController.prototype.removeAllActionsForPlayer = function (playerId) {
  var socketPlayerObject = socketPlayerObjectForPlayerId(playerId, this.playerSockets)
  if (socketPlayerObject) {
    socketPlayerObject.actions.forEach(function (action) {
      clearInterval(item.action)
    })
    socketPlayerObject.actions = []
  }
}


module.exports = PlayerUpdateController

// private methods

function addPlayerIfNecessary(playerId, socket, socketCollection, dataManager, callback) {
  // TODO: change logic here!
  if (!doesPlayerSocketAlreadyExists(playerId, socketCollection)) {
    socket.emit("successful-registered", {playerId: playerId})
    addNewPlayer(playerId, dataManager, function (player) {
      socketCollection.push({playerId: player.id, socket: socket, actions: new Array()})
      callback(player.id)
    })
  } else {
    replacePlayerSocket(playerId, socket)
    var errorMsg = "Player with od " + playerId + " already existed; new socket: " + socket.id
    socket.emit("successful-registered", {error: errorMsg})
    console.log(errorMsg)
    callback(playerId)
  }
}

function addNewPlayer(playerId, dataManager, callback) {
  dataManager.addPlayer(playerId, function (player) {
    if (player) {
      console.log('player id: ' + player.id + " registered")
    }
    callback(player);
  });
}

function filteredSockets(socket, socketCollection) {
  return socketCollection.filter(function (item) {
    return item.socket.id != socket.id
  })
}

function doesPlayerSocketAlreadyExists(playerId, socketCollection) {
  if (socketCollection.length == 0) return false
  return (playerIdForSocket(playerId, socketCollection) != -1)
}

function replacePlayerSocket(playerId, socket, socketCollection) {
  var item = socketCollection.find(function (item) {
    return item.playerId == playerId
  })

  item.socket = socket
}

function socketForPlayerId(playerId, socketCollection) {
  if (socketCollection.length == 0) return null
  var item = socketPlayerObjectForPlayerId(playerId, socketCollection)
  if (item) {
    return item.socket
  } else {
    return null
  }
}

function socketPlayerObjectForPlayerId(playerId, socketCollection) {
  if (socketCollection.length == 0) return null
  return socketCollection.find(function (item) {
    return item.playerId == playerId
  })
}

function playerIdForSocket(socket, socketCollection) {
  var item = socketCollection.find(function (item) {
    return item.socket.id == socket.id
  })

  if (item) {
    return item.playerId
  } else {
    return -1
  }
}


