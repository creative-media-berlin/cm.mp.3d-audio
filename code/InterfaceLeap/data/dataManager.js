var jsonfile = require('jsonfile'),
    file = './data/data.json',
    GameCollection = require('./collections/gameCollection')

jsonfile.spaces = 2;

// DataManager - PUBLIC

var DataManager = function(){
  var self = this
  this.file = './data/data.json'
  this.currentGame = null
};

DataManager.prototype.loadGames = function(callback){
  var self = this
  console.log("gameCollection loading.. ")
  readData(self.file, function(json){
    if (json) {
      self.games = new GameCollection(json.items)
    }
    callback()
  });
};

DataManager.prototype.getPlayers = function(){
  if (this.games) {
    return this.games.playerCollection.items
  }
  return []
};

DataManager.prototype.getCollectables = function(){
  if (this.games) {
    return this.games.level.collectables.items
  }
  return []
};

DataManager.prototype.saveGames = function(callback){
    writeData(this.games, callback)
};

DataManager.prototype.savePlayer = function(player){

};

DataManager.prototype.saveCollectables = function(collectables){

};

// DataManager - PRIVATE

var readData = function(file, callback){
  jsonfile.readFile(file, function(err, obj) {
    if(err) console.log("error: " + err)
    console.log('read: ')
    console.log(obj)
    callback(obj)
  })
};

var writeData = function(obj, callback){
  if (obj) {
    jsonfile.writeFile(file, obj, function (err) {
      if(err) console.error(err)
      console.log("wrote: ")
      console.log(obj)
      callback()
    })
  } else {
    console.log("nothing to write!")
  }
};

module.exports = DataManager
