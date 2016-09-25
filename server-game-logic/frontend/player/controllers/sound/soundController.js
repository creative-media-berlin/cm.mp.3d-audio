// SoundController

// require('./3daudio.js');
var SceneModel = require('./../../../../data/models/sound/sceneModel.js')

// SoundController

var soundDebugContainer = document.getElementById('sound-debug-text');
var gameLogsContainer = document.getElementById('game-logs');

var SoundController = function (game) {
  if (showConsoleLogs) console.log("sound controller created");
  this.scene = new SceneModel(game)
}

SoundController.prototype.playGameStartSounds = function(callback){
  var self = this
  self.scene.playAnnoncementGameReady(function() {
    self.scene.playAnnoncementGameStart(function () {
      if (callback) callback()
    })
  })
}

SoundController.prototype.stopSounds = function () {
  soundDebugContainer.innerHTML = "stop all sounds";
  if (showConsoleLogs) console.log("stop all sounds");
  this.scene.stopAllSounds()
}

SoundController.prototype.updateScene = function (level, callback) {
  soundDebugContainer.innerHTML = "updateScene >> " + level.id;
  if (showConsoleLogs) console.log("updateScene >> " + level.id);
  this.scene.updateScene(level, callback)
}

SoundController.prototype.startSounds = function () {
  var self = this
  soundDebugContainer.innerHTML = "start sound";
  if (showConsoleLogs) console.log("start sound");

  self.scene.initSoundScene(function () {
    soundDebugContainer.innerHTML = soundDebugContainer.innerHTML + " >> should all play now";
  })
}

SoundController.prototype.updateRoom = function (room) {
  // gameLogsContainer.innerHTML = gameLogsContainer.innerHTML + " >> room : " + room.x + " " + room.y + " " + room.z
  // TODO: enable if necessary
  var roomDebugContainer = document.getElementById('room');
  this.scene.updateRoom(room)
}

SoundController.prototype.updateCollectablePosition = function (collectableId, position) {
  if(this.scene.allSoundsLoaded) {
    soundDebugContainer.innerHTML += "<br>updateCollectable " + collectableId +  "  position: " + position;
    this.scene.updateCollectableSound(collectableId, position)
  }
}

SoundController.prototype.updateListenerPosition = function (position) {
  if(this.scene.allSoundsLoaded){
    this.scene.updateListenerPosition(position)
  }
}

SoundController.prototype.updateCollectable = function (collectableId, position) {
  if(this.scene.allSoundsLoaded){
    this.scene.updateCollectablePosition(collectableId, position)
  }
}

SoundController.prototype.updateListenerViewDirection = function (viewDirection) {
  if(this.scene.allSoundsLoaded){
    this.scene.updateViewDirection(viewDirection)
  }
}

SoundController.prototype.deleteCollectableSound = function (collectableId) {
  this.scene.deleteCollectableSound(collectableId)
}

// Foosteps

SoundController.prototype.playFootstepSound = function (pos, foot) {
  var self = this
  // Get right foot and set pos
  var footstep = foot == 'right' ? self.scene.footstepSoundCollection.getRightStep() : self.scene.footstepSoundCollection.getLeftStep()
  // Footstep positions come without y coordinate, so set it to 0
  // footstep.stop()
  footstep.load(function () {
      footstep.loop = false
      footstep.position = {x: pos.x, y: 0, z: pos.z}
      footstep.setupGainNode()
      // footstep.setupGainNodeHrtf()
      var distance = getDistance(footstep.position, self.scene.listener.position)
      footstep.updateVolume(distance)
      footstep.play()
  })

  footstep.source.onended = function(){
    footstep.cleanup()
  }
}


// Announcements

SoundController.prototype.announceGameStart = function(callback){
  this.scene.playAnnoncementGameStart(callback)
}

SoundController.prototype.announceGameStop = function(){
  this.scene.playAnnoncementGameStop()
}

SoundController.prototype.announceGameReady = function(){
  this.scene.playAnnoncementGameReady()
}

SoundController.prototype.announcePlayerPointed = function (playerId) {
  soundDebugContainer.innerHTML = "collision info sound / point for player " + playerId;
  this.scene.playPointAnnouncement(playerId)
}

SoundController.prototype.announceWinner = function (playerId) {
  // soundDebugContainer.innerHTML = soundDebugContainer.innerHTML + " <b>sound: player </b>" + playerId + "";
  this.scene.playPlayerWonAnnouncement(playerId)
}

module.exports = SoundController

// Private

function getDistance(v1, v2) {
  var v = substractVector(v1, v2)
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

function substractVector(v1, v2) {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
    z: v1.z - v2.z
  }
}
