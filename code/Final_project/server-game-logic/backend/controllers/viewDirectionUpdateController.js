// viewDirectionUpdateController

var ViewDirectionUpdateController = function(dataManager, debugLogs,debugDataLogs) {
  this.dataManager = dataManager
  this.debugLogs = debugLogs
  this.debugDataLogs = debugDataLogs
}

ViewDirectionUpdateController.prototype.listenForPlayersViewDirectionUpdates = function(playerId, playerSocket, callback){
  var self = this
  // TODO: Listen to gyro data per connected player (mobile)
  if (this.dataManager.currentGame) {
    playerSocket.on('view-direction-data', function(data){
      if (self.debugDataLogs) console.log('- - - - > View-Direction receive data for event for "view-direction-data" from player ' + playerId + '\n events on /player-data ', data.viewDirection);
      self.dataManager.updatePlayerViewDirection(playerId, data.viewDirection);
      if (callback) callback(playerId)
    });
  }
}

module.exports = ViewDirectionUpdateController

// private methods
