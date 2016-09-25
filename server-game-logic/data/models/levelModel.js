// LevelModel - PUBLIC

var CollectableCollection = require('./../collections/collectableCollection')
var AmbientCollection = require('./../collections/ambientCollection')

var LevelModel = function(id, collectables, ambients){
  this.id = id;
  this.collectables = (collectables) ? collectables : getCollectablesForLevel(id);
  this.ambients = (ambients) ? ambients : getAmbientsForLevel(id);
};

LevelModel.prototype.updateCollectable = function(collectable){
    this.collectables.updateLocation(collectable);
}

// LevelModel - Private

function getCollectablesForLevel(levelId){
    return new CollectableCollection(levelId)
}

function getAmbientsForLevel(levelId){
    return new AmbientCollection(levelId)
}

module.exports = LevelModel;

