// gameMasterUpdateController

gameMasterConnector = require('./connectors/gameMasterConnector.js');

var GameMasterUpdateController = function(dataManager, debugLogs){
    this.dataManager = dataManager
    this.gameMasterSocket = null
    this.debugLogs = debugLogs
}

GameMasterUpdateController.prototype.listenForGameMasterUpdates = function(serverSocket, callback){
    var self = this
    gameMasterConnector.getGameMasterServerConnection(serverSocket, function(socket){
        if (self.gameMasterSocket) {
            console.log("only one game master possible, sorry :/")
            callback(null)
        } else {
            self.gameMasterSocket = socket
            console.log("game master socket: ", socket.id)
            self.gameMasterSocket.on("disconnect", function(){
                console.log("gameMasterSocket " + this.id + "disconnected")
                self.gameMasterSocket = null
            })
            self.gameMasterSocket.on("error", function(){
                console.log("gameMasterSocket " + this.id + "error")
                self.gameMasterSocket = null
            })
            callback(socket)
        }
    })
}

GameMasterUpdateController.prototype.listenForPlayerViewDirectionReset = function(callback) {
    var self = this
    if (self.gameMasterSocket) {
        self.gameMasterSocket.on('reset-player-vd', function(){
            callback()
        })
    }
}

GameMasterUpdateController.prototype.listenForGameStart = function(callback) {
    var self = this
    if (self.gameMasterSocket) {
        self.gameMasterSocket.on('game-start', function(data) {
            callback(data.gameId)
        })
    }
}

GameMasterUpdateController.prototype.listenForGameLoad = function(callback) {
    var self = this
    if (self.gameMasterSocket) {
        self.gameMasterSocket.on('game-load', function(data){
            var gameId = data.gameId
            if (gameId) {
                callback(gameId)
            }
        })
    }
}

GameMasterUpdateController.prototype.listenForGameStop = function(callback) {
    var self = this
    if (self.gameMasterSocket) {
        self.gameMasterSocket.on('game-stop', function(){
            callback()
        })
    }
}

GameMasterUpdateController.prototype.updateGameMaster = function(){
    var self = this
    if (self.gameMasterSocket) {
        setInterval(function(){
            if(self.dataManager.currentGame && self.gameMasterSocket) {
                self.gameMasterSocket.emit('game-master-updates', self.dataManager.currentGame)
            }
        }, 100)
    }
}

GameMasterUpdateController.prototype.sendGamesToGameMaster = function() {
    if (this.gameMasterSocket) {
        this.gameMasterSocket.emit('games-list-update', this.dataManager.games.items)
    }
}

module.exports = GameMasterUpdateController

// private methods
