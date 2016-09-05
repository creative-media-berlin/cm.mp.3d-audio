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
