var CollectableSoundModel = require('./../../models/sound/collectableSoundModel')
var CollectableCollection = require('./../../collections/collectableCollection.js')
var soundDebugContainer2 = document.getElementById('sound-debug-text2');

function CollectableSoundCollection(serverCollectables, audioContext, roomSize) {
  this.roomSize = roomSize
  this.items = getClientSoundCollectables(audioContext, serverCollectables, roomSize);
};


CollectableSoundCollection.prototype.updateCollectablePosition = function (collectableId, position) {
  var collectable = findCollectableSoundInCollection(collectableId, this.items)
  collectable.position = scaleToRoomSize(position, this.roomSize)
}

CollectableSoundCollection.prototype.remove = function (collectableId) {
  var collectableSound = findCollectableSoundInCollection(collectableId, this.items)
  if(collectableSound) {
    collectableSound.stop()
    this.items = filterOutCollectableSoundFromCollection(collectableId, this.items)
  }
}

module.exports = CollectableSoundCollection;

// PRIVATE functions

function findCollectableSoundInCollection(id, items) {
  return items.find(function (collectableSound) {
    return collectableSound.id == id
  })
}

function filterOutCollectableSoundFromCollection(id, items) {
  return items.filter(function (collectableSound) {
    return collectableSound.id != id
  })
}

// positioning

function getClientSoundCollectables(audioContext, serverCollectables, roomSize) {
  var clientSoundCollectables = new Array()
  serverCollectables.forEach(function(serverCollectable){
    var scaledLocation = scaleToRoomSize(serverCollectable.location, roomSize)
    var scaledMaxDistance = scaleMaxDistanceToRoomSize(serverCollectable.maxDistance, roomSize)
    // id, ctx, resourcePath, x, y, z, maxDistance
    var collectableSound = new CollectableSoundModel(
      serverCollectable.id,
      audioContext,
      serverCollectable.soundResourceRef,
      scaledLocation.x,
      scaledLocation.y,
      scaledLocation.z,
      scaledMaxDistance
    );
    clientSoundCollectables.push(collectableSound)
  })
  return clientSoundCollectables
}

function scaleToRoomSize(location, roomSize) {
  return {
    x: location.x * roomSize.width,
    y: location.y * roomSize.height,
    z: location.z * roomSize.length
  }
}

function scaleMaxDistanceToRoomSize(maxDistance, roomSize) {
  return maxDistance * roomSize.length
}