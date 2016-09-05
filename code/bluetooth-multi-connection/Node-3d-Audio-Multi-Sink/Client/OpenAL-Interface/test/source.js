
var openal = require('../openal')

var device = new openal.Device();
var context = new openal.Context( device );

openal.MakeContextCurrent( context );
openal.SetListenerOrientation(1, 0, 0);

var data = new openal.WavData(__dirname+"/../sounds/synth.wav");
var synth = new openal.Source( data );

var degreeToRad = 0.0174533;

var x=0, y=0, z=0;
var start = new Date();

var angle = 0;
var radius = 10;
var height = 0;//1.1;

var counter = 0;

setInterval(function(){
	counter++;

	angle = 30*counter;
    if (angle > 360) {
        angle -= 360;
        counter = 0
    }

    openal.SetListenerPosition(radius * Math.sin(angle*degreeToRad), height, radius * Math.cos(angle*degreeToRad));

	// openal.SetListenerPosition(x, y, z);
	synth.Play();
	var seconds = (new Date() - start)/1000;
	console.log(seconds+' secs   ' + 'angle: ' + angle );
}, 1000);

