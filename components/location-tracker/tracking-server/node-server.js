var mainServerURL = '141.45.205.159' // IP of the main server
var initTime = 1; // time in seconds before 1-player mode is activated
var maxZ = 8.04 // room-length = distance in meters between Kinect1 and Kinect2
var kinectFOV = 63 // Kinect horizontal Field of View, to calculate Playground width
var distanceToHead = 70 // distance between hip position and head/ears

// object, used to store raw data from both Kinects
var kinectData = {
	kinect1: {
		timestamp: Date.now(),
		rawData1: null,
		rawData2: null
	},
	kinect2: {
		timestamp: Date.now(),
		rawData1: null,
		rawData2: null
	}
}

// data object used for calculation
// here Player-1 is always on rawData1 position 1 (Kinect can send inverted data)
var verifiedKinectData = {
	kinect1: {
		rawData1: null,
		rawData2: null
	},
	kinect2: {
		rawData1: null,
		rawData2: null
	}
}
// PlayerMap is used to store Player-ID for comparison
playerMap = {
	kinect1: {
		player1: "11111111111111111",
		player2: "11111111111111111"
	},
	kinect2: {
		player1: "11111111111111111",
		player2: "11111111111111111"
	}
}

var ws = require("nodejs-websocket")
var io = require('socket.io-client')

var mainServerConnected = false
var kinectLocationsClientSocket = io.connect('http://' + mainServerURL + ':8080/kinect-location')
var kinectFootstepClientSocket = io.connect('http://' + mainServerURL + ':8080/kinect-footsteps')

var kinect1Connected = false; var kinect2Connected = false
var initTimeUp = false
var twoPlayerActive = true
var initialComplete1 = false; var initialComplete2 = false
var tooManyPlayers1 = false; var tooManyPlayers2 = false
var width = calcWidth()
var footstepBlockMap = {
	1: {
		'right': false,
		'left': false
	},
	2: {
		'right': false,
		'left': false
	}
}

// calculation of the play area
console.log("complete Kinect area \t| length: " + maxZ + " \t\t| width: " + width.toFixed(2))
console.log("inner rectangle \t\t| length: " + maxZ*0.5 + " \t| width: " + (width*0.5).toFixed(2))

kinectLocationsClientSocket.on('error', function (error) {
	console.log("Error: " + error)
	mainServerConnected = false
})

kinectLocationsClientSocket.on('disconnect', function () {
	console.log("Disconnected main server..")
	mainServerConnected = false
})

kinectLocationsClientSocket.on('connect', function () {
	console.log("Connection to main server established..")
	mainServerConnected = true
	kinectLocationsClientSocket.emit("room-update", { room: {width: width, length: maxZ}})
})

