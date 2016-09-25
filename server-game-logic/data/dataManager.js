var jsonfile = require('jsonfile'),
    GameCollection = require('./collections/gameCollection'),
    GameModel = require('./models/gameModel'),
    path = require('path');

jsonfile.spaces = 2;

// DataManager - PUBLIC

var DataManager = function(){
  var self = this
  this.file = path.resolve(__dirname,'data.json')
  this.currentGame = null
};

DataManager.prototype.loadGames = function(callback){
  var self = this
  console.log("gameCollection loading.. ")
  readData(self.file, function(json){
    if (json) {
      self.games = new GameCollection(json.items)
    } else {
        self.games = new GameCollection()
    }
    callback()
  });
};

DataManager.prototype.resetGame = function(){
  var players = this.getPlayers()
  players.forEach(function(player){
    player.score = 0
  })
  this.currentGame = new GameModel()
  this.currentGame.playerCollection.items = players
}


DataManager.prototype.tranferScorefromOldGame = function(oldGame){
    var currentPlayers = this.getPlayers()
    oldGame.playerCollection.items = currentPlayers
    return oldGame
}

DataManager.prototype.setInitialGame = function(){
    // needed to store player before starting the game
    var initialGame = new GameModel()
    this.currentGame = initialGame
};

DataManager.prototype.getWinnerId = function(){
  // needed to store player before starting the game
  var players = this.getPlayers()
  var winnerId = null
  var maxScore = 0

  players.forEach(function(player){
    if (player.score > maxScore) {
      maxScore = player.score
      winnerId = player.id
    }
  })

  return winnerId;
};


DataManager.prototype.addNewGame = function(newGame){
  this.games.addGame(newGame)
  return newGame
};

DataManager.prototype.levelUp = function(){
  this.currentGame.levelUp()
  console.log("level : " + this.currentGame.level.id + " # collectabels: " + this.currentGame.level.collectables.items.length)
}

DataManager.prototype.getPlayers = function(){
  if (this.currentGame) {
    return this.currentGame.playerCollection.items
  }
  return []
};

DataManager.prototype.setRoomDimensions = function(width, length){
    if (this.currentGame) {
        this.currentGame.setRoomDimensions(width, length)
    }
}

DataManager.prototype.getActivePlayers = function(){
  if (this.currentGame) {
    var currentPlayers = this.currentGame.playerCollection.items
    return currentPlayers.filter(function(){

    })
  }
  return []
};

DataManager.prototype.getCollectables = function(){
  if (this.currentGame) {
    return this.currentGame.level.collectables.items
  }
  return []
};

DataManager.prototype.saveGames = function(callback){
    writeData(this.games, this.file, callback)
};

DataManager.prototype.addPlayer = function(playerId, callback){
  this.currentGame.addPlayer(playerId, callback)
};

DataManager.prototype.removePlayer = function(playerId) {
  this.currentGame.removePlayer(playerId)
};

DataManager.prototype.setPlayerInactive = function(playerId) {
  this.currentGame.setPlayerInactive(playerId)
};

DataManager.prototype.setPlayerActive = function(playerId) {
  this.currentGame.setPlayerActive(playerId)
};

DataManager.prototype.increaseScoreForPlayer = function(playerId) {
    this.currentGame.increaseScoreForPlayer(playerId)
};

DataManager.prototype.updateCollectable = function(collectable){
  if (this.currentGame){
    this.currentGame.updateCollectable(collectable)
  }
};

DataManager.prototype.removeCollectable = function(collectableId){
    this.currentGame.removeCollectable(collectableId)
}

// PUBLIC - update methods

DataManager.prototype.updateRoom = function(width, length){
  if (this.currentGame) {
    this.currentGame.setRoomDimensions(width, length)
  }
}

DataManager.prototype.updatePlayerLocation = function(playerId, hipPosition, distanceToHead){
  if (this.currentGame) {
    var playerCollection = this.currentGame.playerCollection
    playerCollection.updatePlayerLocation(playerId, hipPosition, distanceToHead)
  }
}

DataManager.prototype.updatePlayerViewDirection = function(playerId, viewDirection){
  if (this.currentGame) {
    var playerCollection = this.currentGame.playerCollection
    playerCollection.updatePlayerViewDirection(playerId, viewDirection)
  }
}

// DataManager - PRIVATE

var readData = function(file, callback){
  jsonfile.readFile(file, function(err, obj) {
    if(err) console.log("error: " + err)
      if (obj.items){
          if (obj.items.length) {
              console.log("read: " + obj.items.length + " games")
          }
      }
    // console.log(obj)
    callback(obj)
  })
};

var writeData = function(obj, file, callback){
  if (obj) {
    jsonfile.writeFile(file, obj, function (err) {
      if(err) console.error(err)
      console.log("wrote: " + obj.items.length + " games")
      // console.log(obj)
      callback()
    })
  } else {
    console.log("nothing to write!")
  }
};

module.exports = DataManager
