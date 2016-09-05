// kinectConnector

module.exports = {
  getkinectServerConnection: function(serverSocket, callback) {
    serverSocket.of('/kinect-location')
          .on('connection', function (socket) {
            console.log('port: ' + socket.id + ' listening for "kinect-location-data" events on /kinect-location');
            callback(socket);
          })
  },
   getkinectFootStepServerConnection: function(serverSocket, callback) {
    serverSocket.of('/kinect-footsteps')
          .on('connection', function (socket) {
            console.log('listening for "kinect-footsteps-data" events on /kinect-footsteps');
            callback(socket);
          });
  }
};
