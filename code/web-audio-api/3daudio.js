var audioCtx;
var source;
var myBuffer = null;
var shouldLoop = true;

var listener = null;
var panner = null;


var soundType = {

    SEAGULL: "resources/audio/seagull1_mono.wav",
    OCEAN: "resources/audio/ocean_waves_mono.wav"
}


function onError(err){
    console.log("error " + err);
}

function loadSound(url, callback){
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
      audioCtx.decodeAudioData(request.response, function(buffer) {
      myBuffer = buffer;

      callback();
    }, onError);
  }
  request.send();
}

function positionPanner(xPos, yPos, zPos) {
    panner.setPosition(xPos, yPos, zPos);
}


function play(){
    if(audioCtx.state == "playing" || source) {
        source.stop();
    }
    source = audioCtx.createBufferSource();
    source.buffer = myBuffer;
    source.loop = shouldLoop;
    source.connect(panner);
    panner.connect(audioCtx.destination);
    source.start(0);
}

function setup(){
    listener = audioCtx.listener;
    // right handed cartesian coordinate system
    // (0, 0, -1) --> listener faces in positive z axis (towards wall on horizont)
    // (0, 0, 1) --> z axis show up
    // listener.setOrientation(0, 0, -1, 0, 0, -1);

    panner = audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 100;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 10;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;
    panner.setVelocity(0,0,0);
    panner.setOrientation(0,0,0);
}

function initSound(filename, loop, callback1) {
    try {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        shouldLoop = loop;

        loadSound(filename, function(){
            setup();
            callback1();
        });
    }
    catch(e) {
        alert('Web Audio API is not supported in this browser');
    }
}

function changeSound(fileName){
    loadSound(fileName, function(){
        console.log("sound changed to: " + fileName);
        setup();
        play();
    });
}

