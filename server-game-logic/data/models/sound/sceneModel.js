var AmbientSoundCollection = require("./../../collections/sound/ambientSoundCollection.js")
var CollectableSoundCollection = require("./../../collections/sound/collectableSoundCollection.js")
var FootstepSoundCollection = require("./../../collections/sound/footstepSoundCollection.js")
var AnnouncementSoundCollection = require("./../../collections/sound/announcementSoundCollection.js")

var ListenerModel = require("./listenerModel.js")

var soundDebugContainer = document.getElementById('sound-debug-text');
var soundDebugContainer2 = document.getElementById('sound-debug-text2');
var roomDebugContainer = document.getElementById('room');

var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// Scene

var SceneModel = function (game) {
  // var roomSize = {width: 1, length: 1, height: 1}
  var roomSize = {width:4.93 , length: 8.04, height: 2 }
  this.roomSize = roomSize
  if (showConsoleLogs) roomDebugContainer.innerHTML = "roomSize in new SceneModel: w: " + roomSize.width + " / l: " + roomSize.width

  this.audioContext = null
  this.audioContext = g_WebAudioContext

  // HRTF files loading
  for (var i = 0; i < hrtfs.length; i++) {
    var buffer = this.audioContext.createBuffer(2, 128, 44100);
    var bufferChannelLeft = buffer.getChannelData(0);
    var bufferChannelRight = buffer.getChannelData(1);
    for (var e = 0; e < hrtfs[i].fir_coeffs_left.length; e++) {
      bufferChannelLeft[e] = hrtfs[i].fir_coeffs_left[e];
      bufferChannelRight[e] = hrtfs[i].fir_coeffs_right[e];
    }
    hrtfs[i].buffer = buffer;
  }

  this.listener = new ListenerModel(this.audioContext)
  this.ambientSoundCollection = null
  this.collectableSoundCollection = null
  this.footstepSoundCollection = null
  this.announcementSoundCollection = new AnnouncementSoundCollection(this.audioContext, this.listener)
  this.allSoundsLoaded = false
  this.fadeInPercentage = 0.025
  this.currentFadeIn = 0.0
}

SceneModel.prototype.updateScene = function (level, callback) {
  var self = this
  self.stopAllSounds()
  self.playSearchHintSound(level.id, function(){
    self.ambientSoundCollection = new AmbientSoundCollection(level.ambients.items, self.audioContext, self.roomSize)
    self.collectableSoundCollection = new CollectableSoundCollection(level.collectables.items, self.audioContext, self.roomSize)
    self.footstepSoundCollection = new FootstepSoundCollection(level.id, self.audioContext, self.roomSize)
    scaleToRoomSize(self.ambientSoundCollection.items, self.roomSize)
    if (callback) callback()
  })
}

SceneModel.prototype.playSearchHintSound = function(levelId, callback){
  this.announcementSoundCollection.playSearchHintForLevel(levelId, callback)
}

SceneModel.prototype.updateRoom = function (roomSize) {
  // roomDebugContainer.innerHTML = ">> SceneModel updateRoom roomSize in new SceneModel: w: " + room.width + " / l: " + room.width
  // this.roomSize = roomSize
  // this.stopAllSounds()
  // this.ambientSoundCollection = new AmbientSoundCollection(levelId, this.audioContext, this.roomSize)
  // this.collectableSoundCollection = new CollectableSoundCollection(this.currentLevel, this.collectableSoundCollection.collectables, this.audioContext, this.roomSize)
}

SceneModel.prototype.deleteCollectableSound = function (collectableId) {
  this.collectableSoundCollection.remove(collectableId)
}

SceneModel.prototype.initSoundScene = function (callback) {
  var self = this
  var allSounds = this.ambientSoundCollection.items.concat(this.collectableSoundCollection.items)
  self.currentFadeIn = 0.0
  try {
    loadSounds(allSounds, function () {
      setupVolume(allSounds, function () {
        self.updateScenarioVolumeForPlayerPosition(self.listener.position)
        playSounds(allSounds, function () {
          console.log("should play now!")
          self.allSoundsLoaded = true
          if (callback) callback()
        })
      })
    })
  } catch (e) {
    alert('Error loading sounds : ' + e);
  }
}

SceneModel.prototype.stopAllSounds = function () {
  if (this.ambientSoundCollection) {
    stopSounds(this.ambientSoundCollection.items)
  }
  if (this.collectableSoundCollection) {
    stopSounds(this.collectableSoundCollection.items)
  }
}

// frequently updated

SceneModel.prototype.updateListenerPosition = function (location) {
  var absolutePlayerHeadPos = {
    x: this.roomSize.width * location.hipPosition.x,
    y: (location.hipPosition.y * this.roomSize.height) + location.distanceToHead * 0.1,
    z: this.roomSize.length * location.hipPosition.z
  }
  // soundDebugContainer.innerHTML = soundDebugContainer.innerHTML + " <b> >> playerPos(rel) </b>" + location.hipPosition.x + " " + location.hipPosition.y + " " + location.hipPosition.z + "</br>"

  if (this.allSoundsLoaded) {
    this.listener.setPosition(absolutePlayerHeadPos.x, absolutePlayerHeadPos.y, absolutePlayerHeadPos.z)
    this.updateScenarioVolumeForPlayerPosition(absolutePlayerHeadPos)
  }
}

SceneModel.prototype.updateCollectablePosition = function(collctableId, position) {
  this.collectableSoundCollection.updateCollectablePosition(collctableId, position)
}

