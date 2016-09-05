// AmbientSoundModel

var AmbientSoundModel = require('./ambientSoundModel.js');

var AnnouncementSoundModel = function (ctx, resourcePath, pos) {
  AmbientSoundModel.call(this, 0, ctx, resourcePath, false, pos.x, pos.y, pos.z, 0)
}

AnnouncementSoundModel.prototype = Object.create(AmbientSoundModel.prototype);

module.exports = AnnouncementSoundModel

// Private
