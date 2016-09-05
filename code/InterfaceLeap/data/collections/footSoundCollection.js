var ambientSoundModel = require('./../models/ambientSoundModel')
//var ambientSoundModel = require('./../data/models/ambientSoundModel')


// CollectableCollection - PUBLIC

function FootSoundCollection(collectables) {

    this.items = collectables;

};

CollectableCollection.prototype.addCollectable = function(){
    this.items.push(collectable);
};

module.exports = CollectableCollection;



// PRIVATE functions

