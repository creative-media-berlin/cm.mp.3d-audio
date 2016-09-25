// PlayerUpdateController

var viewDirectionContainer = document.getElementById('output-view-direction'),
  serverDataContainer = document.getElementById('server-data'),
  serverDataContainer2 = document.getElementById('server-data2'),
  serverConnectionContainer = document.getElementById('server-connection'),
  ViewDirectionController = require('./viewDirectionController.js'),
  GameUpdateController = require('./gameUpdateController.js');

var PlayerUpdateController = function (serverIP) {
  this.serverIP = serverIP;
  this.playerClientSocket = null;
  this.viewDirectionUpdateController = null
  this.connected = false;
  this.gameController = null;
  this.registrationId = null;
}

PlayerUpdateController.prototype.startPlayerApp = function (playerId, callback) {
  if (showConsoleLogs) console.log("PlayerUpdateController.prototype.startPlayerApp")
  var self = this;
  $.getScript('http://' + self.serverIP + ':8080/socket.io/socket.io.js', function () {
    self.playerClientSocket = io.connect('http://' + self.serverIP + ':8080/player');

    self.playerClientSocket.on('connect', function (err) {
      serverConnectionContainer.innerHTML = "connected";
      self.connected = true;
      self.playerClientSocket.emit('player-registration', playerId);
      callback(err);
    });

    self.playerClientSocket.on('successful-registered', function (data) {
      if (data.playerId) {
        self.registrationId = data.playerId
        serverConnectionContainer.innerHTML = "connected as player " + self.registrationId;
        if (showConsoleLogs) console.log("connected as player " + self.registrationId)
        self.viewDirectionController = new ViewDirectionController(self.playerClientSocket);
        // send to server
        self.viewDirectionController.startSendingOrientationData(function (viewDirection) {

          serverDataContainer2.innerHTML = "view direction:\n x: " + viewDirection.x + "<br />y: " + viewDirection.y + "<br />z: " + viewDirection.z + "<br>"
          self.gameController.updateListenerViewDirection(viewDirection)
        });
        self.viewDirectionController.listenForPlayerViewDirectionReset();
        // receive updates from server
        // self.listenToServerUpdates();
        self.initGameController()
      } else {
        if (showConsoleLogs) console.log((data.error) ? "connected, but " + data.error : "connected, but couldn't register as player")
        serverConnectionContainer.innerHTML = (data.error) ? "connected, but " + data.error : "connected, but couldn't register as player"
      }
    });


    self.playerClientSocket.on('error', function (error) {
      self.connected = false;
      if (error) serverDataContainer.innerHTML = error
      callback("No connection, Error: " + error);
    });

    self.playerClientSocket.on('disconnect', function (error) {
      self.connected = false;
      self.viewDirectionController.stopSendingOrientationData()
      self.viewDirectionController = null;
      var msg = (error) ? ("disconnected ", error) : "disconnected";
      callback(msg);
    });
  });
}

PlayerUpdateController.prototype.stopPlayerApp = function () {
  if (showConsoleLogs) console.log('stopPlayerApp')
  if (this.connected) {
    if (this.gameController) this.gameController.stopGame()
    this.playerClientSocket.disconnect();
    this.playerClientSocket = null;
    this.connected = false
  }
}

// PlayerUpdateController.prototype.listenToServerUpdates = function(){
//     var self = this
//     if (self.playerClientSocket){
//         self.playerClientSocket.on('updates', function (data) {
//             //console.log("data update for playerId: " + data.playerId + ": " , data.location)
//             // console.log(data)
//             var locationString =  "<br />hipPosition:<br />x: " + data.location.hipPosition.x + "<br />y: " + data.location.hipPosition.y + "<br />z: " +  data.location.hipPosition.z + "<br />distanceToHead: " + data.location.distanceToHead
//             if (data.viewDirection) {
//                 serverDataContainer.innerHTML = "data update for playerId: " + data.playerId + ": " + locationString + "<br />view direction:\nx: " +  data.viewDirection.x + "<br />y: " +  data.viewDirection.y + "<br />z: " +  data.viewDirection.z
//             } else {
//                 serverDataContainer.innerHTML = "data update for playerId: " + data.playerId + ": " + locationString + "<br />view direction:\nx: ...<br /><br />"
//             }
//         });
//     }
// }

PlayerUpdateController.prototype.initGameController = function () {
  this.gameController = new GameUpdateController(this.playerClientSocket)
  this.gameController.listenToServerUpdates()
}

// TODO: remove, only for debugging! CHEATING

PlayerUpdateController.prototype.fakePositionMatch = function () {
  var self = this
  self.playerClientSocket.emit('fake-position-match')
}

module.exports = PlayerUpdateController;