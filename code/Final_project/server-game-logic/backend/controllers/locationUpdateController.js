// locationUpdateController

locationModel = require('./../../data/models/playerLocationModel.js');
kinectConnector = require('./connectors/kinectConnector.js');

var LocationUpdateController = function (dataManager, debugLogs) {
  this.dataManager = dataManager
  this.debugLogs = debugLogs
  this.kinectSocket = null
}

LocationUpdateController.prototype.listenForLocationUpdates = function (serverSocket, callback, callback2) {
  var self = this
  kinectConnector.getkinectServerConnection(serverSocket, function (socket) {
    // if (!self.kinectSocket) {
      self.kinectSocket = socket
      socket.on('kinect-location-data', function (data) {
        if (self.debugLogs) console.log('- - > KINECT receive data for event for "kinect-location-data" events on /kinect-location');
        if (self.dataManager.currentGame) {
          playerLocations = data.playerLocations;
          if (playerLocations) {
            for (var i in playerLocations) {
              self.dataManager.updatePlayerLocation(playerLocations[i].playerId, playerLocations[i].hipPosition, playerLocations[i].distanceToHead);
            }
            if (callback) callback()
            // if (callback2) callback2()
          } else {
            console.log("Can't read player locations from Kinect " + data.Kinect)
          }
        }
      })

      socket.on('disconnect', function () {
        // callback = null
        // callback2 = null
        // self.kinectSocket = null
      })

      if (callback) callback({socket: socket})
    // } else {
    //   console.log("!!! Can only listen to on kinect component")
    // }
  })
}

LocationUpdateController.prototype.listenForRoomUpdates = function (kinectSocket, callback) {
  var self = this
  kinectSocket.on('room-update', function (data) {
    var room = data.room
    if (room) {
      self.dataManager.setRoomDimensions(room.width, room.length)
      if (callback) callback()
    } else {
      console.log(":boom: wrong format")
    }
  })
}

module.exports = LocationUpdateController

// private methods
