var serverSocket = require('socket.io')(8080),
  DataManager = require('../data/dataManager.js'),
  dataManager = new DataManager()
  GameController = require('./controllers/gameController'),
  LocationUpdateController = require('./controllers/locationUpdateController.js'),
  FootstepUpdateController = require('./controllers/footstepUpdateController.js'),
  PlayerUpdateController = require('./controllers/playerUpdateController.js'),
  GameMasterUpdateController = require('./controllers/gameMasterUpdateController.js'),
  CollectablesUpdateController = require('./controllers/collectablesUpdateController.js');

var emoji = require('node-emoji');
var debugLogs = false;
var debugDataLogs = false;

var InteractSoundServer = function () {
}

InteractSoundServer.prototype.start = function () {
  playerUpdateController = new PlayerUpdateController(dataManager, debugLogs, debugDataLogs);
  gameController = new GameController(dataManager, playerUpdateController, debugLogs);

  gameController.initNewGame(function () {
    locationUpdateController = new LocationUpdateController(dataManager, debugDataLogs)
    gameMasterUpdateController = new GameMasterUpdateController(dataManager, debugLogs)
    footstepUpdateController = new FootstepUpdateController(dataManager, debugDataLogs)
    collectablesUpdateController = new CollectablesUpdateController(dataManager, debugLogs)

    playerUpdateController.listenForPlayerConnection(serverSocket, function (playerId) {
      if (playerId != 0) {
        playerUpdateController.listenForPlayersViewDirectionUpdates(playerId, function () {
          if (!gameController.viewDirectionUpdaterOn) {
            console.log(emoji.get(':white_check_mark:') + "   viewDirectionUpdaterOn")
            gameController.viewDirectionUpdaterOn = true;
          }
        })
        playerUpdateController.listenForPlayersFakePositionMatch(playerId)
      }
    });

    locationUpdateController.listenForLocationUpdates(serverSocket, function (object) {
      if (object){
        if (object.socket) {
          console.log(emoji.get(':white_check_mark:') + "   playerLocationUpdaterOn")
          gameController.playerLocationUpdaterOn = true
          var kinectSocket = object.socket
          locationUpdateController.listenForRoomUpdates(kinectSocket, function () {
            // room update
            playerUpdateController.sendRoomToAllPlayer()
          })
        }
      } else {
        // location update!
        playerUpdateController.sendPositionsUpdateToAllPlayer()
      }
    }, function(){
      playerUpdateController.sendPositionsUpdateToAllPlayer()
    });

    footstepUpdateController.listenForFootstepUpdates(serverSocket, function () {
      if (!gameController.footStepUpdaterOn) {
        console.log(emoji.get(':white_check_mark:') + "   footStepUpdaterOn")
        gameController.footStepUpdaterOn = true;
      }
    }, function (footstep) {
      playerUpdateController.sendToAllPlayerIfGameRunning('player-footstep', footstep)
    })

    gameMasterUpdateController.listenForGameMasterUpdates(serverSocket, function (gameMasterSocket) {
      if (gameMasterSocket) {
        console.log(emoji.get(':white_check_mark:') + "   gameMasterUpdaterOn")
        gameController.gameMasterUpdaterOn = true;
        gameMasterUpdateController.sendGamesToGameMaster();
        gameMasterUpdateController.updateGameMaster();

        collectablesUpdateController.listenForCollectableLocationUpdates(gameMasterSocket, function () {
          if (!gameController.collectablesUpdaterOn) {
            console.log(emoji.get(':white_check_mark:') + "   collectablesUpdaterOn")
            gameController.collectablesUpdaterOn = true;
          }
        }, function (collectable) {
          playerUpdateController.sendCollectableUpdateToAllPlayer(collectable)
        });

        gameMasterUpdateController.listenForGameStart(function (gameId) {
          console.log("!!!!!!! game-start event received")
          gameController.startGame(gameId)
        });

        gameMasterUpdateController.listenForGameStop(function () {
          console.log("!!!!!!! game-stop event received")
          if (dataManager.currentGame.isRunning) {
            gameController.stopGame(function () {
              gameMasterSocket.emit('games-list-update', dataManager.games.items)
            })
          }
        });

        gameMasterUpdateController.listenForPlayerViewDirectionReset(function () {
          var self = this
          console.log("!!!!!!! reset-player-vd event received")
          playerUpdateController.resetAllPlayersVD()
        })
      }
    });
  });
};

module.exports = InteractSoundServer;

