var AnnouncementSoundModel = require('./../../models/sound/announcementSoundModel')

function AnnouncementSoundCollection(audioContext, listener) {
  this.audioContext = audioContext
  this.listener = listener
  this.isPlaying = false
  this.action = null
}

AnnouncementSoundCollection.prototype.playAnnouncementGameReady = function(callback) {
  callback()
  // because playing now in index.html when all sounds loaded
  // this.playAnnouncementSound(SoundTypes.GAME_READY, callback)
}

AnnouncementSoundCollection.prototype.playAnnouncementGameStart = function(callback) {
  this.playAnnouncementSound(SoundTypes.GAME_START, callback)
}

AnnouncementSoundCollection.prototype.playAnnouncementGameStop = function() {
  this.playAnnouncementSound(SoundTypes.GAME_STOP)
}

AnnouncementSoundCollection.prototype.playAnnouncementPlayerPointed = function (playerId) {
  switch (playerId) {
    case 1:
      this.playAnnouncementPlayer1Pointed()
      break;
    case 2:
      this.playAnnouncementPlayer2Pointed()
      break;
    default:
      break;
  }
}

AnnouncementSoundCollection.prototype.playAnnouncementPlayerWon = function (playerId) {
  switch (playerId) {
    case 1:
      this.playAnnouncementPlayer1Won()
      break;
    case 2:
      this.playAnnouncementPlayer2Won()
      break;
    default:
      break;
  }
}

AnnouncementSoundCollection.prototype.playSearchHintForLevel = function(levelId, callback) {
  switch(levelId){
    case 1:
      this.playAnnouncementSound(SoundTypes.SERACH_HINT_LEVEL1, callback)
      break;
    case 2:
      this.playAnnouncementSound(SoundTypes.SERACH_HINT_LEVEL2, callback)
      break;
    case 3:
      this.playAnnouncementSound(SoundTypes.SERACH_HINT_LEVEL3, callback)
      break;
    default:
      this.playAnnouncementSound(SoundTypes.SERACH_HINT_LEVEL4, callback)
      break;
  }
}


AnnouncementSoundCollection.prototype.playAnnouncementPlayer1Pointed = function() {
  this.playAnnouncementSound(SoundTypes.PLAYER_1_POINTED)
}

AnnouncementSoundCollection.prototype.playAnnouncementPlayer2Pointed = function() {
  this.playAnnouncementSound(SoundTypes.PLAYER_2_POINTED)
}

AnnouncementSoundCollection.prototype.playAnnouncementPlayer1Won = function() {
  this.playAnnouncementSound(SoundTypes.PLAYER_1_WON)
}

AnnouncementSoundCollection.prototype.playAnnouncementPlayer2Won = function() {
  this.playAnnouncementSound(SoundTypes.PLAYER_2_WON)
}


AnnouncementSoundCollection.prototype.playAnnouncementSound = function(resourcePath, callback){
  var self = this
  var sound = new AnnouncementSoundModel(this.audioContext, resourcePath, this.listener.position)
  sound.load(function(error){
    if (error) {
      if (callback) callback("error loading: " + resourcePath + " : " + error)
      console.log("error loading: " + resourcePath + " : " + error)
    } else {
      sound.setupGainNode()
      sound.source.onended = function(){
        self.isPlaying = false
        if (callback) callback()
      }

      sound.action = setInterval(function(){
        self.tryToPlay(sound)
      }, 100)
    }
  })
}

AnnouncementSoundCollection.prototype.tryToPlay = function(sound) {
  if (!this.isPlaying && sound.action){
    this.isPlaying = true
    console.log("should play announce sound: " + sound.resourcePath)
    sound.play()
    clearInterval(sound.action)
    sound.action = null
  }
}


module.exports = AnnouncementSoundCollection;

// PRIVATE functions

var SoundTypes = {
  GAME_READY:           "/player/resources/audio/announcements/anno_game_ready.mp3",
  GAME_START:           "/player/resources/audio/announcements/anno_game_started.mp3",
  GAME_STOP:            "/player/resources/audio/announcements/anno_game_stopped.mp3",
  PLAYER_1_POINTED:     "/player/resources/audio/announcements/anno_player_1_collectable.mp3",
  PLAYER_2_POINTED:     "/player/resources/audio/announcements/anno_player_2_collectable.mp3",
  PLAYER_1_WON:         "/player/resources/audio/announcements/anno_player1_won_game.mp3",
  PLAYER_2_WON:         "/player/resources/audio/announcements/anno_player2_won_game.mp3",
  SERACH_HINT_LEVEL1:     "/player/resources/audio/announcements/anno_cat.mp3",
  SERACH_HINT_LEVEL2:     "/player/resources/audio/announcements/anno_mobilePhones.mp3",
  SERACH_HINT_LEVEL4:     "/player/resources/audio/announcements/anno_music_synths.mp3",
  SERACH_HINT_LEVEL3:     "/player/resources/audio/announcements/anno_birds.mp3"
}
