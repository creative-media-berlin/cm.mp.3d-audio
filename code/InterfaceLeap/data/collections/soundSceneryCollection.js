var soundSceneryModel = require('./../models/soundSceneryCollection')

enum seagull = "Pfad zu Moewe"
enum oceanWaves = "Pfad zu Wasserwellen"

// CollectableCollection - PUBLIC

var soundSceneryCollection = function(collectables) {
    this.items = collectables
};

CollectableCollection.prototype.addCollectable = function(){
    this.items.push(collectable);
};

module.exports = CollectableCollection;