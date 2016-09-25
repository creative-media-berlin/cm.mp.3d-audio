var AmbientSoundModel = require('./../../models/sound/ambientSoundModel')

function AmbientSoundCollection(serverAmbients, audioContext, roomSize) {
  this.items = getClientSoundAmbients(audioContext, serverAmbients, roomSize)
}

module.exports = AmbientSoundCollection;

// PRIVATE functions

function getClientSoundAmbients(audioContext, serverAmbients, roomSize) {
  var clientAmbientSounds = new Array()
  serverAmbients.forEach(function(serverAmbient){
    var scaledMaxDistance = scaleMaxDistanceToRoomSize(serverAmbient.maxDistance, roomSize)
    // id, ctx, resourcePath, loop, x, y, z, maxDistance
    var ambientSound = new AmbientSoundModel(
        serverAmbient.id,
        audioContext,
        serverAmbient.soundResourceRef,
        true,
        serverAmbient.location.x,
        serverAmbient.location.y,
        serverAmbient.location.z,
        scaledMaxDistance
    );
    clientAmbientSounds.push(ambientSound)
  })
  return clientAmbientSounds
}

function scaleMaxDistanceToRoomSize(maxDistance, roomSize) {
  return maxDistance * roomSize.length
}