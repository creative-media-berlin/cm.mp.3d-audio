// viewDirectionUpdateController

var ViewDirectionUpdateController = function(dataManager) {
  this.dataManager = dataManager
}

ViewDirectionUpdateController.prototype.listenForPlayersViewDirectionUpdates = function(playerSocket, playerId, callback){
  var self = this
  // TODO: Listen to gyro data per connected player
  if (this.dataManager.currentGame) {
    playerSocket.on('gyro-data', function(data){
      console.log('- - - - > GYRO receive data for event for "gyro-data" from player ' + playerId + ' events on /player-data');
      self.dataManager.updatePlayerViewDirection(playerId, data.viewDirection);
      if (callback) callback()
    });
  }
}

module.exports = ViewDirectionUpdateController

// private methods