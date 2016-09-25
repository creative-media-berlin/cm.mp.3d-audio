var GameModeEnum = Object.freeze({SETUP: 0, PLAY: 1});

// var CollectableModel = require('./collectableModel')
var PlayerCollection = require('./../collections/playerCollection.js')
var RoomModel = require('./roomModel.js')
var LevelModel = require('./levelModel.js')
var numberOfLevel = 4

// GameModel

var GameModel = function(game){
  var gameObject = null
  if (game) {
    // parse from json
    gameObject = createGameObjectFromGameData(game)
  } else {
    // get default game
    gameObject = createDefaultGameObject()
    gameObject.date = Date.now()
  }
  this.playerCollection = gameObject.playerCollection
  this.level = gameObject.level
  this.mode = gameObject.mode
  this.room = gameObject.room
  if(gameObject.date) this.date = gameObject.date
  this.isRunning = false
};

// private functions

GameModel.prototype.setRoomDimensions = function(width, length){
  this.room = new RoomModel(width, length);
}

GameModel.prototype.addPlayer = function(playerId, callback){
  this.playerCollection.addPlayer(playerId, callback)
}

GameModel.prototype.updateCollectable = function(collectable){
  this.level.updateCollectable(collectable)
}

GameModel.prototype.removeCollectable = function(collctableId){
    this.level.collectables.removeCollectable(collctableId)
}

GameModel.prototype.removePlayer = function(playerId){
  this.playerCollection.removePlayer(playerId)
}

GameModel.prototype.setPlayerInactive = function(playerId) {
    this.playerCollection.setPlayerInactive(playerId)
};

GameModel.prototype.setPlayerActive = function(playerId) {
    this.playerCollection.setPlayerActive(playerId)
};

GameModel.prototype.increaseScoreForPlayer = function(playerId) {
    this.playerCollection.increaseScoreForPlayer(playerId)
};

GameModel.prototype.arrangeCollectablesInRoom = function(room){
  this.level.arrangeCollectablesInRoom(room)
}

GameModel.prototype.wasLastLevel = function(){
  return (this.level.id) == numberOfLevel
}

GameModel.prototype.levelUp = function(){
  var newLevelId = this.level.id + 1
  console.log("---> LEVEL UP! From " + this.level.id + " to >> " + newLevelId)
  this.level = new LevelModel(newLevelId)
}

module.exports = GameModel;

function createDefaultGameObject(){
  return {
    playerCollection: new PlayerCollection(),
    level: new LevelModel(1),
    room: null,
    mode: GameModeEnum.SETUP
  }
}

function createGameObjectFromGameData(game){
  return {
    playerCollection: new PlayerCollection(game.playerCollection),
    level: new LevelModel(game.level.id, game.level.collectableCollection),
    room: game.room,
    date: game.date,
    mode: game.mode
  }
}
