var GameModeEnum = Object.freeze({SETUP: 0, PLAY: 1});

// var CollectableModel = require('./collectableModel')
var PlayerCollection = require('./../collections/playerCollection')
var RoomModel = require('./roomModel')
var LevelModel = require('./levelModel')

// GameModel

var GameModel = function(game){
  var gameObject = null
  if (game) {
    // parse from json
    gameObject = getGameObjectFromGameData(game)
  } else {
    // get default game
    gameObject = getDefaultGameObject(game)
  }
  this.playerCollection = gameObject.playerCollection
  this.level = gameObject.level
  this.mode = gameObject.mode
  this.room = gameObject.room
};


// private functions

GameModel.prototype.setRoomDimensions = function(width, depth, height){
  // TODO: move to other class and use correct dimension
  this.room = RoomModel(width, depth, height);
  this.arrangeCollectablesInRoom()
}

GameModel.prototype.arrangeCollectablesInRoom = function(){
  //this.level.collectables.forEach(function(collectable){
  //  // TODO
  //})
}

// GameModel.prototype.getRandomCollectable = function(){
//   // TODO: move to other class and use correct dimension
//
//   if (this.room) {
//     var x = Math.random() * this.room.width;
//     var y = Math.random() * this.room.depth;
//     var z = Math.random() * this.room.height;
//     var collectable = new CollectableModel(0, x, y, z, null, 1);
//     this.collectables.push(collectable);
//   } else {
//     console.log("set room first!");
//   }
// }

module.exports = GameModel;

function getDefaultGameObject(){
  return {
    playerCollection: new PlayerCollection(),
    level: new LevelModel(1),
    room: null,
    mode: GameModeEnum.SETUP
  }
}

function getGameObjectFromGameData(game){
  return {
    playerCollection: new PlayerCollection(game.playerCollection),
    level: new LevelModel(game.level.id, game.level.collectableCollection),
    room: game.room,
    mode: game.mode
  }
}
