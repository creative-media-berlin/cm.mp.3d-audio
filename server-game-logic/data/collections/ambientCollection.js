var AmbientModel = require('./../models/AmbientModel.js')

// AmbientCollection - PUBLIC

var AmbientCollection = function (levelId) {
  this.items = new Array()
  if (levelId) {
    this.items = this.getAmbientsForLevel(levelId)
  }
};

AmbientCollection.prototype.getAmbientsForLevel = function (levelId) {
  var levelAmbients = LevelAmbients()
  var levelIndex = (levelId - 1) % levelAmbients.length;
  return levelAmbients[levelIndex]

}

module.exports = AmbientCollection;

// PRIVATE functions

var LevelAmbients = function(){
  // id, maxDistance, location, soundResourceRef, points
  return [
    [
      new AmbientModel(1, 0.7, {x: 0.5, y:0.5, z:0}, SoundTypes.OCEAN, 1),
      new AmbientModel(2, 0.4, {x: 0.8, y:0.2, z:0.2}, SoundTypes.SEAGULL, 1)
    ],
    [
      new AmbientModel(3, 0.6, {x: 0.5, y: 1, z: 0.5}, SoundTypes.TS_ANNOUNCEMENT, 1),
      new AmbientModel(4, 0.5, {x: 0.5, y: 0.5, z: 0.6}, SoundTypes.TS_TRAINSTATION_ATMOSPHERE, 1),
      new AmbientModel(5, 0.5, {x: 0.3, y: 0.9, z: 0.25}, SoundTypes.TS_PIDGEONS, 1),
      new AmbientModel(6, 0.5, {x: 0.6, y: 0.25, z: 0.2}, SoundTypes.TS_TICKET_VALIDATION, 1)
    ],
    [
      new AmbientModel(11, 0.5, {x: 0.5, y: 0.9, z: 0.5}, SoundTypes.WO_WIND, 1),
      new AmbientModel(12, 0.5, {x: 0.8, y: 0.1, z: 0.5}, SoundTypes.WO_STREAM, 1)
    ],
    [
      new AmbientModel(7, 0.7, {x: 0, y: 0.5, z: 0}, SoundTypes.MU_RYTHM, 1),
      new AmbientModel(8, 0.7, {x: 1, y: 0.5, z: 0}, SoundTypes.MU_BASS, 1),
      new AmbientModel(9, 0.7, {x: 0, y: 0.5, z: 1}, SoundTypes.MU_REICH1, 1),
      new AmbientModel(10, 0.7, {x: 1, y: 0.5, z: 1}, SoundTypes.MU_REICH2, 1)
    ]
  ]
}

var SoundTypes = {
  SEAGULL: "/player/resources/audio/level1/seagull1_mono.mp3",
  OCEAN: "/player/resources/audio/level1/ocean_waves_mono.mp3",
  TS_TRAINSTATION_ATMOSPHERE: "/player/resources/audio/level2/ts_train_station_atmo.mp3",
  TS_PIDGEONS: "/player/resources/audio/level2/ts_pidgeons.mp3",
  TS_ANNOUNCEMENT: "/player/resources/audio/level2/ts_station_announcement.mp3",
  TS_TICKET_VALIDATION: "/player/resources/audio/level2/ts_ticket_validations.mp3",
  WO_STREAM: "/player/resources/audio/level3/wo_stream.mp3",
  WO_WIND: "/player/resources/audio/level3/wo_wind.mp3",
  MU_RYTHM: "/player/resources/audio/level4/mu_rhythm.mp3",
  MU_BASS: "/player/resources/audio/level4/mu_bass.mp3",
  MU_REICH1: "/player/resources/audio/level4/mu_reich_one.mp3",
  MU_REICH2: "/player/resources/audio/level4/mu_reich_two.mp3",
  MU_FIFTHS: "/player/resources/audio/level4/mu_fifths.mp3",
  MU_OTHERS: "/player/resources/audio/level4/mu_others.mp3",
}