// Create server and listen to kinect clients on port 8001
var server = ws.createServer(function (conn) {
	if (conn.path == "/k1") {
		kinect1Connected = true
		console.log("Kinect-1 Location connected")
	} else if (conn.path == "/k2") {
		kinect2Connected = true
		console.log("Kinect-2 Location connected")
	} else if (conn.path ==  "/footstep") {
		console.log("Footsteps socket connected")
	}

    // timeout: if 2 Players found before timeout, 2-Player mode is activated
    // else fallback to 1-Payer mode
	if (kinect1Connected && kinect2Connected) {
		setTimeout(function(){
			initTimeUp = true
			console.log("initializing time up")
		}, initTime*1000)
	}

	// When a kinect client sends data
	conn.on("text", function (incomingString) {

		// If incoming data arrives over the path ws://url.de:8001/
		if (conn.path == "/k1") {
			kinectData.kinect1.rawData1 = null
			kinectData.kinect1.rawData2 = null
			kinectData.kinect1.timestamp = Date.now()

            // timestamp invalidates old data
            if (Date.now() - kinectData.kinect2.timestamp > 500) {
				kinectData.kinect2.rawData1 = null
				kinectData.kinect2.rawData2 = null
				verifiedKinectData.kinect2.rawData1 = null
				verifiedKinectData.kinect2.rawData2 = null
			}

			// in case 3 or more players are detected on the playground, the Kinect sends this error message
			if (incomingString == "Too many players on playground") {
				console.log("Too many players in Kinect1")
				tooManyPlayers1 = true
			} else {
				tooManyPlayers1 = false
				// parse string into javascript object and save it to kinectData
				var newValues1 = JSON.parse(incomingString)
				for (var prop in newValues1) {
					if (kinectData.kinect1.hasOwnProperty(prop)) {
						kinectData.kinect1[prop] = newValues1[prop]
					}
				}
			}

		// If incoming data arrives over the path ws://url.de:8001/k2
		} else if (conn.path == "/k2") {
			kinectData.kinect2.rawData1 = null
			kinectData.kinect2.rawData2 = null
			kinectData.kinect2.timestamp = Date.now()

			if (Date.now() - kinectData.kinect1.timestamp > 500) {
				kinectData.kinect1.rawData1 = null
				kinectData.kinect1.rawData2 = null
				verifiedKinectData.kinect1.rawData1 = null
				verifiedKinectData.kinect1.rawData2 = null
			}

            // if 3 or more Players are detected by one Kinect, this error message will be received
            if (incomingString == "Too many players on playground") {
				console.log("Too many players in Kinect2")
				tooManyPlayers2 = true
			} else {
				tooManyPlayers1 = false
				// parse string into javascript object and save it to kinectData
				var newValues2 = JSON.parse(incomingString)
				for (var prop in newValues2) {
					if (kinectData.kinect2.hasOwnProperty(prop)) {
						kinectData.kinect2[prop] = newValues2[prop]
					}
				}

			}
        // calculation for footstep events
		} else if (conn.path == "/footstep") {
			var data = JSON.parse(incomingString)
			var playerId = playerMap[data.kinectNo]["player1"] == data.bodyId ? 1 : 2
			var blocked = footstepBlockMap[playerId][data.footstep]
			if(blocked == false) {
				//console.log("Footstep: " + data.footstep)
				//kinectFootstepClientSocket.emit('kinect-footstep-data', {footstep: data.footstep, position: { 'x': data.x, 'z': data.z } })
				footstepBlockMap[playerId][data.footstep] = true
				setTimeout(function() {
					footstepBlockMap[playerId][data.footstep] = false
				}, 100)
			}
		}

		if (tooManyPlayers1 == false && tooManyPlayers2 == false) {
		    // initialisation runs for each Kinect separately and is complete when 2 Players are found in each Kinect
            // when timeout is over, initialisation runs only with 1 Player for each Kinect
			if ((initTimeUp && (initialComplete1 == false || initialComplete2 == false))
				|| ((initialComplete1 == false && kinectData.kinect1.rawData1 != null && kinectData.kinect1.rawData2 != null)
				|| (initialComplete2 == false && kinectData.kinect2.rawData1 != null && kinectData.kinect2.rawData2 != null))) {
				initializePlayerMap()
			}

			// the calculation only runs when init for both Kinects is complete (only 1 Kinect will not work)
			if (initialComplete1 == true && initialComplete2 == true) {
				assignDataToPlayerIds() // fill verifiedKinectData object
				var resultPlayer1; var resultPlayer2; var resultFormat

                // block for 1-Player mode calculation
                if (twoPlayerActive == false) {
				    // in case one Kinect sends an unknown PlayerID, it need to be saved to the PlayerMap
					if (verifiedKinectData.kinect1.rawData1 == null || verifiedKinectData.kinect2.rawData1 == null) {
						remapPlayerIDs()
                        assignDataToPlayerIds() // fill verifiedKinectData object again
					}
					if (verifiedKinectData.kinect1.rawData1 != null || verifiedKinectData.kinect2.rawData1 != null) {
						resultPlayer1 = calcPos(verifiedKinectData.kinect1.rawData1, verifiedKinectData.kinect2.rawData1)
					}

					// location format which is sent to the main server
					resultFormat = {
						playerLocations: [{
							Kinect: resultPlayer1.Kinect,
							playerId: 1,
							distanceToHead: distanceToHead,
							hipPosition: resultPlayer1.hipPosition
						}]
					}
					// console.log("Player1: " + JSON.stringify(resultPlayer1)) // Console log for 1-Player mode
				}

                // block for 2-Player mode calculation
                if (twoPlayerActive == true) {
					// if one of the verified data slots is empty, try a remap
					if (verifiedKinectData.kinect1.rawData1 == null
						|| verifiedKinectData.kinect1.rawData2 == null
						|| verifiedKinectData.kinect2.rawData1 == null
						|| verifiedKinectData.kinect2.rawData2 == null) {
						// console.log("Remap 2-Player mode")
						remapPlayerIDs()
						assignDataToPlayerIds() // fill verifiedKinectData object again
					}
					var playerLocations = []

                    // player-1 location calculation + format which is sent to the main server
                    if (verifiedKinectData.kinect1.rawData1 != null || verifiedKinectData.kinect2.rawData1 != null) {
					    resultPlayer1 = calcPos(verifiedKinectData.kinect1.rawData1, verifiedKinectData.kinect2.rawData1)
						if (resultPlayer1) {
							playerLocations.push({
								Kinect: resultPlayer1.Kinect,
								playerId: 1,
								distanceToHead: distanceToHead,
								hipPosition: resultPlayer1.hipPosition
							})
						}
					}

                    // player-2 location calculation + format which is sent to the main server
                    if  (verifiedKinectData.kinect1.rawData2 != null || verifiedKinectData.kinect2.rawData2 != null) {
                        resultPlayer2 = calcPos(verifiedKinectData.kinect1.rawData2, verifiedKinectData.kinect2.rawData2)
						if (resultPlayer2) {
							playerLocations.push({
								Kinect: resultPlayer2.Kinect,
								playerId: 2,
								distanceToHead: distanceToHead,
								hipPosition: resultPlayer2.hipPosition
							})
						}
					}
					resultFormat = {
						playerLocations: playerLocations
					}

					// dead end of the algorithm:
                    // when in 2-Player mode one Player is already lost and the second Player gets lost too
                    // the assignment of Player-1 and Player-2 can't be achieved anymore
                    // a restart is required to assign the PlayerID's again based on their start position
					if (resultPlayer1 == undefined && resultPlayer2 == undefined) {
						console.log("Both Players lost!!! Restart required ")
					}
					//console.log("Player1: " + JSON.stringify(resultPlayer1) + " || Player2: " + JSON.stringify(resultPlayer2)) // Console log for 2-Player mode
				}

				// sending the calculated result to the main server
				if (mainServerConnected) {
					kinectLocationsClientSocket.emit('kinect-location-data', resultFormat)
				}
			} else {
				if (!initialComplete1) {
					console.log("Kinect-1 is not initialized yet!")
				}
				if (!initialComplete2) {
					console.log("Kinect-2 is not initialized yet!\n")
				}
			}
		}
	})
	conn.on("close", function (code, reason) {
		console.log("One connection to main server closed.")
	})
}).listen(8001)

