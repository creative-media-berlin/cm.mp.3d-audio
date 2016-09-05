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
