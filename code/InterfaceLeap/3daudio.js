function onError(err) {
    console.log("Load sound error: " + err);
}

/*
* Loads a given sound url.
*
* */

/*
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
*/


function loadAmbientSound(ambientSound, callback){
    var request = new XMLHttpRequest();
    var ambientSoundCopy = ambientSound;
    request.open('GET', ambientSoundCopy.soundType, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function() {

         audioCtx.decodeAudioData(request.response, function(buffer) {
             ambientSoundCopy.buffer = buffer;
                callback(ambientSoundCopy);
        }, onError);
    }
    request.send();
}


/*
/*
* Plays all sounds from a given scenario.
*
* scenario: the given scenario
*/

function playScenario(scenario, mainVolume) {
    for(i = 0; i < scenario.items.length; i++ ) {
        var ambient = scenario.items[i]

        ambient.source.start(0)

/*        var audioCtx = ambient.audioCtx
        var panner = ambient.customPanner.panner

        ambient.volume.connect(panner);
        if (audioCtx.state == "playing") {
            ambient.source.stop();
        }
        ambient.source.buffer = myBuffer;
        ambient.source.loop = ambient.loop;

        //single panner
        ambient.source.connect(panner);
        panner.connect(audioCtx.destination);
        ambient.volume.connect(panner);

        panner.connect(mainVolume)

        //Layer of panners
        if(ambient.panners != null) {
            for(p = 0; p < ambient.panners.length; p++){
                ambient.source.connect(ambient.panners[p].panner);
                ambient.panners[p].panner.connect(audioCtx.destination);
            }
        }
*/
    }
}


/*

function playScenario(scenario){

    for(i = 0; i < scenario.items.length; i++ ) {

        ambient = scenario.items[i]

        audioCtx = ambient.audioCtx
        source = ambient.source
        panner = ambient.panner

        if (audioCtx.state == "playing" || source) {
            source.stop();
        }
        source = audioCtx.createBufferSource();
        source.buffer = myBuffer;
        source.loop = ambient.loop;
        source.connect(panner);
        panner.connect(audioCtx.destination);
        source.start(0);
    }
}
*/

/*

function initSoundAmbient(audioCtx, scenario, callback1) {

    isNotSuppurted = false;

    for(i = 0; i < scenario.items.length; i++){
        try {

            ambientSound = scenario.items[i];
            ambientSound.audioCtx = audioCtx;

            loadSound(ambientSound.soundType , function(){

                for(i = 0; i < scenario.items.length; i++){

                    ambientSound = scenario.items[i]
                    setup(ambientSound);
                    callback1();
                }

                                setupAllSounds(scenario, function(){


                 callback1();
                 });
            });
        }
        catch(e) {
            if(!isNotSuppurted) {
                alert('Web Audio API is not supported in this browser');
            }
            isNotSuppurted = true;
        }
    }
}
*/

/*
function initSoundAmbient(audioCtx, scenario, callback1) {

    isNotSuppurted = false;

    for(i = 0; i < scenario.items.length; i++){
        try {

            ambientSound = scenario.items[i];
            ambientSound.audioCtx = audioCtx;

            loadSound(ambientSound.soundType , function(){

                for(i = 0; i < scenario.items.length; i++){

                    ambientSound = scenario.items[i]
                    setup(ambientSound);
                    callback1();
                }

                /*                setupAllSounds(scenario, function(){


                 callback1();
                 });
            });
        }
        catch(e) {
            if(!isNotSuppurted) {
                alert('Web Audio API is not supported in this browser');
            }
            isNotSuppurted = true;
        }
    }
}

*/




/* Plays the sound of an ambient object.
 *
 * Params:
 * ambient: the sound object
 * */
function play(ambient) {
    audioCtx = ambient.audioCtx
    source = ambient.source
    panner = ambient.panner

    if (audioCtx.state == "playing") {
        source.stop();
    }

//    source = audioCtx.createBufferSource();
    source.buffer = myBuffer;
    source.loop = ambient.loop;

    source.connect(panner);

    panner.connect(audioCtx.destination);
    source.start(0);
}

/* Initializes  every sound from a given sound scenario.
*
*  Params:
*  audioCtx: the given audioContext
*  scenario: the given scenario
*  listener: the current listener
*  callback1 : plays the sound
* */
function initSoundAmbient(scenario, callback) {
    try {
        var loadCounter = scenario.items.length

        scenario.items.forEach(function(ambientSound){
            loadAmbientSound(ambientSound, function(loadedAmbientSound){
                loadCounter = initSourceVolume(loadedAmbientSound, loadCounter, callback)
            })
        })

    } catch(e) {
        alert('Web Audio API is not supported in this browser');        
    }
}



function initSourceVolume(ambientSound, loadCounter, callback){

    ambientSound.gainNode = ambientSound.audioCtx.createGain();
    ambientSound.source = ambientSound.audioCtx.createBufferSource();
    ambientSound.source.buffer = ambientSound.buffer;

    // Connect source to a gain node
//    ambientSound.source.connect(ambientSound.gainNode);
    // Connect gain node to destination
    ambientSound.source.loop = ambientSound.loop;

    //HRTF Stuff
//    ambientSound.hrtfPanner.HRTFDataset = hrtfs;
//  ambientSound.source.connect(ambientSound.hrtfPanner.input)
//  --- will be needed  ambientSound.hrtfPanner.connect(ambientSound.gainNode)

    ambientSound.source.connect(ambientSound.gainNode) // will be obsolete if hrtf functions
    ambientSound.gainNode.connect(ambientSound.audioCtx.destination);

    loadCounter--
    if(loadCounter == 0){
        callback();
    }
    return loadCounter;
}