// the idea is: when one specific Player is detected by both Kinects, use the Kinect which is more close to that Player (z-coordinate)
// in case one Player is only detected by one Kinect, this data will be used

// calcPos will be called for one specific player, but with both data sources (both Kinects)
// e.g. Player1 in Kinect1 and Player1 in Kinect2
function calcPos(rawDataKinect1, rawDataKinect2) {
	var calcX, deltaZ

	if (rawDataKinect1 == null && rawDataKinect2 == null) {
		console.log("tried to run calcPos with no Player-Data")
	} else {
		// kinect 1
		if ((rawDataKinect2 == null && rawDataKinect1 != null) || (rawDataKinect1 != null && rawDataKinect2 != null && rawDataKinect1.z < rawDataKinect2.z)) {
			calcX = (rawDataKinect1.x - (width / 2)) * -1
			return {
				Kinect: 1,
				hipPosition: {
					x: Number((calcX / width).toFixed(5)),
					y: Number(rawDataKinect1.y.toFixed(5)),
					z: Number((rawDataKinect1.z / maxZ).toFixed(5))
				}
			};
			// kinect 2
		} else if (rawDataKinect2 != null) {
			calcX = rawDataKinect2.x - (width/(-2))
			deltaZ = maxZ - rawDataKinect2.z
			return {
				Kinect: 2,
				hipPosition: {
					x: Number((calcX / width).toFixed(5)),
					y: Number(rawDataKinect2.y.toFixed(5)),
					z: Number((deltaZ / maxZ).toFixed(5))
				}
			};
		}
	}
}

