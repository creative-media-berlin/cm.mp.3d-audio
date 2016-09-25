var PlayerModel = require('./../models/playerModel')
var PlayerLocationModel = require('./../models/playerLocationModel')

// PlayerCollection - PUBLIC

var PlayerCollection = function(playerArray) {
    if(playerArray) {
        this.items = getPlayerObjectsFromGameData(playerArray);
    } else {
        this.items = new Array()
    }
};

PlayerCollection.prototype.addPlayer = function(playerId, callback){
    var defaultPlayerLocation = new PlayerLocationModel( {x:0, y:0, z:0}, 80);
    var newPlayer = new PlayerModel(playerId, defaultPlayerLocation)
    this.items.push(newPlayer)
    callback(newPlayer)
}

PlayerCollection.prototype.removePlayer = function(playerId){
    var filtered = this.items.filter(function(el){ return el.id != playerId});
    this.items = filtered;
    console.log("PlayerCollection: player with id " + playerId + " deleted")
}

PlayerCollection.prototype.setPlayerInactive = function(playerId){
    var player = findPlayerInCollection(playerId, this.items)
    player.active = false;
    console.log("PlayerCollection: player with id " + playerId + " inactive")
}

PlayerCollection.prototype.setPlayerActive = function(playerId){
    var player = findPlayerInCollection(playerId, this.items)
    player.active = true;
    console.log("PlayerCollection: player with id " + playerId + " active")
}

PlayerCollection.prototype.increaseScoreForPlayer = function(playerId){
    var player = findPlayerInCollection(playerId, this.items)
    player.score++
}

PlayerCollection.prototype.playerForId = function(playerId){
    return findPlayerInCollection(playerId, this.items)
}

PlayerCollection.prototype.updatePlayerLocation = function(playerId, hipPosition, distanceToHead){
  if (this.items) {
    var player = findPlayerInCollection(playerId, this.items)
    if (player) {
      player.location.hipPosition = hipPosition
      player.location.distanceToHead = distanceToHead  * 0.1
    }
  }
}

PlayerCollection.prototype.updatePlayerViewDirection = function(playerId, viewDirection){
    if (this.items) {
        var player = findPlayerInCollection(playerId, this.items)
        if (player) {
            player.viewDirection = viewDirection
        }
    }
}

module.exports = PlayerCollection;

// PlayerCollection - PRIVATE functions

function findPlayerInCollection(id, items){
  return items.find(function(player){
    return player.id == id
  })
}

function getDefaultPlayerObjects(){
    var players = new Array();
    var playerLocation = new PlayerLocationModel( { x:0, y:0, z:0}, 80);
    players.push(new PlayerModel(1, "Player 1", playerLocation));
    players.push(new PlayerModel(2, "Player 2", playerLocation));
    return players;
}

function getPlayerObjectsFromGameData(playersArray){
    var players = new Array();
    var dafaultPlayerLocation = new PlayerLocationModel( {x:0, y:0, z:0}, 80);
    for (var i = 1; i < playersArray.length+1; i++) {
        players.push(new PlayerModel(i, "Player "+i, dafaultPlayerLocation));
    }
    return players;
}

