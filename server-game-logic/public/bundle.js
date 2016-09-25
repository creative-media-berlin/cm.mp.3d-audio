/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	//require('./../../helper/mathOperations.js');

	var serveripStorage = __webpack_require__(1),
	  serverip = (new serveripStorage()).ip,
	  PlayerUpdateController = __webpack_require__(2),
	  playerUpdateController = new PlayerUpdateController(serverip),
	  serverConnectContainer = document.getElementById('server-connection');


	serverConnectContainer.innerHTML = "NO (serverip: " + serverip + ")";
	setUpButtons();

	function startPlayerApp(playerId) {
	  if (!playerUpdateController.connected) {
	    playerUpdateController.startPlayerApp(playerId, function (error) {
	      if (showConsoleLogs) console.log("startPlayerApp  error:", error)
	      if (error) {
	        serverConnectContainer.innerHTML = error;
	      } else {
	        serverConnectContainer.innerHTML = "connected";
	      }
	    });
	  }
	}

	function stopPlayerApp() {
	  playerUpdateController.stopPlayerApp()
	  serverConnectContainer.innerHTML = (playerUpdateController.connected) ? "connected" : "disconnected";
	}

	function setUpButtons() {
	  document.getElementById('1').onclick = function () {
	    startPlayerApp(1);
	    document.getElementById('2').disabled = true;
	  }

	  document.getElementById('2').onclick = function () {
	    startPlayerApp(2);
	    document.getElementById('1').disabled = true;
	  }

	  document.getElementById('stop').onclick = function () {
	    stopPlayerApp();
	    document.getElementById('1').disabled = false;
	    document.getElementById('2').disabled = false;
	  }

	  document.getElementById('match').onclick = function () {
	    playerUpdateController.fakePositionMatch()
	  }
	}