// function to calculate the width of the playground
function calcWidth() {
	var rad = (kinectFOV/2) * Math.PI/180;
	var tan = Math.tan(rad)

	return (((maxZ / 2) * tan) * 2)
}

// function to fill the PlayerMap object initially
function initializePlayerMap() {
	if ((kinectData.kinect1.rawData1 != null && kinectData.kinect1.rawData2 != null)
		|| (kinectData.kinect2.rawData1 != null && kinectData.kinect2.rawData2 != null)) {
		var initPlayer1; var initPlayer2;
		// initialization of PlayerMap for Kinect1
		if (initialComplete1 == false && !initTimeUp) {
			initPlayer1 = calcPos(kinectData.kinect1.rawData1, null)
			initPlayer2 = calcPos(kinectData.kinect1.rawData2, null)

			if (!initPlayer1 || !initPlayer2)
				return

			if (initPlayer1.hipPosition.x < initPlayer2.hipPosition.x) {
				playerMap.kinect1.player1 = kinectData.kinect1.rawData1.bodyId
				playerMap.kinect1.player2 = kinectData.kinect1.rawData2.bodyId
			} else {
				playerMap.kinect1.player1 = kinectData.kinect1.rawData2.bodyId
				playerMap.kinect1.player2 = kinectData.kinect1.rawData1.bodyId
			}
			initialComplete1 = true
			twoPlayerActive = true
			console.log("initialized 2-Player-Mode Kinect1 !")
		}

		// initialization of PlayerMap for Kinect2
		if (initialComplete2 == false && !initTimeUp) {
			initPlayer1 = calcPos(null, kinectData.kinect2.rawData1)
			initPlayer2 = calcPos(null, kinectData.kinect2.rawData2)

			if (!initPlayer1 || !initPlayer2)
				return

			if (initPlayer1.hipPosition.x < initPlayer2.hipPosition.x) {
				playerMap.kinect2.player1 = kinectData.kinect2.rawData1.bodyId
				playerMap.kinect2.player2 = kinectData.kinect2.rawData2.bodyId
			} else {
				playerMap.kinect2.player1 = kinectData.kinect2.rawData2.bodyId
				playerMap.kinect2.player2 = kinectData.kinect2.rawData1.bodyId
			}
			initialComplete2 = true
			twoPlayerActive = true
			console.log("initialized 2-Player-Mode Kinect2 !")
		}
	} else if (initTimeUp == true) {
		twoPlayerActive = false
		if (initialComplete1 == false) {
			if (kinectData.kinect1.rawData1 != null) {
				playerMap.kinect1.player1 = kinectData.kinect1.rawData1.bodyId
				initialComplete1 = true
				console.log("initialized 1-Player-Mode Kinect1 !")
			}
		}
		if (initialComplete2 == false) {
			if (kinectData.kinect2.rawData1 != null) {
				playerMap.kinect2.player1 = kinectData.kinect2.rawData1.bodyId
				initialComplete2 = true
				console.log("initialized 1-Player-Mode Kinect2 !")
			}
		}
	}
}

