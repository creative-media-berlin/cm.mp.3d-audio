(function() {
    var context, soundSource, soundBuffer, url = 'http://thingsinjars.com/lab/web-audio-tutorial/hello.mp3';

    // Step 1 - Initialise the Audio Context
    // There can be only one!

    function init() {
        if (typeof AudioContext !== "undefined") {
            context = new AudioContext();
        } else if (typeof webkitAudioContext !== "undefined") {
            context = new webkitAudioContext();
        } else {
            throw new Error('AudioContext not supported. :(');
        }
    }

    // Step 2: Load our Sound using XHR

    function startSound() {
        // Note: this loads asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        // Our asynchronous callback
        request.onload = function() {
            var audioData = request.response;

            audioGraph(audioData);


        };

        request.send();
    }

    // Finally: tell the source when to start

    function playSound() {
        // play the source now
        soundSource.start(context.currentTime);
    }

    function stopSound() {
        // stop the source now
        soundSource.stop(context.currentTime);
    }

    // Events for the play/stop bottons
    document.querySelector('.play').addEventListener('click', startSound);
    document.querySelector('.stop').addEventListener('click', stopSound);


    // This is the code we are interested in

    function audioGraph(audioData) {
        var panner;

        // Same setup as before
        soundSource = context.createBufferSource();
        context.decodeAudioData(audioData, function(soundBuffer){
            soundSource.buffer = soundBuffer;
            panner = context.createPanner();
            panner.setPosition(20, -5, 0);
            soundSource.connect(panner);
            panner.connect(context.destination);

            // Each context has a single 'Listener' 
            context.listener.setPosition(10, 0, 0);

            // Finally
            playSound(soundSource);
        });
    }


    init();


}());