var ws = require("nodejs-websocket")
var io = require('socket.io-client');
var mainServerURL = '141.45.206.106'
var kinectLocationsClientSocket = io.connect('http://' + mainServerURL + ':8080/kinect-location')
var kinectFootstepClientSocket = io.connect('http://' + mainServerURL + ':8080/kinect-footsteps')
var distanceToHead = 70
var maxZ = 5.15 // distance in meters between Kinect1 and Kinect2
var kinectFOV = 63 // Kinect horizontal Field of View, to calculate Playground width
var mainServerConnected = false
var footstepBlockMap = {
	1: {
		'right': false,
		'left': false
	}
}
var width = calcWidth()

var kinectData = {
	kinect1: {rawData1: {bodyId: "11111111111111111", x: 0, y: 0, z: 0} },
	kinect2: {rawData1: {bodyId: "11111111111111111", x: 0, y: 0, z: 0} }
}

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
	console.log("One client connected to kinect server..")
		
	// When a kinect client sends data
	conn.on("text", function (incomingString) {
		// If incoming data arrives over the path ws://url.de:8001/k1
		if (conn.path == "/k1") {
			// parse string into javascript object and save it to kinectData[0]
			var newValues1 = JSON.parse(incomingString)
			for (var prop in newValues1) {
				if (kinectData.kinect1.hasOwnProperty(prop)) {
					kinectData.kinect1[prop] = newValues1[prop];
				}
			}
		// If incoming data arrives over the path ws://url.de:8001/k2
		} else if (conn.path == "/k2") {
			// parse string into javascript object and save it to kinectData[1]
			var newValues2 = JSON.parse(incomingString)
			for (var prop in newValues2) {
				if (kinectData.kinect2.hasOwnProperty(prop)) {
					kinectData.kinect2[prop] = newValues2[prop];
				}
			}
		}
		if (conn.path == "/footstep") {
			var data = JSON.parse(incomingString)
			var playerId = 1
			var blocked = footstepBlockMap[playerId][data.footstep]
			if(blocked == false) {
				kinectFootstepClientSocket.emit('kinect-footstep-data', {'footstep': data.footstep, 'x': data.x, 'z': data.z})
				console.log("Footstep: " + data.footstep)
				footstepBlockMap[playerId][data.footstep] = true
				setTimeout(function() {
					footstepBlockMap[playerId][data.footstep] = false
				}, 100)
			}
		} else {
			// Pass fresh data into calcPos function and output result to console
			var result = calcPos(kinectData.kinect1, kinectData.kinect2)

			// TODO: Don't send the result as is - it's only one player and the server expects all players as in playerLocations: [{..}, {..}]
			console.log(JSON.stringify(result))
			if(mainServerConnected) {
				kinectLocationsClientSocket.emit('kinect-location-data', result)
			}

			conn.on("close", function (code, reason) {
				console.log("One connection to main server closed.")
			})
		}
	})
}).listen(8001)


function calcPos(kinect1, kinect2) {
	var width = calcWidth()
	var calcX, deltaZ

	// kinect 1
	if(kinect2.rawData1.bodyId == "11111111111111111" || kinect1.rawData1.z < kinect2.rawData1.z) {
		
		calcX = (kinect1.rawData1.x - (width / 2)) * -1

		return {
			playerLocations: [{
				Kinect: 1,
				playerId: 1,
				distanceToHead: distanceToHead,
				hipPosition: {
					x: Number((calcX / width).toFixed(5)),
					y: Number(kinect1.rawData1.y.toFixed(5)),
					z: Number((kinect1.rawData1.z / maxZ).toFixed(5))
				}
			}]
		}
		
	// kinect 2
	} else {
		calcX = kinect2.rawData1.x - (width/(-2))
		deltaZ = maxZ - kinect2.rawData1.z

		return {
			playerLocations: [{
				Kinect: 2,
				playerId: 1,
				distanceToHead: distanceToHead,
				hipPosition: {
					x: Number((calcX / width).toFixed(5)),
					y: Number(kinect2.rawData1.y.toFixed(5)),
					z: Number((deltaZ / maxZ).toFixed(5))
				}
			}]
		}
	}
}

function calcWidth() {
	var rad = (kinectFOV/2) * Math.PI/180;
	var tan = Math.tan(rad)

	return (((maxZ / 2) * tan) * 2)
}