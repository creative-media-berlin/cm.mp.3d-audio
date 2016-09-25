// collectablesUpdateController

var emoji = require('node-emoji');

var CollectablesUpdateController = function(dataManager, debugLogs) {
  this.dataManager = dataManager;
  this.debugLogs = debugLogs;
}

CollectablesUpdateController.prototype.listenForCollectableLocationUpdates = function(gameMasterSocket, callback, onUpdateCallback){
  var self = this
  if (callback) callback()
  gameMasterSocket.on("collectable-location-data", function(data){
    var collectable = data.collectable
    if (collectable && self.dataManager.currentGame){
      self.dataManager.updateCollectable(collectable)
      if (onUpdateCallback) onUpdateCallback(collectable)
    } else {
      console.log(emoji.get(':boom:'), " collectable data has incorrect format")
    }
  });
}

module.exports = CollectablesUpdateController

// private methods