// function which looks up PlayerID in PlayerMap and then fills the verifiedKinectData object
function assignDataToPlayerIds() {
	verifiedKinectData.kinect1.rawData1 = null;
	verifiedKinectData.kinect1.rawData2 = null;
	verifiedKinectData.kinect2.rawData1 = null;
	verifiedKinectData.kinect2.rawData2 = null;

	if (kinectData.kinect1.rawData1 != null) {
		if (playerMap.kinect1.player1 == kinectData.kinect1.rawData1.bodyId) {
			verifiedKinectData.kinect1.rawData1 = kinectData.kinect1.rawData1
		}
	}
	if (kinectData.kinect1.rawData2 != null) {
		if (playerMap.kinect1.player2 == kinectData.kinect1.rawData2.bodyId) {
			verifiedKinectData.kinect1.rawData2 = kinectData.kinect1.rawData2
		}
	}
	if (kinectData.kinect1.rawData2 != null) {
		if (playerMap.kinect1.player1 == kinectData.kinect1.rawData2.bodyId) {
			verifiedKinectData.kinect1.rawData1 = kinectData.kinect1.rawData2
		}
	}
	if (kinectData.kinect1.rawData1 != null) {
		if (playerMap.kinect1.player2 == kinectData.kinect1.rawData1.bodyId) {
			verifiedKinectData.kinect1.rawData2 = kinectData.kinect1.rawData1
		}
	}
	if (kinectData.kinect2.rawData1 != null) {
		if (playerMap.kinect2.player1 == kinectData.kinect2.rawData1.bodyId) {
			verifiedKinectData.kinect2.rawData1 = kinectData.kinect2.rawData1
		}
	}
	if (kinectData.kinect2.rawData2 != null) {
		if (playerMap.kinect2.player2 == kinectData.kinect2.rawData2.bodyId) {
			verifiedKinectData.kinect2.rawData2 = kinectData.kinect2.rawData2
		}
	}
	if (kinectData.kinect2.rawData2 != null) {
		if (playerMap.kinect2.player1 == kinectData.kinect2.rawData2.bodyId) {
			verifiedKinectData.kinect2.rawData1 = kinectData.kinect2.rawData2
		}
	}
	if (kinectData.kinect2.rawData1 != null) {
		if (playerMap.kinect2.player2 == kinectData.kinect2.rawData1.bodyId) {
			verifiedKinectData.kinect2.rawData2 = kinectData.kinect2.rawData1
		}
	}
}

