// Private

var openal = require('./openal')
var device = new openal.Device();
var context = new openal.Context( device );

openal.MakeContextCurrent( context );
openal.SetListenerOrientation(0, 0, 0);

//var data = new openal.WavData(__dirname + "/sounds/beat.wav");
var data = new openal.WavData(__dirname + "/sounds/american_pie_bless_net.wav");
var synth = new openal.Source( data );


var start = new Date();
var player;

function startSoundWithTimerAt(x, y, z) {
    //var d = new Date();
    //var t = d.toLocaleTimeString();
    openal.SetListenerPosition(x, y, z);
    synth.Play();
    synth.SetLoop(10);
    var seconds = (new Date() - start)/1000;
    console.log(seconds +' secs   ' + 'x/y/z: ' + x + "/" + y + "/" + z );
    console.log("started");
}

function stopFunction() {
    clearInterval(player);
    console.log("stopped");
}

// Public

module.exports = {
    startSoundAt: function (x, y, z) {
        //player = setInterval(function(){ startSoundWithTimerAt(x, y, z) }, 1000);
        startSoundWithTimerAt(x, y, z)
    },
    stopSound: function() {
        stopFunction();
    },
    updateSoundPosition: function(x, y, z) {
        openal.SetListenerPosition(x, y, z);

        //synth.Play();

        var seconds = (new Date() - start)/1000;
        console.log(seconds + ' secs   ' + 'x/y/z: ' + x + "/" + y + "/" + z + " update");
    }
};