/***/ },
/* 1 */
/***/ function(module, exports) {

	var ip = function(){ 
	this.ip = '141.45.200.227';
	} 
	module.exports = ip;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// PlayerUpdateController

	var viewDirectionContainer = document.getElementById('output-view-direction'),
	  serverDataContainer = document.getElementById('server-data'),
	  serverDataContainer2 = document.getElementById('server-data2'),
	  serverConnectionContainer = document.getElementById('server-connection'),
	  ViewDirectionController = __webpack_require__(3),
	  GameUpdateController = __webpack_require__(4);

	var PlayerUpdateController = function (serverIP) {
	  this.serverIP = serverIP;
	  this.playerClientSocket = null;
	  this.viewDirectionUpdateController = null
	  this.connected = false;
	  this.gameController = null;
	  this.registrationId = null;
	}

	PlayerUpdateController.prototype.startPlayerApp = function (playerId, callback) {
	  if (showConsoleLogs) console.log("PlayerUpdateController.prototype.startPlayerApp")
	  var self = this;
	  $.getScript('http://' + self.serverIP + ':8080/socket.io/socket.io.js', function () {
	    self.playerClientSocket = io.connect('http://' + self.serverIP + ':8080/player');

	    self.playerClientSocket.on('connect', function (err) {
	      serverConnectionContainer.innerHTML = "connected";
	      self.connected = true;
	      self.playerClientSocket.emit('player-registration', playerId);
	      callback(err);
	    });

	    self.playerClientSocket.on('successful-registered', function (data) {
	      if (data.playerId) {
	        self.registrationId = data.playerId
	        serverConnectionContainer.innerHTML = "connected as player " + self.registrationId;
	        if (showConsoleLogs) console.log("connected as player " + self.registrationId)
	        self.viewDirectionController = new ViewDirectionController(self.playerClientSocket);
	        // send to server
	        self.viewDirectionController.startSendingOrientationData(function (viewDirection) {

	          serverDataContainer2.innerHTML = "view direction:\n x: " + viewDirection.x + "<br />y: " + viewDirection.y + "<br />z: " + viewDirection.z + "<br>"
	          self.gameController.updateListenerViewDirection(viewDirection)
	        });
	        self.viewDirectionController.listenForPlayerViewDirectionReset();
	        // receive updates from server
	        // self.listenToServerUpdates();
	        self.initGameController()
	      } else {
	        if (showConsoleLogs) console.log((data.error) ? "connected, but " + data.error : "connected, but couldn't register as player")
	        serverConnectionContainer.innerHTML = (data.error) ? "connected, but " + data.error : "connected, but couldn't register as player"
	      }
	    });


	    self.playerClientSocket.on('error', function (error) {
	      self.connected = false;
	      if (error) serverDataContainer.innerHTML = error
	      callback("No connection, Error: " + error);
	    });

	    self.playerClientSocket.on('disconnect', function (error) {
	      self.connected = false;
	      self.viewDirectionController.stopSendingOrientationData()
	      self.viewDirectionController = null;
	      var msg = (error) ? ("disconnected ", error) : "disconnected";
	      callback(msg);
	    });
	  });
	}

	PlayerUpdateController.prototype.stopPlayerApp = function () {
	  if (showConsoleLogs) console.log('stopPlayerApp')
	  if (this.connected) {
	    if (this.gameController) this.gameController.stopGame()
	    this.playerClientSocket.disconnect();
	    this.playerClientSocket = null;
	    this.connected = false
	  }
	}

	// PlayerUpdateController.prototype.listenToServerUpdates = function(){
	//     var self = this
	//     if (self.playerClientSocket){
	//         self.playerClientSocket.on('updates', function (data) {
	//             //console.log("data update for playerId: " + data.playerId + ": " , data.location)
	//             // console.log(data)
	//             var locationString =  "<br />hipPosition:<br />x: " + data.location.hipPosition.x + "<br />y: " + data.location.hipPosition.y + "<br />z: " +  data.location.hipPosition.z + "<br />distanceToHead: " + data.location.distanceToHead
	//             if (data.viewDirection) {
	//                 serverDataContainer.innerHTML = "data update for playerId: " + data.playerId + ": " + locationString + "<br />view direction:\nx: " +  data.viewDirection.x + "<br />y: " +  data.viewDirection.y + "<br />z: " +  data.viewDirection.z
	//             } else {
	//                 serverDataContainer.innerHTML = "data update for playerId: " + data.playerId + ": " + locationString + "<br />view direction:\nx: ...<br /><br />"
	//             }
	//         });
	//     }
	// }

	PlayerUpdateController.prototype.initGameController = function () {
	  this.gameController = new GameUpdateController(this.playerClientSocket)
	  this.gameController.listenToServerUpdates()
	}

	// TODO: remove, only for debugging! CHEATING

	PlayerUpdateController.prototype.fakePositionMatch = function () {
	  var self = this
	  self.playerClientSocket.emit('fake-position-match')
	}

	module.exports = PlayerUpdateController;

/***/ },
/* 3 */
/***/ function(module, exports) {

	// ViewDirectionController

	var viewDirectionContainer = document.getElementById('output-view-direction');
	var viewDirectionContainer2 = document.getElementById('output-view-direction2');
	var outputText = ""
	var deviceType = ""
	var controller = null
	var direction = 0
	var directionOffset = null
	var callbackToUpdateVR = null
	var counter = 0

	var savedVector = {
	  x: 0,
	  y: 0,
	  z: 1
	}

	var ViewDirectionController = function (playerClientSocket) {
	  this.playerClientSocket = playerClientSocket;
	  controller = this
	}

	ViewDirectionController.prototype.stopSendingOrientationData = function () {
	  viewDirectionContainer2.innerHTML += "stopSendingOrientationData<br>"
	  window.removeEventListener('deviceorientation', sendViewDirection)
	}

	ViewDirectionController.prototype.listenForPlayerViewDirectionReset = function () {
	  controller.playerClientSocket.on('reset-vd', function () {
	    outputText = "!!!! resetVD"
	    // controller.stopSendingOrientationData()
	    // controller.startSendingOrientationData()
	    // Set offset to null, to trigger recalc
	    directionOffset = null
	  })
	}


	ViewDirectionController.prototype.startSendingOrientationData = function (callback) {
	  callbackToUpdateVR = callback
	  viewDirectionContainer2.innerHTML += "startSendingOrientationData<br>"
	  // if (window.DeviceOrientationEvent) {
	    window.addEventListener('deviceorientation', sendViewDirection)
	  // } else {
	  //   setInterval(function () {
	  //     if (callbackToUpdateVR) callbackToUpdateVR()
	  //     controller.playerClientSocket.emit('view-direction-data', testdata.viewDirection)
	  //   }, 1000)

	  //   viewDirectionContainer.innerHTML = "Connected but no device orientation supported." + "<br /> outputText: " + outputText
	  // }
	}

	module.exports = ViewDirectionController;

	// private methods

	var sendViewDirection = function (event) {
	  var vdRaw = {
	    tiltLR: event.gamma,
	    tiltFB: event.beta,
	    alpha: event.alpha
	  }

	  // viewDirectionContainer.innerHTML = event.alpha + "; " + event.beta + "; " + event.gamma

	      // if (!vdRaw.alpha) {
	  //   viewDirectionContainer.innerHTML = "Connected but no device orientation supported." + "<br /> outputText: " + outputText
	  //   controller.playerClientSocket.emit('view-direction-data', testdata);

	  //   setInterval(function () {
	  //     controller.playerClientSocket.emit('view-direction-data', testdata)
	  //     if (callbackToUpdateVR) callbackToUpdateVR(testdata.viewDirection)
	  //   }, 1000)

	  // } else {
	    direction = vdRaw.alpha

	    if (!directionOffset) {
	      counter++
	      outputText = "!!!! directionOffset  " + counter
	      directionOffset = 180 - direction
	    }
	  
	    var vdVector = getViewDirectionVector(vdRaw.tiltLR, vdRaw.tiltFB, direction + directionOffset)
	    // Only send current view direction if its angle to the previously sent direction is greater than 3
	    if (Math.abs(getAngleBetweenVectors(vdVector, savedVector)) > 1) {
	      savedVector = vdVector

	      // Output values to client screen
	      //viewDirectionContainer.innerHTML = "x: " + vdVector.x + "<br>" + "y: " + vdVector.y + "<br> z: " + vdVector.z + "<br> deviceType: " + deviceType + "<br> outputText: " + outputText + "<br>directionOffset!  " + directionOffset + "<br>"

	      vdVector.alpha = vdRaw.alpha
	      vdVector.beta = vdRaw.tiltFB


	      // Emit values to server
	      controller.playerClientSocket.emit('view-direction-data', {viewDirection: vdVector});

	      if (callbackToUpdateVR) callbackToUpdateVR(vdVector)
	    }
	  }
	// }

	function getAngleBetweenVectors(v1, v2) {
	  var scalar = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
	  var norm = Math.abs(Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z) * Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z))
	  return Math.acos(v1.x * v2.x + v1.y * v2.y + v1.z * v2.z / (Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z) * Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z)))* (180/Math.PI)
	}

	/*
	 * Updates the view direction. The current view direction needs also one vector which is independet in 90°.
	 * So it will be rotated.
	 *
	 * Params:
	 * gyro: the current gyroscope / accelerometer values
	 *
	 */
	function getViewDirectionVector(tiltLR, tiltFB, direction) {
	  var vecStart = {
	    x: 0,
	    y: 0,
	    z: -1
	  }

	  vecStart = rotateAxeZ(vecStart, tiltLR)
	  vecStart = rotateAxeX(vecStart, tiltFB)
	  vecStart = rotateAxeY(vecStart, direction)
	  return vecStart
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// GameUpdateController

	var SoundController = __webpack_require__(5);
	var gameLogsContainer = document.getElementById('game-logs');
	var serverDataContainer = document.getElementById('server-data');
	var serverDataContainer2 = document.getElementById('server-data2');
	var roomDebugContainer = document.getElementById('room');

	var GameUpdateController = function (playerClientSocket) {
	  this.playerClientSocket = playerClientSocket;  // check if storing is possible
	  this.soundController = null;
	  this.game = null
	}

	GameUpdateController.prototype.startGame = function (game) {
	  var self = this
	  self.soundController = new SoundController(game)
	  self.soundController.playGameStartSounds(function () {
	    self.soundController.updateScene(game.level, function(){
	      self.soundController.startSounds()
	    })
	  })
	}

	GameUpdateController.prototype.stopGame = function () {
	  if (this.soundController) this.soundController.stopSounds()
	}

	GameUpdateController.prototype.updateListenerViewDirection = function(viewDirection){
	  if (this.soundController) this.soundController.updateListenerViewDirection(viewDirection)
	}

	GameUpdateController.prototype.deleteCollectableSound = function (collectableId) {
	  if (this.soundController) this.soundController.deleteCollectableSound(collectableId)
	}

	GameUpdateController.prototype.listenToServerUpdates = function () {
	  var self = this;

	  self.playerClientSocket.on('game-start', function (game) {
	    if (showConsoleLogs) gameLogsContainer.innerHTML = "game started"
	    self.startGame(game)
	  });

	  self.playerClientSocket.on('game-stop', function () {
	    if (showConsoleLogs) gameLogsContainer.innerHTML += "   + game stopped"
	    if (self.soundController) self.soundController.announceGameStop()
	    self.stopGame()
	  });

	  self.playerClientSocket.on('collectable-deleted', function (data) {
	    if (showConsoleLogs) gameLogsContainer.innerHTML = gameLogsContainer.innerHTML + ' + collectable-deleted event for collectableId: ' + data.collectableId
	    self.deleteCollectableSound(data.collectableId)
	  });

	  self.playerClientSocket.on('level-update', function (data) {
	    if(self.soundController) {
	      if (showConsoleLogs) gameLogsContainer.innerHTML = gameLogsContainer.innerHTML + ' + level-update'
	      var level = data.game.level
	      if (level) {
	        if (self.soundController) {
	          if (showConsoleLogs) gameLogsContainer.innerHTML = 'level-update > soundController : -updateScene'
	          self.soundController.updateScene(level, function(){
	            self.soundController.startSounds()
	          })
	        } else {
	          if (showConsoleLogs) console.log("level-update: no soundController!")
	        }
	      }
	    }
	  });
	  
	  self.playerClientSocket.on('room-update', function (data) {
	    if (self.soundController) {
	      // if (showConsoleLogs) gameLogsContainer.innerHTML =  gameLogsContainer.innerHTML + " updateRoom " + game.room.width + " / " + game.room.height + " / " + game.room.length

	      // roomDebugContainer.innerHTML = ">> updateRoom roomSize in new SceneModel: w: " + room.width + " / l: " + room.width
	      //
	      // self.soundController.updateRoom(room)
	    }
	  });

	  self.playerClientSocket.on('player-position-update', function (data) {
	    if(self.soundController){
	      var location = data.location
	      if (location) {
	        self.soundController.updateListenerPosition(location)
	        if (location) {
	        var locationString =  "<br />hipPosition:<br />x: " + location.hipPosition.x + "<br />y: " + location.hipPosition.y + "<br />z: " +  location.hipPosition.z + "<br />distanceToHead: " + location.distanceToHead
	          serverDataContainer.innerHTML = "data update for playerId: " + data.playerId + ": " + locationString
	        }
	      }
	    }
	  });

	  self.playerClientSocket.on('collectable-update', function (data) {
	    var collectable = data.collectable
	    if (collectable) {
	      if (showConsoleLogs) gameLogsContainer.innerHTML = "collectable-update " + collectable.id + "   location: x: " + collectable.location.x + " y: " + collectable.location.y + " z: " + collectable.location.z
	      self.soundController.updateCollectable(collectable.id, collectable.location)
	    }
	  });

	  self.playerClientSocket.on('game-pause', function () {

	  });

	  self.playerClientSocket.on('disconnect', function () {
	    if (showConsoleLogs) gameLogsContainer.innerHTML = "playerClientSocket disconnect"
	    if (self.soundController) self.soundController.stopSounds()
	  })

	  self.playerClientSocket.on('error', function () {
	    if (showConsoleLogs)  gameLogsContainer.innerHTML = "playerClientSocket error"
	    if (self.soundController) self.soundController.stopSounds()
	  })

	  // Announcements

	  self.playerClientSocket.on('player-footstep', function (footstep) {
	    if (self.soundController) self.soundController.playFootstepSound(footstep.position, footstep.footstep)
	  })

	  self.playerClientSocket.on('game-won', function (data) {
	    if (showConsoleLogs) gameLogsContainer.innerHTML += "game stopped .. won by player " + data.winnerId
	    if (self.soundController) self.soundController.announceWinner(data.winnerId)
	  });

	  self.playerClientSocket.on('collision-detection', function (data) {
	    if (showConsoleLogs) gameLogsContainer.innerHTML = gameLogsContainer.innerHTML + ' + collision-detection player: ' + data.playerId
	    if (self.soundController) self.soundController.announcePlayerPointed(data.playerId)
	  });


	}

	module.exports = GameUpdateController

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// SoundController

	// require('./3daudio.js');
	var SceneModel = __webpack_require__(6)

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


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var AmbientSoundCollection = __webpack_require__(7)
	var CollectableSoundCollection = __webpack_require__(10)
	var FootstepSoundCollection = __webpack_require__(14)
	var AnnouncementSoundCollection = __webpack_require__(15)

	var ListenerModel = __webpack_require__(17)

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


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var AmbientSoundModel = __webpack_require__(8)

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

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// AmbientSoundModel

	var SoundModel = __webpack_require__(9);

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


/***/ },
/* 9 */
/***/ function(module, exports) {

	// SoundModel

	var soundDebugContainer = document.getElementById('sound-debug-text');

	var SoundModel = function (audioContext, resourcePath, loop, maxDistance) {
	  this.resourcePath = resourcePath
	  this.audioContext = audioContext
	  this.loop = loop
	  this.maxDistance = maxDistance
	  this.distanceModel = "steep"
	  this.buffer = null
	  this.gainNode = null
	  this.source = null
	  this.hrtfPanner = null
	}

	SoundModel.prototype.load = function (callback) {
	  this.hrtfPanner = new BinauralFIR({
	    audioContext: this.audioContext
	  });

	  if (showConsoleLogs) soundDebugContainer.innerHTML += " <b> >> loading <b>" + this.resourcePath + "<br>"
	  this.buffer = soundBuffers[this.resourcePath]
	  if(callback) {
	    if (this.buffer) {
	      if (showConsoleLogs) soundDebugContainer.innerHTML += " <b> >> loaded <b>" + this.resourcePath + "<br>"
	      callback()
	    } else {
	      if (showConsoleLogs) soundDebugContainer.innerHTML += " <b> >> error <b>" + this.resourcePath + "<br>"
	      callback("buffer nil or wrong format")
	    }
	  }
	}


	SoundModel.prototype.setupGainNode = function(){
	  this.gainNode = this.audioContext.createGain();
	  this.source = this.audioContext.createBufferSource();
	  this.source.buffer = this.buffer;
	  // Connect source to a gain node
	  this.source.connect(this.gainNode);
	  // Connect gain node to destination
	  this.gainNode.connect(this.audioContext.destination);
	  this.source.loop = this.loop;
	}


	SoundModel.prototype.setupGainNodeHrtf = function () {
	  if (showConsoleLogs) soundDebugContainer.innerHTML += " <b> >> setupGainNodeHrtf <b>" + this.resourcePath + "<br>"
	  this.gainNode = this.audioContext.createGain();
	  this.source = this.audioContext.createBufferSource();
	  this.source.buffer = this.buffer
	  if (showConsoleLogs) soundDebugContainer.innerHTML += " <b> >> set buffer <b>" + this.resourcePath + ".. " + this.buffer + "<br>"

	  //Set HRTF dataset
	  this.hrtfPanner.HRTFDataset = hrtfs;
	  this.hrtfPanner.setPosition(0, 0, 1);
	  this.hrtfPanner.state = "A2B";

	  this.source.loop = this.loop;

	  this.source.connect(this.hrtfPanner.input)
	  this.hrtfPanner.connect(this.gainNode)
	  this.gainNode.connect(this.audioContext.destination);

	}

	SoundModel.prototype.play = function () {
	  if (showConsoleLogs) console.log("play: " + this.resourcePath)
	  this.source.start(0)
	}

	SoundModel.prototype.stop = function () {
	  if (showConsoleLogs) console.log("going to stop: " + this.resourcePath)
	  // TODO cannot call stop without start first!
	  // source could already be stopped via levelUp -> stop all sounds
	  if (this.source) {
	    try {
	      this.source.stop()
	      this.cleanup()
	    } catch(e){
	      console.log("!!! error stopping sound " + e)
	    }
	  }
	  if (showConsoleLogs) console.log("stopped: " + this.resourcePath)
	}

	SoundModel.prototype.cleanup = function(){
	  if (showConsoleLogs) console.log("cleanup " + this.resourcePath)
	  // this.source.noteOff()
	  // this.source.disconnect()
	  // this.hrtfPanner.disconnect()
	  // this.gainNode.disconnect()
	  // this.gainNode = null;
	  // this.hrtfPanner = null;
	}

	SoundModel.prototype.updateVolume = function (distance) {
	  if (this.gainNode) {
	    var gainValue = 0
	    if (this.distanceModel == 'continoues') {
	      gainValue = calculateCustomLoudnessContinuous(this.maxDistance, distance)
	    }
	    else if (this.distanceModel == 'slow') {
	      gainValue = calculateCustomLoudnessSlow(this.maxDistance, distance)
	    }
	    //fast
	    else if (this.distanceModel == 'fast') {
	      gainValue = calculateCustomLoudnessFast(this.maxDistance, distance)
	    } else {
	      gainValue = calculateCustomLoudnessSteep(this.maxDistance, distance)
	    }
	    this.gainNode.gain.value = gainValue

	//    this.gainNode.gain.value = 0.25
	  }
	}

	SoundModel.prototype.updateHRTFOrientation = function (azimuth, phi) {
	  this.hrtfPanner.setPosition(azimuth, phi, 1)
	}

	module.exports = SoundModel;

	// Private

	// Custom gain calculation. In the beginning the volume will decrease slowly and goes fast nearer the end to the maximum distance.
	// Formula: /
	/*
	 (- ((( x / (2*2)) +
	 (x/(2*2))) ^ 2) / (( x / (2*2)) +
	 (x/(2*2))) ^ ((x/(2*2 )) +
	 (x/(2*2)))) +1
	 */
	/*

	 (- ((( x / (s)) +
	 (x/(s))) ^ 2) / (( x / (s)) +
	 (x/(s))) ^ ((x/(s )) +
	 (x/(s)))) +1
	 */

	//(- (( a + a) ^ 2) / (a + a) ^ (a + a)) +1

	// s = 2 * m
	// / a = x / s
	// Short: (-2a^2 / 2a ^ 2a) +1
	function calculateCustomLoudnessSlow(maxDistance, distance) {
	  var m = maxDistance, gain = 0, x = distance
	  var a = x / m

	  gain = (-2 * Math.pow(a, 2) / Math.pow(2 * a, 2 * a)) + 1

	  if (gain < 0) gain = 0

	  return gain
	}


	// Custom gain. At the start it will be go down fast and nearer the end the gain will be decrease slower.
	// Formula:         -(x/m)^2*((x/m)+(x/m)-1)+(x/m)^(x/m)
	// a = x / m
	// Short:           -(a)^2*((a)+(a)-1)+(a)^(a)
	// Short:           -(a)^2*(2*a-1)+a^a
	function calculateCustomLoudnessFast(maxDistance, distance) {

	  var m = maxDistance, gain, x = distance
	  var a = x / m

	  gain = -(Math.pow(a, 2)) * (2 * a - 1) + Math.pow(a, a)

	  if (x > m) {
	    gain = 0
	  }
	  return gain
	}


	//Formula:  -((x-2)/2)^2*((x-2)/2)
	//          -((x-m)/m)^2*((x-m)/m)
	function calculateCustomLoudnessSteep(maxDistance, distance) {
	  var m = maxDistance, gain, x = distance

	  gain = -Math.pow(( ( x - m) / m), 2) * ((x - m) / m)

	  if (x > m) {
	    gain = 0
	  }
	  return gain
	}


	// -log2(x-10) +1

	// gain = -(1 / (m^2)) * (d^2) +1

	function calculateCustomLoudnessContinuous(maxDistance, distance) {
	  var gain = -(1 / (Math.pow(maxDistance, 2)) * (Math.pow(distance, 2))) + 1
	  if (distance > maxDistance) {
	    gain = 0
	  }
	  return gain
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var CollectableSoundModel = __webpack_require__(11)
	var CollectableCollection = __webpack_require__(12)
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

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// CollectableSoundModel

	var AmbientSoundModel = __webpack_require__(8);

	var CollectableSoundModel = function (collectableId, ctx, resourcePath, x, y, z, maxDistance) {
	  // ctx, resourcePath, loop, x, y, z, maxDistance
	  AmbientSoundModel.call(this, collectableId, ctx, resourcePath, true, x, y, z, maxDistance)
	}

	CollectableSoundModel.prototype = Object.create(AmbientSoundModel.prototype);


	module.exports = CollectableSoundModel

	// Private


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var CollectableModel = __webpack_require__(13)

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

	  RINGTONE1: "/player/resources/audio/level2/collectables/ts_ringtone1.mp3",
	  RINGTONE2: "/player/resources/audio/level2/collectables/ts_ringtone2.mp3",
	  RINGTONE3: "/player/resources/audio/level2/collectables/ts_ringtone3.mp3",
	  RINGTONE4: "/player/resources/audio/level2/collectables/ts_ringtone4.mp3",

	  BIRD1: "/player/resources/audio/level3/collectables/wo_bird1.mp3",
	  BIRD2: "/player/resources/audio/level3/collectables/wo_bird2.mp3",
	  BIRD3: "/player/resources/audio/level3/collectables/wo_bird3.mp3",

	  PLATTFORM_1: "/player/resources/audio/level4/collectables/mu_platform1.mp3",
	  PLATTFORM_2: "/player/resources/audio/level4/collectables/mu_platform2.mp3",
	  PLATTFORM_3: "/player/resources/audio/level4/collectables/mu_platform3.mp3",
	  PLATTFORM_4: "/player/resources/audio/level4/collectables/mu_platform4.mp3"
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	// CollectableModel

	var CollectableModel = function(id, maxDistance, location, soundResourceRef, points){
	  this.id = id
	  this.location = location
	  this.soundResourceRef = soundResourceRef
	  this.points = points
	  this.maxDistance = maxDistance
	};

	// private functions

	module.exports = CollectableModel

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var AmbientSoundModel = __webpack_require__(8)

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
	  SAND_RIGHT4: "/player/resources/audio/level3/footsteps/wo_footStep1.mp3",
	  SAND_LEFT4: "/player/resources/audio/level3/footsteps/wo_footStep2.mp3",
	  SAND_RIGHT3: "/player/resources/audio/level4/footsteps/footSingleStep1.mp3",
	  SAND_LEFT3: "/player/resources/audio/level4/footsteps/footSingleStep2.mp3"
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var AnnouncementSoundModel = __webpack_require__(16)

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
	  SERACH_HINT_LEVEL3:     "/player/resources/audio/announcements/anno_birds.mp3",
	  SERACH_HINT_LEVEL4:     "/player/resources/audio/announcements/anno_music_synths.mp3"
	}


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// AmbientSoundModel

	var AmbientSoundModel = __webpack_require__(8);

	var AnnouncementSoundModel = function (ctx, resourcePath, pos) {
	  AmbientSoundModel.call(this, 0, ctx, resourcePath, false, pos.x, pos.y, pos.z, 0)
	}

	AnnouncementSoundModel.prototype = Object.create(AmbientSoundModel.prototype);

	module.exports = AnnouncementSoundModel

	// Private


/***/ },
/* 17 */
/***/ function(module, exports) {

	var soundDebugContainer = document.getElementById('sound-debug-text');

	var ListenerModel = function (audioCtx) {
	  this.listenerObject = audioCtx.listener
	  this.position = { x:0, y:0, z:0 }
	  this.setPosition(0, 0, 0)
	  // set default orientation
	  this.listenerObject.setOrientation(0, 0, -1, 0, 1, 0);
	}

	ListenerModel.prototype.setPosition = function (x, y, z) {
	  this.position.x = x
	  this.position.y = y
	  this.position.z = z
	  this.listenerObject.setPosition(x, y, z)
	}

	ListenerModel.prototype.setOrientation = function (viewDirection) {
	  // soundDebugContainer.innerHTML = soundDebugContainer.innerHTML  + "<b><u>Listener vd:</b></u> <br>x: " + viewDirection.x + "<br>y: " + viewDirection.y + "<br>z: " + viewDirection.z + "<br>"
	  var topHeadVector = rotateAxeX(viewDirection, 90);
	  // soundDebugContainer.innerHTML = soundDebugContainer.innerHTML  + "<b><u>Listener topHeadVector vd: x: <b><u>" + topHeadVector.x + " y: " + topHeadVector.y + " z: " + topHeadVector.z + "\n"
	  this.listenerObject.setOrientation(viewDirection.x, viewDirection.y, viewDirection.z, topHeadVector.x, topHeadVector.y, topHeadVector.z);
	}

	module.exports = ListenerModel



/***/ }
/******/ ]);