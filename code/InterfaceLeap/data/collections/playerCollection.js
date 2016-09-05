var PlayerModel = require('./../models/playerModel')
var PlayerLocationModel = require('./../models/playerLocationModel')

// PlayerCollection - PUBLIC

var PlayerCollection = function(playerArray) {
    if(playerArray) {
        this.items = getPlayerObjectsFromGameData(playerArray);
    } else {
        this.items = getDefaultPlayerObjects();
    }
};

PlayerCollection.prototype.addPlayer = function(game){
    this.games.push(game);
};

PlayerCollection.prototype.getItems = function(){
    return this.items;
}

module.exports = PlayerCollection;

// PlayerCollection - PRIVATE functions

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
    for (var i = 0; i < playersArray.length; i++) {
        players.push(new PlayerModel(i, "Player "+i, dafaultPlayerLocation));
    }
    return players;
}
