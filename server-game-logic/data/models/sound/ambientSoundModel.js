// AmbientSoundModel

var SoundModel = require('./soundModel.js');

var AmbientSoundModel = function (id, ctx, resourcePath, loop, x, y, z, maxDistance) {
  SoundModel.call(this, ctx, resourcePath, loop, maxDistance)
  this.id = id
  this.position = {
    x: x,
    y: y,
    z: z
  }
}

AmbientSoundModel.prototype = Object.create(SoundModel.prototype);

module.exports = AmbientSoundModel

// Private
