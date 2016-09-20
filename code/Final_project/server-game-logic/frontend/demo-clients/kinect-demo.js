var kinectLocationsClientSocket = io.connect('http://' + serverIP + ':8080/kinect-location');
var kinectFootstepsClientSocket = io.connect('http://' + serverIP + ':8080/kinect-footsteps');

var sender = null

kinectLocationsClientSocket.on('connect', function () {
  document.getElementById("kinect-demo-state").style.backgroundColor = "green";
  sender = setInterval(startSendingLocations, 1000);
  // sender = setInterval(startSendingFixedLocations, 100);
  startRoomDimensions()
});

kinectLocationsClientSocket.on('disconnect', function (err) {
  document.getElementById("kinect-demo-state").style.backgroundColor = "red";
  document.getElementById("kinect-demo-data").innerHTML = err
  if (sender) clearInterval(sender);
});

kinectLocationsClientSocket.on('error', function (err) {
  document.getElementById("kinect-demo-state").style.backgroundColor = "red";
  document.getElementById("kinect-demo-data").innerHTML = err
  if (sender) clearInterval(sender);
});

kinectFootstepsClientSocket.on('connect', function () {
  setInterval(startSendingFootsteps, 1000);
});

var counter = 0

function startSendingLocations() {
  counter++
  kinectLocationsClientSocket.emit('kinect-location-data', {
    Kinect: "demo-client",
    playerLocations: [
      {
        Kinect: "demo",
        playerId: 1,
        distanceToHead: 70,
        hipPosition: {
          x: (2 * counter % 100) / 100,
          y: (2 * counter % 100) / 100,
          z: (2 * counter % 100) / 100
        }
      },
      {
        Kinect: "demo2",
        playerId: 2,
        distanceToHead: 80,
        hipPosition: {
          x: (3 * counter % 100) / 100,
          y: (3 * counter % 100) / 100,
          z: (3 * counter % 100) / 100
        }
      }
    ]
  });
}

function startSendingFixedLocations() {
  counter++
  kinectLocationsClientSocket.emit('kinect-location-data', {
    Kinect: "demo-client",
    playerLocations: [
      {
        Kinect: "demo",
        playerId: 1,
        distanceToHead: 0,
        hipPosition: {
          x: 0.0,
          y: 0,
          z: 0.0
        }
      },
      {
        Kinect: "demo2",
        playerId: 2,
        distanceToHead: 0,
        hipPosition: {
          x: 0.5,
          y: 0,
          z: 0.5
        }
      }
    ]
  });
}

function startRoomDimensions() {
  kinectLocationsClientSocket.emit('room-update', {
    room: {
      width: 5,
      length: 5
    }
  })
}

function startSendingFootsteps() {
  kinectFootstepsClientSocket.emit('kinect-footstep-data', {
    footstep: "left",
    position: {
      x: 0,
      z: 0
    }
  });
}
