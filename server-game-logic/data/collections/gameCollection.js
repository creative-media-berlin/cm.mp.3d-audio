var GameModel = require('./../models/gameModel')
var PlayerCollection = require('./../collections/playerCollection')

// GameCollection - PUBLIC

var GameCollection = function(gameArray) {
  if (gameArray) {
    this.items = getGameObjectsFromData(gameArray)
  } else {
    this.items = []
  }
};

GameCollection.prototype.addNewGame = function(){
  var newGame = new GameModel()
  this.addGame(newGame)
}

GameCollection.prototype.addGame = function(game){
  this.items.push(game);
};

module.exports = GameCollection;

// PRIVATE functions

function getGameObjectsFromData(gameArray){
  var items = new Array()
  gameArray.forEach(function(gameItem){ // (var i = 0; i < gameArray.length; i++) {
    items.push(new GameModel(gameItem));
  })
  return items
}
