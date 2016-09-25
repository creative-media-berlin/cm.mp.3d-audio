// CollectableSoundModel

var AmbientSoundModel = require('./ambientSoundModel.js');

var CollectableSoundModel = function (collectableId, ctx, resourcePath, x, y, z, maxDistance) {
  // ctx, resourcePath, loop, x, y, z, maxDistance
  AmbientSoundModel.call(this, collectableId, ctx, resourcePath, true, x, y, z, maxDistance)
}

CollectableSoundModel.prototype = Object.create(AmbientSoundModel.prototype);


module.exports = CollectableSoundModel

// Private
