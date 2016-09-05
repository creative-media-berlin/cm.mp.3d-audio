// read data
var GameModel = require('./../../data/models/gameModel.js')
var emoji = require('node-emoji');

// GameController - PUBLIC

var GameController = function (dataManager, playerUpdateController, debugLogs) {
    this.dataManager = dataManager
    this.playerUpdateController = playerUpdateController
    this.debugLogs = debugLogs
    this.gameMasterUpdaterOn = false
    this.viewDirectionUpdaterOn = false
    this.playerLocationUpdaterOn = false
    this.footStepUpdaterOn = false
    this.collectablesUpdaterOn = false
    this.runningProcess = null
};

GameController.prototype.initNewGame = function (callback) {
    var self = this
    self.dataManager.loadGames(function () {
        console.log("loaded!!")
        self.dataManager.setInitialGame()
        callback()
    });
}

GameController.prototype.loadLastGame = function (callback) {
    console.log("load last Game")
    var self = this
    self.dataManager.loadGames(function () {
        if (self.dataManager.games.items.length > 0) {
            self.dataManager.currentGame = self.games[self.games.length - 1]
        } else {
            console.log('No existing game! Please start a new game.')
        }
        if (callback) callback()
    });
}

GameController.prototype.startGame = function (gameId, callback) {
    console.log("started game")
    if (!gameId) {
        // new plain game with current player initialized when server startet
        // -> add to collection
      var newGame = new GameModel()
      var players = this.dataManager.getPlayers()
      newGame.playerCollection.items = players
      this.dataManager.currentGame = newGame
      this.dataManager.addNewGame(this.dataManager.currentGame)
    } else {
        var loadedGame = this.dataManager.games.items[gameId]
        this.dataManager.currentGame = this.dataManager.tranferScorefromOldGame(loadedGame)
    }
    this.dataManager.currentGame.isRunning = true
    this.run()
    this.playerUpdateController.sendStartGame(this.dataManager.currentGame)

    if (callback) callback()
}

GameController.prototype.levelUp = function () {
  if (this.dataManager.currentGame.wasLastLevel()){
    console.log("was last level!!")
    this.playerUpdateController.sendStopGame()
    this.dataManager.resetGame()
  } else {
    this.dataManager.levelUp();

    // will automatically stop all sounds on client side
    this.playerUpdateController.sendLevelUpdateToAllPlayer()
  }
}

GameController.prototype.run = function () {
    var self = this
    console.log(emoji.emojify(":fire:  :point_right:    run!!!!"))
    var currentLevelId = 0//self.dataManager.currentGame.level.id
    self.runningProcess = setInterval(function () {
        if (self.dataManager.currentGame.isRunning && allUpdatersOn(self)) {
            // TODO: implement game logic
            var players = self.dataManager.currentGame.playerCollection.items
            if (players.length > 0) {
                if (self.debugLogs) console.log(emoji.emojify(":clap:   :fire:   :+1:   :raised_hands:   :beer:    running... with  ") + players.length + "  players")
                var collection = checkForCollision(self.dataManager.getPlayers(), self.dataManager.getCollectables())
                if (collection) {
                    self.increaseScoreForPlayer(collection.playerId)
                    self.removeCollectable(collection.collctableId)
                    if (shouldUpdateLevel(self.dataManager)) {
                        self.levelUp()
                    }
                }
            }
        } else {
            if (self.debugLogs) console.log(emoji.emojify("... waiting for all systems turned  ':white_check_mark:'"))
        }
    }, 100)
}

GameController.prototype.increaseScoreForPlayer = function(playerId){
  this.dataManager.increaseScoreForPlayer(playerId)
  this.playerUpdateController.sendCollisionDetectionEvent(playerId)
}

GameController.prototype.removeCollectable = function(collctableId){
  this.dataManager.removeCollectable(collctableId)
  this.playerUpdateController.sendCollectableDeletedEventToAllPlayer(collctableId)

}

GameController.prototype.stopGame = function (callback) {
    console.log("stopped!  ")
    this.dataManager.currentGame.isRunning = false
    clearInterval(this.runningProcess);
    this.playerUpdateController.sendStopGame()
    if (this.dataManager) {
        // TODO: save game recurvively
        this.dataManager.saveGames(function () {
            console.log("saved!!")
            if (callback) {
                callback()
            }
        });
    }
}


module.exports = GameController;

// GameController - PRIVATE functions

function allUpdatersOn(self) {
    return self.playerLocationUpdaterOn
        // && self.viewDirectionUpdaterOn
        && self.gameMasterUpdaterOn
        && self.collectablesUpdaterOn
    // && self.footStepUpdaterOn
}

function shouldUpdateLevel(dataManager) {
    var collectables = dataManager.getCollectables()
    return (collectables.length == 0)
}

function checkForCollision(players, collectables) {
    var collision = null
    players.forEach(function (player) {
        collectables.forEach(function (collectable) {
            var distance = getDistance(player.location.hipPosition, collectable.location)
          // TODO: test if correct
            if (distance < 0.05) {
                console.log("collision between player " + player.id + " and collectable " + collectable.id)
                collision = {playerId: player.id, collctableId: collectable.id}
            }
        })
    })
    return collision
}

function getDistance(v1, v2) {
    var v = substractVector(v1, v2)
    return Math.sqrt(v.x * v.x + v.z * v.z)
}

function substractVector(v1, v2) {
    return {
        x: v1.x - v2.x,
        z: v1.z - v2.z
    }
}