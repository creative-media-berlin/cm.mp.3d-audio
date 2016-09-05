// playerConnector

module.exports = {
  getPlayerServerConnection: function(serverSocket, callback) {
    console.log('listening for connecting player');
    serverSocket.of('/player')
      .on('connection', function (socket) {
        console.log('new connection on server socket: ' + socket.id + "endpoint: " + socket.nsp.name);
        callback(socket)
      });
    }
}
