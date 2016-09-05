var AmbientSoundModel = require('./../../models/sound/ambientSoundModel')

function FootstepSoundCollection(levelId, audioContext, roomSize) {
  this.audioContext = audioContext
  this.setLevelSoundMap(audioContext, roomSize)
  this.items = this.levelSoundMap[levelId-1]
}

FootstepSoundCollection.prototype.setLevelSoundMap = function(audioContext, roomSize) {
  this.levelSoundMap = [
    [
      new AmbientSoundModel(1, audioContext, SoundTypes.SAND_RIGHT1, true, 0, 0, 0, 20),
      new AmbientSoundModel(2, audioContext, SoundTypes.SAND_LEFT1, true, 0, 0, 0, 20)
    ],
    [
      new AmbientSoundModel(3, audioContext, SoundTypes.SAND_RIGHT2, true, 0, 0, 0, 20),
      new AmbientSoundModel(4, audioContext, SoundTypes.SAND_LEFT2, true, 0, 0, 0, 20)
    ],
    [
      new AmbientSoundModel(5, audioContext, SoundTypes.SAND_RIGHT3, true, 0, 0, 0, 20),
      new AmbientSoundModel(6, audioContext, SoundTypes.SAND_LEFT3, true, 0, 0, 0, 20)
    ],
    [
      new AmbientSoundModel(7, audioContext, SoundTypes.SAND_RIGHT4, true, 0, 0, 0, 20),
      new AmbientSoundModel(8, audioContext, SoundTypes.SAND_LEFT4, true, 0, 0, 0, 20)
    ]
  ]
}

FootstepSoundCollection.prototype.getLeftStep = function() {
  return this.items[1]
}

FootstepSoundCollection.prototype.getLeftStep = function() {
  return this.items[0]
}

module.exports = FootstepSoundCollection;

// PRIVATE functions

var SoundTypes = {
  SAND_RIGHT1: "/player/resources/audio/level1/footsteps/footSingleStep1.mp3",
  SAND_LEFT1: "/player/resources/audio/level1/footsteps/footSingleStep2.mp3",
  SAND_RIGHT2: "/player/resources/audio/level2/footsteps/footSingleStep1.mp3",
  SAND_LEFT2: "/player/resources/audio/level2/footsteps/footSingleStep2.mp3",
  SAND_RIGHT3: "/player/resources/audio/level3/footsteps/footSingleStep1.mp3",
  SAND_LEFT3: "/player/resources/audio/level3/footsteps/footSingleStep2.mp3",
  SAND_RIGHT4: "/player/resources/audio/level4/footsteps/wo_footStep1.mp3",
  SAND_LEFT4: "/player/resources/audio/level4/footsteps/wo_footStep2.mp3"
}