// function to re-assign PlayerID's in case a Player gets lost (unknown Player in raw data)
function remapPlayerIDs() {
	if (twoPlayerActive == false) {
		if (verifiedKinectData.kinect1.rawData1 == null && kinectData.kinect1.rawData1 != null) {
			playerMap.kinect1.player1 = kinectData.kinect1.rawData1.bodyId
		}
		if (verifiedKinectData.kinect2.rawData1 == null && kinectData.kinect2.rawData1 != null) {
			playerMap.kinect2.player1 = kinectData.kinect2.rawData1.bodyId
		}
	}
	if (twoPlayerActive == true) {
		if (verifiedKinectData.kinect1.rawData1 == null) {
			if (verifiedKinectData.kinect1.rawData2 != null
				&& kinectData.kinect1.rawData1 != null && kinectData.kinect1.rawData2 != null) {
				console.log("Remap verified Player-1, both raw data in Kinect-1")
				if (playerMap.kinect1.player2 == kinectData.kinect1.rawData2.bodyId) {
					playerMap.kinect1.player1 = kinectData.kinect1.rawData1.bodyId
				} else if (playerMap.kinect1.player2 == kinectData.kinect1.rawData1.bodyId) {
					playerMap.kinect1.player1 = kinectData.kinect1.rawData2.bodyId
				}
			} else {
				//console.log("Remap failed: No data for Player-1 in Kinect-1")
			}
		}
		if (verifiedKinectData.kinect1.rawData2 == null) {
			if (verifiedKinectData.kinect1.rawData1 != null
				&& kinectData.kinect1.rawData1 != null && kinectData.kinect1.rawData2 != null) {
				console.log("Remap verified Player-2, both raw data in Kinect-1")
				if (playerMap.kinect1.player1 == kinectData.kinect1.rawData1.bodyId) {
					playerMap.kinect1.player2 = kinectData.kinect1.rawData2.bodyId
				} else if (playerMap.kinect1.player1 == kinectData.kinect1.rawData2.bodyId) {
					playerMap.kinect1.player2 = kinectData.kinect1.rawData1.bodyId
				}
			} else {
				//console.log("Remap failed: No data for Player-2 in Kinect-1")
			}
		}
		if (verifiedKinectData.kinect2.rawData1 == null) {
			if (verifiedKinectData.kinect2.rawData2 != null
				&& kinectData.kinect2.rawData1 != null && kinectData.kinect2.rawData2 != null) {
				console.log("Remap verified Player-1, both raw data in Kinect-2")
				if (playerMap.kinect2.player2 == kinectData.kinect2.rawData2.bodyId) {
					playerMap.kinect2.player1 = kinectData.kinect2.rawData1.bodyId
				} else if (playerMap.kinect2.player2 == kinectData.kinect2.rawData1.bodyId) {
					playerMap.kinect2.player1 = kinectData.kinect2.rawData2.bodyId
				}
			} else {
				//console.log("Remap failed: No data for Player-1 in Kinect-1")
			}
		}
		if (verifiedKinectData.kinect2.rawData2 == null) {
			if (verifiedKinectData.kinect2.rawData1 != null
				&& kinectData.kinect2.rawData1 != null && kinectData.kinect2.rawData2 != null) {
				console.log("Remap verified Player-2, both raw data in Kinect-2")
				if (playerMap.kinect2.player1 == kinectData.kinect2.rawData1.bodyId) {
					playerMap.kinect2.player2 = kinectData.kinect2.rawData2.bodyId
				} else if (playerMap.kinect2.player1 == kinectData.kinect2.rawData2.bodyId) {
					playerMap.kinect2.player2 = kinectData.kinect2.rawData1.bodyId
				}
			} else {
				//console.log("Remap failed: No data for Player-2 in Kinect-1")
			}
		}
		var radius = 0.05
		if (verifiedKinectData.kinect1.rawData1 == null && verifiedKinectData.kinect1.rawData2 == null			// null : null
			&& verifiedKinectData.kinect2.rawData1 != null && verifiedKinectData.kinect2.rawData2 != null) {	// P1 : P2
			var tempPlayer1 = calcPos(null, verifiedKinectData.kinect2.rawData1)
			var tempPlayer2 = calcPos(null, verifiedKinectData.kinect2.rawData2)

			if (kinectData.kinect1.rawData1 != null) {
				//console.log("K2-VP1 true + K2-VP2 true | K1-rawData-1 ")
				var playerX = calcPos(kinectData.kinect1.rawData1, null)
				if (between(playerX.hipPosition.x, tempPlayer1.hipPosition.x - radius, tempPlayer1.hipPosition.x + radius)
					&& !(between(playerX.hipPosition.x, tempPlayer2.hipPosition.x - radius, tempPlayer2.hipPosition.x + radius))) {
					playerMap.kinect1.player1 = kinectData.kinect1.rawData1.bodyId
					console.log("Remap successful")
				} else if (between(playerX.hipPosition.x, tempPlayer2.hipPosition.x - radius, tempPlayer2.hipPosition.x + radius)
					&& !(between(playerX.hipPosition.x, tempPlayer1.hipPosition.x - radius, tempPlayer1.hipPosition.x + radius))) {
					playerMap.kinect1.player2 = kinectData.kinect1.rawData1.bodyId
					console.log("Remap successful")
				}
			} else if (kinectData.kinect1.rawData2 != null) {
				//console.log("K2-VP1 true + K2-VP2 true | K1-rawData-2 ")
				var playerY = calcPos(kinectData.kinect1.rawData2, null)
				if (between(playerY.hipPosition.x, tempPlayer1.hipPosition.x - radius, tempPlayer1.hipPosition.x + radius)
					&& !(between(playerY.hipPosition.x, tempPlayer2.hipPosition.x - radius, tempPlayer2.hipPosition.x + radius))) {
					playerMap.kinect1.player1 = kinectData.kinect1.rawData2.bodyId
					console.log("Remap successful")
				} else if (between(playerY.hipPosition.x, tempPlayer2.hipPosition.x - radius, tempPlayer2.hipPosition.x + radius)
					&& !(between(playerY.hipPosition.x, tempPlayer1.hipPosition.x - radius, tempPlayer1.hipPosition.x + radius))) {
					playerMap.kinect1.player2 = kinectData.kinect1.rawData2.bodyId
					console.log("Remap successful")
				}
			} else {
				//console.log("Remap failed: No data for Player-1 and Player-2 in Kinect-1")
			}
		}
		if (verifiedKinectData.kinect1.rawData1 != null && verifiedKinectData.kinect1.rawData2 != null			// P1 : P2
			&& verifiedKinectData.kinect2.rawData1 == null && verifiedKinectData.kinect2.rawData2 == null) {	// null : null
			var tempPlayer1 = calcPos(verifiedKinectData.kinect1.rawData1, null)
			var tempPlayer2 = calcPos(verifiedKinectData.kinect1.rawData2, null)

			if (kinectData.kinect2.rawData1 != null) {
				//console.log("K1-VP1 true + K1-VP2 true | K2-rawData-1 ")
				var playerX = calcPos(null, kinectData.kinect2.rawData1)
				if (between(playerX.hipPosition.x, tempPlayer1.hipPosition.x - radius, tempPlayer1.hipPosition.x + radius)
					&& !(between(playerX.hipPosition.x, tempPlayer2.hipPosition.x - radius, tempPlayer2.hipPosition.x + radius))) {
					playerMap.kinect2.player1 = kinectData.kinect2.rawData1.bodyId
					console.log("Remap successful")
				} else if (between(playerX.hipPosition.x, tempPlayer2.hipPosition.x - radius, tempPlayer2.hipPosition.x + radius)
					&& !(between(playerX.hipPosition.x, tempPlayer1.hipPosition.x - radius, tempPlayer1.hipPosition.x + radius))) {
					playerMap.kinect2.player2 = kinectData.kinect2.rawData1.bodyId
					console.log("Remap successful")
				}
			} else if (kinectData.kinect2.rawData2 != null) {
				//console.log("K1-VP1 true + K1-VP2 true | K2-rawData-2 ")
				var playerY = calcPos(null, kinectData.kinect2.rawData2)
				if (between(playerY.hipPosition.x, tempPlayer1.hipPosition.x - radius, tempPlayer1.hipPosition.x + radius)
					&& !(between(playerY.hipPosition.x, tempPlayer2.hipPosition.x - radius, tempPlayer2.hipPosition.x + radius))) {
					playerMap.kinect2.player1 = kinectData.kinect2.rawData2.bodyId
					console.log("Remap successful")
				} else if (between(playerY.hipPosition.x, tempPlayer2.hipPosition.x - radius, tempPlayer2.hipPosition.x + radius)
					&& !(between(playerY.hipPosition.x, tempPlayer1.hipPosition.x - radius, tempPlayer1.hipPosition.x + radius))) {
					playerMap.kinect2.player2 = kinectData.kinect2.rawData2.bodyId
					console.log("Remap successful")
				}
			} else {
				//console.log("Remap failed: No data for Player-1 and Player-2 in Kinect-2")
			}
		}
	}
}

// help function to calculate radius around player position
function between(x, min, max) {
	return x >= min && x <= max;
}