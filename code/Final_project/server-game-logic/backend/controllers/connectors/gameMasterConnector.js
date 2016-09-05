// gameMasterConnection

module.exports = {
  getGameMasterServerConnection: function(serverSocket, callback) {
    serverSocket.of('/game-master')
      .on('connection', function (socket) {
        console.log('listening for events on /game-master');
        callback(socket)
      });
  }
}
