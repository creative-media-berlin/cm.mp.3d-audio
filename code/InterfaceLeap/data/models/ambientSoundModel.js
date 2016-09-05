// AmbientSoundModel
/*
var audioCtx;
var source;
var myBuffer = null;
var shouldLoop = true;

// var listener = null;
var panner = null;
*/


var soundType = {

    SEAGULL: "./resources/audio/seagull1_mono.wav",
    OCEAN: "./resources/audio/ocean_waves_mono.wav"
}


var layer = {

    this.footage = 0
    this.depth = 0
    this.radius = 0
}

var AmbientSoundModel;
AmbientSoundModel = function (id, type, representsFoot, loop, x, y, z, gainModel) {
    this.id = id
    this.soundType = type
    this.x = x
    this.y = y
    this.z = z
    this.isFoot = representsFoot
    this.gainModel = gainModel

    this.audioCtx = null
    this.source = null
    this.myBuffer = null
    this.loop = loop
//    this.layer = layer
    this.panners = []
    this.panner = null
};


function setupPanners(ambient) {

    var panners = []

    panners.push() //First element in the middle
    panners[0].setPosition(ambient.x, ambient.y, ambient.z);


    var middlePoint = {}
    middlePoint.length = ambient.layer.depth * 0.5
    middlePoint.depth  = ambient.layer.footage * 0.5
    middlePoint.rounds = 0

    if(middlePoint.length > middlePoint.depth){
        middlePoint.rounds = middlePoint.length * 0.5
    }
    else{
        middlePoint.rounds = middlePoint.depth * 0.5
    }

    for(r = 1; r <= middlePoint.rounds; r++){

        if((middlePoint.depth + middlePoint.radius * r) <= ambient.layer.depth){


        }
//        this.panners[i] = this.audioCtx.createPanner();
    }
}


// private functions

//module.exports = AmbientSoundModel

