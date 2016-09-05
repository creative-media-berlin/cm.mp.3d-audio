var CollectableModel = require('./../models/collectableModel.js')

// CollectableCollection - PUBLIC

var CollectableCollection = function (levelId) {
  this.items = new Array()
  if (levelId) {
    this.items = getScaledCollectablesForLevel(levelId)
  }
};

CollectableCollection.prototype.addCollectable = function (collectable) {
  this.items.push(collectable);
};

CollectableCollection.prototype.updateItems = function (collectableId, location) {
  if (this.items) {
    var collectable = findPlayerInCollection(playerId, this.items)
    if (collectable) {
      collectable.location = location
    }
  }
};

CollectableCollection.prototype.removeCollectable = function (collectableId) {
  var filtered = this.items.filter(function (el) {
    return el.id != collectableId
  });
  this.items = filtered;
  console.log("CollectableCollection: collectable with id " + collectableId + " deleted")
}

CollectableCollection.prototype.updateLocation = function (collectable) {
  var self = this
  var storedCollectable = findCollectableInCollection(collectable.id, self.items)
  // console.log("collectable.id: " + collectable.id)
  storedCollectable.location = collectable.location
}

module.exports = CollectableCollection;

// PRIVATE functions

function findCollectableInCollection(id, items) {
  return items.find(function (collectable) {
    return collectable.id == id
  })
}

function getScaledCollectablesForLevel(levelId) {
  var levelCollectables = LevelCollectables()
  var levelIndex = (levelId - 1) % levelCollectables.length;
  return scalePositions(levelCollectables[levelIndex])
}

function scalePositions(collection) {
  collection.forEach(function (item) {
    item.location.x = (item.location.x + 0.5) * 0.5  // x = 0; (0 + 0.5) * 0.5 = 0.25
    item.location.z = (item.location.z + 0.5) * 0.5  // y = 1; (1 + 0.5) * 0.5 = 0.75
  })
  return collection
}

var LevelCollectables = function () {
  // id, maxDistance, location, soundResourceRef, points
  return [
    [
      new CollectableModel(1, 0.5, {x: 0.5, y: 0.1, z: 0.9}, SoundTypes.CAT, 1)
    ],
    [
      new CollectableModel(3, 0.3, {x: 0.1, y: 0.1, z: 0.1}, SoundTypes.RINGTONE1, 1),
      new CollectableModel(4, 0.3, {x: 0.5, y: 0.25, z: 0.6}, SoundTypes.RINGTONE2, 1),
      new CollectableModel(5, 0.3, {x: 0.8, y: 0.75, z: 0.75}, SoundTypes.RINGTONE3, 1),
      new CollectableModel(6, 0.3, {x: 1, y: 0.35, z: 0.4}, SoundTypes.RINGTONE4, 1)
    ],
    [
      new CollectableModel(11, 0.3, {x: 0.9, y: 0.4, z: 0.2}, SoundTypes.BIRD1, 1),
      new CollectableModel(12, 0.3, {x: 0.2, y: 0.6, z: 0.6}, SoundTypes.BIRD2, 1),
      new CollectableModel(13, 0.3, {x: 0.4, y: 0.5, z: 0.4}, SoundTypes.BIRD3, 1)
    ],
    [
      new CollectableModel(7, 0.3, {x: 0.7, y: 0.25, z: 0}, SoundTypes.PLATTFORM_1, 1),
      new CollectableModel(8, 0.3, {x: 0.3, y: 0.25, z: 0}, SoundTypes.PLATTFORM_2, 1),
      new CollectableModel(9, 0.3, {x: 0.7, y: 0.25, z: 1}, SoundTypes.PLATTFORM_3, 1),
      new CollectableModel(10, 0.3, {x: 0.3, y: 0.25, z: 1}, SoundTypes.PLATTFORM_4, 1)
    ]
  ]
}

var SoundTypes = {
//  ORB: "/player/resources/audio/level1/collectables/soundOrb.mp3",
  CAT: "/player/resources/audio/level1/collectables/cat.mp3",
  PLATTFORM_1: "/player/resources/audio/level2/collectables/mu_platform1.mp3",
  PLATTFORM_2: "/player/resources/audio/level2/collectables/mu_platform2.mp3",
  PLATTFORM_3: "/player/resources/audio/level2/collectables/mu_platform3.mp3",
  PLATTFORM_4: "/player/resources/audio/level2/collectables/mu_platform4.mp3",

  RINGTONE1: "/player/resources/audio/level3/collectables/ts_ringtone1.mp3",
  RINGTONE2: "/player/resources/audio/level3/collectables/ts_ringtone2.mp3",
  RINGTONE3: "/player/resources/audio/level3/collectables/ts_ringtone3.mp3",
  RINGTONE4: "/player/resources/audio/level3/collectables/ts_ringtone4.mp3",

  BIRD1: "/player/resources/audio/level4/collectables/wo_bird1.mp3",
  BIRD2: "/player/resources/audio/level4/collectables/wo_bird2.mp3",
  BIRD3: "/player/resources/audio/level4/collectables/wo_bird3.mp3"
}
