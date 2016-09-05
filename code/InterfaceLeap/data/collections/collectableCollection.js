var CollectableModel = require('./../models/collectableModel')

// CollectableCollection - PUBLIC

var CollectableCollection = function(collectables) {
  this.items = collectables
};

CollectableCollection.prototype.addCollectable = function(collectable){
  this.items.push(collectable);
};

module.exports = CollectableCollection;

// PRIVATE functions
