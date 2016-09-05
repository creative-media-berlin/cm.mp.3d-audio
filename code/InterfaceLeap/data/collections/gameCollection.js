var GameModel = require('./../models/gameModel')
var PlayerCollection = require('./../collections/playerCollection')

// GameCollection - PUBLIC

var GameCollection = function(gameArray) {
  if (gameArray) {
    this.items = getGameObjectsFromData(gameArray)
  } else {
    // no existing games
    this.items = getInititialGame()
  }
};

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

var getInititialGame = function(){
  return [ new GameModel() ]
};
