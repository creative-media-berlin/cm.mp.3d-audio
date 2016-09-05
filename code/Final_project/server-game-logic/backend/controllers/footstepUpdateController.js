//// footstepUpdateController

kinectConnector = require('./connectors/kinectConnector.js');

var FootstepUpdateController = function(dataManager, debugLogs){
    this.dataManager = dataManager
    this.debugLogs = debugLogs
}

FootstepUpdateController.prototype.listenForFootstepUpdates = function(serverSocket, callback, onUpdateCallback){
    var self = this
    kinectConnector.getkinectFootStepServerConnection(serverSocket, function(socket){
        if (callback) callback(socket)
        socket.on('kinect-footstep-data', function(data){
            if (self.debugLogs) console.log('- - > KINECT receive data for event for "kinect-footstep-data" events on /kinect');
            onUpdateCallback(data)
        })
    })
}

module.exports = FootstepUpdateController

// private methods