SceneModel.prototype.updateViewDirection = function (viewDirection) {
  var self =  this
  this.listener.setOrientation(viewDirection);

  // Azimuth and phi are used being swapped, because our coordination system is kind of upside down
  this.ambientSoundCollection.items.forEach(function (ambientSound) {

    var hrtfOrientation = calcHRTFOrientation(ambientSound.position, self.listener.position, viewDirection)

    ambientSound.updateHRTFOrientation(hrtfOrientation[0], hrtfOrientation[1])

  })

  this.collectableSoundCollection.items.forEach(function (collectableSound) {
    var hrtfOrientation = calcHRTFOrientation(collectableSound.position, self.listener.position, viewDirection)
    collectableSound.updateHRTFOrientation(hrtfOrientation[0], hrtfOrientation[1])
  })
}

function calcHRTFOrientation(soundPos, listenerPos, viewDirection) {

  var vdTheta =  calculateTheta(-viewDirection.z, viewDirection.x, viewDirection.y)

  var vdPhi = calculatePhi(viewDirection.z, viewDirection.x)

  var listenerToSoundForPhi = substractVector(soundPos, listenerPos)
  var sdPhi = calculatePhi(-listenerToSoundForPhi.z, listenerToSoundForPhi.x)



  var listenerToSoundForTheta = substractVector(listenerPos, soundPos)
  var sdTheta =  calculateTheta(-listenerToSoundForTheta.z, listenerToSoundForTheta.x, listenerToSoundForTheta.y)

  var phi = vdPhi - sdPhi
  var theta = sdTheta - vdTheta


  return [phi, theta]
}


SceneModel.prototype.updateScenarioVolumeForPlayerPosition = function (playerPos) {
  updateVolumeForSoundsToPlayerPosition(this.ambientSoundCollection.items, playerPos,     this.currentFadeIn)
  updateVolumeForSoundsToPlayerPosition(this.collectableSoundCollection.items, playerPos, this.currentFadeIn)

  if(this.currentFadeIn < 1){
    this.currentFadeIn += this.fadeInPercentage
  }
}

SceneModel.prototype.updateCollectableSound = function (collectable) {
  var collectableSound = getCollectableSoundsForId(collectable.id)
  collectableSound.position = collectable.position
  updateVolumeForSoundToPlayerPosition(collectableSound, this.listener.position)
}

// special announcement sounds

SceneModel.prototype.playAnnoncementGameReady = function (callback) {
  this.announcementSoundCollection.playAnnouncementGameReady(callback)
}

SceneModel.prototype.playAnnoncementGameStart = function (callback) {
  this.announcementSoundCollection.playAnnouncementGameStart(callback)
}

SceneModel.prototype.playAnnoncementGameStop = function () {
  this.announcementSoundCollection.playAnnouncementGameStop()
}

SceneModel.prototype.playPointAnnouncement = function (playerId) {
  this.announcementSoundCollection.playAnnouncementPlayerPointed(playerId)
}

SceneModel.prototype.playPlayerWonAnnouncement = function (playerId) {
  this.announcementSoundCollection.playAnnouncementPlayerWon(playerId)
}

module.exports = SceneModel

// sound methods

function updateVolumeForSoundsToPlayerPosition(sounds, playerPos, fadeInValue) {
  sounds.forEach(function (sound) {
    updateVolumeForSoundToPlayerPosition(sound, playerPos)
    updateFadeInSound(sound, fadeInValue)
  })
}

function updateVolumeForSoundToPlayerPosition(sound, playerPos) {
  var distance = getDistance(sound.position, playerPos)

  // if (showConsoleLogs) console.log("distance from single sound:", distance )
  sound.updateVolume(distance)
}

function loadSounds(sounds, callback) {
  var counter = sounds.length
  sounds.forEach(function (sound) {
    sound.load(function (error) {
      if (error) {
        if (showConsoleLogs) soundDebugContainer.innerHTML += " <b> >> error loading <b>" + sound.resourcePath + " " + error + "<br>"
      } else {
        if (showConsoleLogs) soundDebugContainer.innerHTML += " <b> >> loaded <b>" + sound.resourcePath + " " + counter + "<br>"
        counter--
        if (counter == 0 && callback) callback()
      }
    })
  })
}

// function loadSound(sound, callback) {
//   var counter = sounds.length
//   sound.load(function (error) {
//     if (error) {
//     } else {
//       soundDebugContainer.innerHTML = soundDebugContainer.innerHTML + " <b> >> loaded <b>" + sound.resourcePath + " " + counter + "<br>"
//       counter--
//       if (counter == 0 && callback) callback()
//     }
//   })
// }

function setupVolume(sounds, callback) {
  var counter = sounds.length
  sounds.forEach(function (sound) {
    // sound.setupGainNode()
    sound.setupGainNodeHrtf()
    sound.gainNode.gain.value = 0.0
    counter--
    if (counter == 0 && callback) callback()
  })
}

function playSounds(sounds, callback) {
  var counter = sounds.length
  sounds.forEach(function (sound) {
    sound.play()
    counter--
    if (counter == 0 && callback) callback()
  })
}

function updateFadeInSound(sound, percentage){

  sound.gainNode.gain.value *= percentage
}

function stopSounds(sounds, callback) {
  var counter = sounds.length
  sounds.forEach(function (sound) {
    sound.stop()
    counter--
    if (counter == 0 && callback) callback()
  })
}


function scaleToRoomSize(soundCollection, roomSize){
  soundCollection.forEach(function (soundObj) {
    soundObj.position.x = soundObj.position.x * roomSize.width
    soundObj.position.y = soundObj.position.y * roomSize.height
    soundObj.position.z = soundObj.position.z * roomSize.length
  })

}
