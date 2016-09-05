//require('./../../helper/mathOperations.js');

var serveripStorage = require('./../../public/server-ip-address.js'),
  serverip = (new serveripStorage()).ip,
  PlayerUpdateController = require('./controllers/playerUpdateController.js'),
  playerUpdateController = new PlayerUpdateController(serverip),
  serverConnectContainer = document.getElementById('server-connection');


serverConnectContainer.innerHTML = "NO (serverip: " + serverip + ")";
setUpButtons();

function startPlayerApp(playerId) {
  if (!playerUpdateController.connected) {
    playerUpdateController.startPlayerApp(playerId, function (error) {
      if (showConsoleLogs) console.log("startPlayerApp  error:", error)
      if (error) {
        serverConnectContainer.innerHTML = error;
      } else {
        serverConnectContainer.innerHTML = "connected";
      }
    });
  }
}

function stopPlayerApp() {
  playerUpdateController.stopPlayerApp()
  serverConnectContainer.innerHTML = (playerUpdateController.connected) ? "connected" : "disconnected";
}

function setUpButtons() {
  document.getElementById('1').onclick = function () {
    startPlayerApp(1);
    document.getElementById('2').disabled = true;
  }

  document.getElementById('2').onclick = function () {
    startPlayerApp(2);
    document.getElementById('1').disabled = true;
  }

  document.getElementById('stop').onclick = function () {
    stopPlayerApp();
    document.getElementById('1').disabled = false;
    document.getElementById('2').disabled = false;
  }

  document.getElementById('match').onclick = function () {
    playerUpdateController.fakePositionMatch()
  }
}






