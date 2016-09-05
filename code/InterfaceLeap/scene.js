var scaleFactor = 1, listenerIsCamera = true, mainVolume = null, oceanAmbient = null,
//    customDistanceModel = 'continoues'
//    customDistanceModel = 'slow'
//
// customDistanceModel = 'fast'
    customDistanceModel = 'steep'


var listener = null
var soundSphereMap = null

var audioContext = null

var oceanAmbient = null

var cameraHeight = 1

var hrtfs = null

//--------- ambientSoundModel

var CustomPanner = function(position, distanceModel) {
    this.panner = null
    this.position = position
    this.panner = createPanner(this.position, distanceModel)
    this.distanceModel = distanceModel
}

var soundType = {
    SEAGULL: "./resources/audio/seagull1_mono.mp3",
    OCEAN: "./resources/audio/ocean_waves_mono.mp3",
    ORB: "./resources/audio/soundOrb.mp3",
    FOOT1: "./resources/audio/footSingleStep1.mp3",
    FOOT2: "./resources/audio/footSingleStep2.mp3",


    MU_RYTHM: "./resources/audio/mu_rhythm.wav",
    MU_BASS: "./resources/audio/mu_bass.wav",
    MU_REICH1: "./resources/audio/mu_reich_one.wav",
    MU_REICH2: "./resources/audio/mu_reich_two.wav",

    MU_PLAT1: "./resources/audio/mu_platform1.wav",
    MU_PLAT2: "./resources/audio/mu_platform2.wav",
    MU_PLAT3: "./resources/audio/mu_platform3.wav",
    MU_PLAT4: "./resources/audio/mu_platform4.wav",


    TRAINSTATION_ATMO: "./resources/audio/ts_train_station_atmo.mp3",
    STATION_ANNOUNCEMENT: "./resources/audio/ts_station_announcement.mp3",
    RINGTONE1: "./resources/audio/ts_ringtone1.mp3",
    RINGTONE2: "./resources/audio/ts_ringtone2.mp3",
    RINGTONE3: "./resources/audio/ts_ringtone3.mp3",
    RINGTONE4: "./resources/audio/ts_ringtone4.mp3",
    TICKET_VALIDATION: "./resources/audio/ts_ticket_validations.mp3",
    PIDGEONS: "./resources/audio/ts_pidgeons.mp3"
}

var layer = function(l, d, r) {
    this.footage = l
    this.depth = d
    this.radius = r
}

/*  object to represent a sound.
    ctx : the current AudioContext
    id  : name (id) of the sound
    tpye : type of sound

 */

var AmbientSoundModel = function (ctx, id, type, loop, x, y, z, layer, distanceModel, maxDistance) {
    var self = this
    this.id = id
    this.soundType = type
    this.position = { 
        x: x, 
        y: y, 
        z: z
    }

    this.maxDistance = maxDistance
    this.loop = loop
    this.audioCtx = ctx
//    this.customPanner = new CustomPanner(this.position, distanceModel)
    this.layer = layer

    if (this.layer != null) {
        this.panners = createPannerArea(this)
    }
    this.distanceModel = distanceModel

    //HRTF Stuff

/*
    this.hrtfPanner = new BinauralFIR({
        audioContext: this.audioCtx
    });

    this.hrtfPanner.setPosition(0, 0, 1);
    this.hrtfPanner.state = "A2B";
*/
}




function drawPannerArea(ambient, color) {
    var plane = null
    if(this.layer != null) {
        var geometry = new THREE.PlaneGeometry( ambient.layer.depth, ambient.layer.footage );
        var material = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );
        plane = new THREE.Mesh( geometry, material );
        plane.position.set(ambient.position.x , ambient.position.y, ambient.position.z + ambient.layer.depth * 0.5)
        plane.rotation.x = Math.PI / 2;
        plane.position.z -= ambient.layer.depth * 0.5
    }
    return plane
}




function drawPannerSphere(sphere, scene) {

//    var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0x555555));
    sphere.position.x = ambient.customPanner.position.x
    sphere.position.y = ambient.customPanner.position.y
    sphere.position.z = ambient.customPanner.position.z

    if(ambient.panners != null) {
        for(i = 0; i < ambient.panners.length; i++) {
            var sphereTemp = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0x555555));

            sphereTemp.position.x = ambient.panners[i].position.x
            sphereTemp.position.y = ambient.panners[i].position.y
            sphereTemp.position.z = ambient.panners[i].position.z

            scene.add(sphereTemp)
        }
    }
}

function createPanner(pos, distanceModel) {
    var panner = this.audioCtx.createPanner()
    panner.panningModel = 'HRTF'
    panner.distanceModel = 'linear'

/*  panner.refDistance = 10
    panner.maxDistance = 100
    panner.rolloffFactor = 1
*/

    panner.refDistance = 1
    panner.maxDistance = 1
    panner.rolloffFactor = 1
    panner.volume = 1.0;

    panner.coneInnerAngle = 360
    panner.coneOuterAngle = 0
    panner.coneOuterGain = 0
    panner.setOrientation(0,1,0)
    panner.setPosition(pos.x, pos.y, pos.z);
    panner.channelCountMode = 'explicit';
    panner.volume.channelInterpretation = 'discrete'

    return panner;
}

function drawHearingArea(ambientModel, customPanner, scene, color){

    var radius = ambientModel.maxDistance
//    var radius = calculateHearingRadius(ambientModel);

    var material = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );
    material.wireframe = true

    var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius), material);
    sphere.position.x = customPanner.position.x
    sphere.position.y = customPanner.position.y
    sphere.position.z = customPanner.position.z
    scene.add(sphere)
}

/*
 * Calculates the maximum hearable distance from the audio source.
 * */
function calculateHearingRadius(ambientModel) {
    var radius = 0;

    var v = ambientModel.customPanner.position - listener.position;
//    var distance = Math.sqrt(dotProduct(v, v));

    var panner = ambientModel.customPanner.panner
    if (panner.distanceModel == 'linear') {
        radius = calculateLinearDistance(panner, -1)
        console.log(calculateLinearLoudness(panner, radius))
    } else if(panner.distanceModel == 'inverse') {
        radius = calculateInverseAudioDistance(panner, 0)
        console.log(calculateInverseLoudness(panner, radius))
    } else {
        radius = calculateExponentialDistance(panner, 0.01)
    }
    console.log(radius)
    return radius
}


/*
* Creates an area for one sound object.
*
* The sound object can contain one property named "layer".
* If the layer is not null, you can create an area in x/z coordinates.
*
* The purpose for the function is to find the coordinates for panner objects.
*
* Params: ambient : current sound object to extend with a layer
* Returns: the panner area
* */
function createPannerArea(ambient) {
    var panners = []
    var middlePoint = {}
    middlePoint.length = ambient.layer.depth * 0.5
    middlePoint.depth  = ambient.layer.footage * 0.5
    middlePoint.rounds = 0

    if(middlePoint.length > middlePoint.depth){
        middlePoint.rounds = middlePoint.length / ambient.layer.radius
    } else {
        middlePoint.rounds = middlePoint.depth / ambient.layer.radius
    }

    //rotate around the middlePoint in 45°
    for(r = 1; r <= middlePoint.rounds; r++) {
        var currentPosition = {
            x: 0, //r * ambient.layer.radius
            y: 0,
            z: r * ambient.layer.radius
        }

        //rotate around the middlePoint in 45°
        for(rot = 0; rot < 7; rot++) {
            if(currentPosition.z >= -middlePoint.depth  && currentPosition.z <= middlePoint.depth &&
               currentPosition.x >= -middlePoint.length && currentPosition.x <= middlePoint.length) {
//            if(Math.abs(currentPosition.z) <= Math.abs(middlePoint.depth) &&
 //               Math.abs(currentPosition.x) <= Math.abs(middlePoint.length)){

                var customPosition = {
                    x: ambient.position.x + currentPosition.x,
                    y: ambient.position.y + currentPosition.y,
                    z: ambient.position.z + currentPosition.z
                }

//                    var panner = createPanner(customPosition)
  //              var customPanner = new CustomPanner(customPosition, customDistanceModel)
//                    customPanner.panner = panner;
//                    customPanner.position = customPosition
            //    panners.push(customPanner)
            }

            currentPosition = rotateAxeY(currentPosition, 45 * 0.0174533)
        }
    }

    return panners
}

//------------ scene.js

(function() {
    var indexOfFoot = 0
    var gyroData = {}
    var viewDirection = null
//    var listener = null

    var roomSize = {
        x: 3.16,
        y: 3.5,
        z: 5.16
    }

    var kinectPos = {
        x: 0,
        y: 0,
        z: 0
    }

    var currentVector = {
        x: 0,
        y: 0,
        z: -1
    }

    if(!listenerIsCamera) {
        console.log("try to connect");
        var gameMasterSocket = io.connect('http://192.168.178.23:8080/game-master')
        gameMasterSocket.on('updates', function (data) {
            kinectPos = data.playerCollection.items[0].location.hipPosition

            viewDirection = data.playerCollection.items[0].viewDirection
            room = data.room

            //     if(roomSize.x == 0 && room != null){
            //         console.log("if(roomSize.x == 0 && room != null)")
            //          roomSize.x = room.width
            //          roomSize.y = 3
            //          roomSize.z = room.length
            //
            //         init();
            //         allowUpdate = true
            //     }

            // visualize game data
            console.log("game data update: ", data);
        })
    }

    /**
     * Created by andrevallentin on 25.05.16.
     */
/*
    var socket = io.connect('http://141.45.200.43:8080');

    socket.on('connect', function (data) {
        //gyroData = JSON.parse(data);
        console.log("connected")
        socket.on('gyro-data', function (data) {
            gyroData = JSON.parse(data);
            console.log("gyroData", gyroData)
        });


        socket.on('kinect-location-data', function(data){

            kinectData = data;
            console.log("kinectData", kinectPos)
        });
    });
*/

    var scene, camera, renderer, soundScenario, clock, player, line
    var geometry, material, mesh, controls, controlsEnabled
    var moveForward, moveBackward, moveLeft, moveRight, canJump;

    var velocity        = new THREE.Vector3();
    var havePointerLock = ('pointerLockElement' in document
                        || 'mozPointerLockElement' in document
                        || 'webkitPointerLockElement' in document)



    init();
    //HRTF Stuff
//    initHRTFDataset()

    animate();

    /*
    * Draws the current room and adds the geometry to the scene.
    * */
    function buildRoom(scene) {
        // room
        var frontWall = new THREE.PlaneGeometry(roomSize.x * scaleFactor, roomSize.y * scaleFactor) //X-Ausrichtung
        var sideWall = new THREE.PlaneGeometry(roomSize.z * scaleFactor, roomSize.y * scaleFactor) //Z-Ausrichtung

        var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} )
        material.wireframe = true

        var planeBack = new THREE.Mesh( frontWall, material )
        planeBack.position.set(roomSize.x * 0.5 * scaleFactor, roomSize.y * 0.5 * scaleFactor, 0)

        var planeFront = new THREE.Mesh(frontWall, material)
        planeFront.position.set(roomSize.x * scaleFactor * 0.5, roomSize.y * 0.5 * scaleFactor, -roomSize.z * scaleFactor)

        var planeLeft = new THREE.Mesh(sideWall, material)

        planeLeft.rotation.y = Math.PI / 2
        planeLeft.position.z -= roomSize.z * 0.5 * scaleFactor
        planeLeft.position.y = roomSize.y * 0.5 * scaleFactor

        var planeRight = new THREE.Mesh(sideWall, material)
        planeRight.rotation.y = Math.PI / 2;
        planeRight.position.z -= roomSize.z * 0.5 * scaleFactor
        planeRight.position.y = roomSize.y * 0.5 * scaleFactor
        planeRight.position.x = roomSize.x * scaleFactor

        scene.add(planeFront)
        scene.add(planeBack)
        scene.add(planeLeft)
        scene.add(planeRight)
    }


    function initHRTFDataset(){

        // HRTF files loading
        for (var i = 0; i < hrtfs.length; i++) {
            var buffer = audioContext.createBuffer(2, 512, 44100);
            var bufferChannelLeft = buffer.getChannelData(0);
            var bufferChannelRight = buffer.getChannelData(1);
            for (var e = 0; e < hrtfs[i].fir_coeffs_left.length; e++) {
                bufferChannelLeft[e] = hrtfs[i].fir_coeffs_left[e];
                bufferChannelRight[e] = hrtfs[i].fir_coeffs_right[e];
            }
            hrtfs[i].buffer = buffer;
        }
    }

    function init() {
        initControls()
        initPointerLock()


        clock = new THREE.Clock()
        scene = new THREE.Scene()

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,1, 10000)
        camera.position.y = cameraHeight
        camera.position.z = 1

        controls = new THREE.PointerLockControls(camera)
        scene.add(controls.getObject())

        // renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.shadowMapEnabled = true
        document.body.appendChild(renderer.domElement)

        // light visualizer
        lightVisualizer = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0x555555));
        lightVisualizer.position = new THREE.Vector3(0, 0, 0)
        scene.add(lightVisualizer);

        buildRoom(scene)

        playerMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        });


        playerVisualizer = new THREE.Mesh(new THREE.SphereGeometry(0.2), playerMaterial);
        playerVisualizer.position = new THREE.Vector3(0.5 * roomSize.x, 1.8, 0.5 * roomSize.z)
        scene.add(playerVisualizer);


        var AudioContext = window.AudioContext || window.webkitAudioContext
        audioCtx = new AudioContext()

        audioContext = audioCtx
        listener = audioCtx.listener
        listener.setOrientation(0,0,-1,0,1,0);

        mainVolume = audioCtx.createGain()
        // Connect the main volume node to the context destination.
        mainVolume.connect(audioCtx.destination)

        mainVolume.gain.volume = 1.0

        /*
        *
        * ocean        = x:0.5, y: 0,    z =  1.0
        * seagull      = x:0.8, y: 0.8,  z =  0.2
        * collectable  = x:0.2, y: 0.3,  z =  0.3
        *
        *             k2
        *     0;1----------------1;1
        *      |        o         |
        *      |                  |      z-Achse
        *      |                  |
        *      |  c           s   |
        *      |                  |
        *     x;z----------------1;0
        *             k1
        * */


//-- Setup with all beach sounds
        var oceanLayer = new layer(roomSize.x, roomSize.z, 2);
   //     var oceanAmbient   = new AmbientSoundModel(audioCtx, 'ocean', soundType.OCEAN, true,0.5 * roomSize.x, 0.5 * roomSize.y, -1 * roomSize.z, null)

      var  oceanAmbient   = new AmbientSoundModel(audioCtx, 'ocean', soundType.OCEAN, true,0.5 * roomSize.x, 0, 0, null, customDistanceModel)
     //   var oceanAmbient   = new AmbientSoundModel(audioCtx, 'ocean', soundType.OCEAN, true,0.5 * roomSize.x, 0.5 * roomSize.y, -1 * roomSize.z, oceanLayer,customDistanceModel)
        var seagullAmbient = new AmbientSoundModel(audioCtx, 'seagull', soundType.SEAGULL, true, 0.8 * roomSize.x, 1 * roomSize.y, 0.2 * roomSize.z, null,customDistanceModel)
        var orbAmbient = new AmbientSoundModel(audioCtx, 'orb', soundType.ORB, true, 0.2 * roomSize.x, 0.5 * roomSize.y, 0.3 * roomSize.z, null,customDistanceModel)
        var playerFoot1 = new AmbientSoundModel(audioCtx, 'foot1', soundType.FOOT1, false, 0, 0, 0, null, customDistanceModel)
        var playerFoot2 = new AmbientSoundModel(audioCtx, 'foot2', soundType.FOOT2, false, 0, 0, 0, null, customDistanceModel)


        var  music_rythm   = new AmbientSoundModel(audioCtx, 'mu_rythm', soundType.MU_RYTHM, true,0, 0, -roomSize.z, null, customDistanceModel)
        var  music_bass   = new AmbientSoundModel(audioCtx,     'mu_bass', soundType.MU_BASS, true, roomSize.x, 0, -roomSize.z, null, customDistanceModel)
        var  music_reich1   = new AmbientSoundModel(audioCtx,   'mu_reich1', soundType.MU_REICH1, true, 0.2 * roomSize.x, 0.5 * roomSize.y, 0, null, customDistanceModel)
        var  music_reich2   = new AmbientSoundModel(audioCtx,   'mu_reich2', soundType.MU_REICH2, true, 0.8 * roomSize.x, 0.5 * roomSize.y, 0, null, customDistanceModel)

        var  music_plat1   = new AmbientSoundModel(audioCtx,   'mu_plat1', soundType.MU_PLAT1, true, 0, 0.25 * roomSize.y, 0, null, customDistanceModel)
        var  music_plat2   = new AmbientSoundModel(audioCtx,   'mu_plat2', soundType.MU_PLAT2, true, 1, 0.25 * roomSize.y, 0, null, customDistanceModel)

        var  music_plat3   = new AmbientSoundModel(audioCtx,   'mu_plat3', soundType.MU_PLAT3, true, 0, 0.25 * roomSize.y, -roomSize.z, null, customDistanceModel)
        var  music_plat4   = new AmbientSoundModel(audioCtx,   'mu_plat4', soundType.MU_PLAT4, true, 1, 0.25 * roomSize.y, -roomSize.z, null, customDistanceModel)


        var station_announcement = new AmbientSoundModel(audioCtx,   'station_anouncement', soundType.STATION_ANNOUNCEMENT, true, 0.5 * roomSize.x,  roomSize.y, 0.5 * -roomSize.z, null, customDistanceModel, 10)
        var trainstationAtmo = new AmbientSoundModel(audioCtx,   'trainstationAtmo', soundType.TRAINSTATION_ATMO, true, 0.5 * roomSize.x, 0.5 * roomSize.y, 0.5 * -roomSize.z, null, customDistanceModel, 10)
        var pidgeons = new AmbientSoundModel(audioCtx,   'pidgeons', soundType.PIDGEONS, true, 0.3 * roomSize.x, 0.9 * roomSize.y, 0.25 *-roomSize.z, null, customDistanceModel, 4)
        var ticketValidator = new AmbientSoundModel(audioCtx,   'ticketValidator', soundType.TICKET_VALIDATION, true, 0.6 * roomSize.x, 0.25 * roomSize.y, 0.2 * -roomSize.z, null, customDistanceModel,3)

        var ringTone1 = new AmbientSoundModel(audioCtx,   'ringTone1', soundType.RINGTONE1, true, 0.1 * roomSize.x, 0.1 * roomSize.y, 0.1 * -roomSize.z, null, customDistanceModel,2)
        var ringTone2 = new AmbientSoundModel(audioCtx,   'ringTone2', soundType.RINGTONE2, true, 0.5 * roomSize.x, 0.25 * roomSize.y, 0.6 *-roomSize.z, null, customDistanceModel,2)
        var ringTone3 = new AmbientSoundModel(audioCtx,   'ringTone3', soundType.RINGTONE3, true, 0.8 * roomSize.x, 0, 0.75 * -roomSize.z, null, customDistanceModel,2)
        var ringTone4 = new AmbientSoundModel(audioCtx,   'ringTone4', soundType.RINGTONE4, true, 1, 0.5 * roomSize.y, 0.4 * -roomSize.z, null, customDistanceModel,2)


        var wireframeMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
        wireframeMaterial.wireframe = true

        /*
        soundSphereMap = {
            "ocean": {"sound": oceanAmbient, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "seagull": {"sound": seagullAmbient, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "orb": {"sound": orbAmbient, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "foot1": {"sound": playerFoot1, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "foot2": {"sound": playerFoot1, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)}
        }
        */
/*
        soundSphereMap = {
            "music_rythm": {"sound": music_rythm, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "music_bass": {"sound": music_bass, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "music_reich1": {"sound": music_reich1, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "music_reich2": {"sound": music_reich2, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
        }

*/
        soundSphereMap = {
            "station_announcement": {"sound": station_announcement, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "trainstationAtmo": {"sound": trainstationAtmo, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "pidgeons": {"sound": pidgeons, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "ticketValidator": {"sound": ticketValidator, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "ringTone1": {"sound": ringTone1, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "ringTone2": {"sound": ringTone2, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "ringTone3": {"sound": ringTone3, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
            "ringTone4": {"sound": ringTone4, "sphere":  new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0xffffff)), "hearingRange" : new THREE.Mesh(new THREE.SphereGeometry(0.5), wireframeMaterial)},
        }


//        const ambientsForMusic = Array(music_bass, music_reich1, music_reich2, music_rythm)

        const ambientsForMusic = Array(music_bass, music_reich1, music_reich2, music_rythm, music_plat1, music_plat2, music_plat3, music_plat4)

        const ambientsForBeach = Array(oceanAmbient, seagullAmbient, orbAmbient)

        const ambientsForTrainstation = Array(station_announcement,trainstationAtmo,pidgeons,ticketValidator, ringTone1,ringTone2,ringTone3,ringTone4 )



        //       const ambientsForBeach = Array(oceanAmbient, orbAmbient)

//        const footSoundsForBeach = Array(footSand1, footSand2)

//        var panner = oceanAmbient.customPanner.panner;

        var musicScenario = new AmbientSoundCollection(ambientsForMusic)

        var beachScenario = new AmbientSoundCollection(ambientsForBeach)

        var trainScenario = new AmbientSoundCollection(ambientsForTrainstation)

//        var planeOcean = drawPannerArea(oceanAmbient, 0x0000ff)

        //------- Draws the sound objects
 //       scene.add(planeOcean)

        /*
        drawPannerSphere(soundSphereMap, scene)
        drawPannerSphere(seagullAmbient, scene)
        drawPannerSphere(orbAmbient, scene)
*/


        initSoundSpheres(soundSphereMap, scene)

//        drawHearingArea(oceanAmbient, oceanAmbient.customPanner,scene, 0xff0000)
//        soundScenario = beachScenario;
//        soundScenario = musicScenario

        soundScenario = trainScenario

        var vectorInput = { x: 1, y : 10, z: 100}
        vectorInput = rotateAxeX(vectorInput, 90)
        vectorInput = rotateAxeY(vectorInput, 90)
        vectorInput = rotateAxeZ(vectorInput, 90)

        var materialLine = new THREE.LineBasicMaterial({
            color: 0xff0000
        });

        var geometry1 = new THREE.Geometry()
        geometry1.vertices.push(new THREE.Vector3(0, 0, -1))
        geometry1.vertices.push(new THREE.Vector3(0, 0, -10))

        line = new THREE.Line( geometry1, materialLine )
        scene.add(line)

        initSoundAmbient(trainScenario, function(){

            playScenario(trainScenario, mainVolume)
        });

        var geometryDistLine = new THREE.Geometry()
        geometryDistLine.vertices.push(new THREE.Vector3(1, 1, 1 ))
        geometryDistLine.vertices.push(new THREE.Vector3(2, 2, 2 ))


        var materialGreen = new THREE.LineBasicMaterial({
            color: 0x00ff00
        });

  //      distanceLine = new THREE.Line( geometryDistLine, materialLine )
//        scene.add(distanceLine)


        document.body.appendChild(renderer.domElement)
    }


    function initSoundSpheres(soundSpheres, scene){

        for (var key in soundSpheres) {

            var sphere = soundSpheres[key].sphere
            var sound  = soundSpheres[key].sound
            var hearRange = soundSpheres[key].hearingRange

            var radius = sound.maxDistance
//            var radius = hearRange
//     var radius = calculateHearingRadius(sound)

            sphere.position.x = sound.position.x
            sphere.position.y = sound.position.y
            sphere.position.z = sound.position.z

            hearRange.position.x = sound.position.x
            hearRange.position.y = sound.position.y
            hearRange.position.z = sound.position.z

            hearRange.scale.x *= radius
            hearRange.scale.y *= radius
            hearRange.scale.z *= radius

            scene.add(sphere)
            scene.add(hearRange)
        }
    }

    function updatePlayerPosition(pos) {
        playerVisualizer.position.x = pos.x  * roomSize.x
        playerVisualizer.position.y = pos.y  * roomSize.y
        playerVisualizer.position.z = -pos.z * roomSize.z
    }

    function animate() {
        requestAnimationFrame(animate)
        updateControls()

        controls.getObject().position.y = cameraHeight

        if(listenerIsCamera) {
            updateScenarioVolume(soundScenario, controls.getObject().position)
            updateListener(controls.getObject().position, viewDirection);
        }
        else{
            updateScenarioVolume(soundScenario, kinectPos)
            updateListener(kinectPos, viewDirection);
        }

        if(viewDirection != null) {
            updateViewDirection(viewDirection)
        }

        if(kinectPos != null) {
            updatePlayerPosition(kinectPos)
        }

//        oceanAmbient.customPanner.panner.setPosition(controls.getObject().position.x, controls.getObject().position.y,controls.getObject().position.z);
//        oceanAmbient.customPanner.panner.setVelocity(xVel, 0, zVel)



        if(listenerIsCamera) {

//              updateSourcePosition(soundScenario, controls.getObject(), controls.getDirection())
//            updateListener(controls.getObject().position, viewDirection);

        } else {
            updateListener(kinectPos, viewDirection);

        }


        renderer.render(scene, camera);
    }

    /*
    * Updates the view direction. The current view direction needs also one vector which is independet in 90°.
    * So it will be rotated.
    *
    * Params:
    *
    * gyro: the current gyroscope / accelerometer values
    * */
    function updateViewDirection(gyro) {
        var vecStart = {
            x: 0,
            y: 0,
            z: -0.1
        }

        vecStart = rotateAxeZ(vecStart, gyro.z * 0.0174533)
        vecStart = rotateAxeX(vecStart, gyro.x * 0.0174533)
        vecStart = rotateAxeY(vecStart, gyro.z * 0.0174533)
        viewDirection = vecStart

        var geometry1 = new THREE.Geometry()
        geometry1.vertices.push(new THREE.Vector3(playerVisualizer.position.x + vecStart.x,playerVisualizer.position.y + vecStart.y, playerVisualizer.position.z + vecStart.z))
        geometry1.vertices.push(new THREE.Vector3(playerVisualizer.position.x + vecStart.x * 20, playerVisualizer.position.y + vecStart.y * 20, playerVisualizer.position.z + vecStart.z * 20))
        line.geometry = geometry1
    }


    function updateSourcePosition(scenario, playerPos, viewDirection){

        var ambient = null

        for(i = 0; i < scenario.items.length; i++){

            ambient = scenario.items[i]

            var nextPos = {}
            nextPos.x = ambient.position.x - playerPos.x
            nextPos.y = ambient.position.y
            nextPos.z = ambient.position.z - playerPos.z
            ambient.customPanner.panner.setPosition(nextPos.x,nextPos.y ,nextPos.z)

            var v = {}
            v.x = ambient.position.x - playerPos.x
            v.y = ambient.position.y
            v.z = ambient.position.x - playerPos.z

            ambient.customPanner.position = nextPos;

            soundSphereMap[ambient.id].sphere.position = nextPos

            updateSpherePosition(soundSphereMap[ambient.id].sphere, nextPos)
            updateSpherePosition(soundSphereMap[ambient.id].hearingRange, nextPos)

//            var distance = dotProduct(v,v)

            var distance = calculateDistance(ambient.position, playerPos)



            if(ambient.id == 'ocean'){

/*
                var geometry = geometry.vertices.push(new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z))
                geometry.vertices.push(new THREE.Vector3(ambient.customPanner.position.x, ambient.customPanner.position.y, ambient.customPanner.position.z))
                distanceLine.geometry = geometry
*/
//                drawPannerSphere(ambient, scene)

            }
        }

        if(viewDirection != null) {
            var vecOutput = rotateAxeX(viewDirection, 90 * 0.0174533);
            listener.setOrientation(viewDirection.x, viewDirection.y, viewDirection.z, vecOutput.x, vecOutput.y, vecOutput.z);
        }
    }

    function updateSpherePosition(sphere, pos){

        sphere.position.x = pos.x
        sphere.position.y = pos.y
        sphere.position.z = pos.z
    }

    function setPosition(listener, x, y, z) {
        if (typeof listener.setPosition === 'function') {
            listener.setPosition(x, y, z);
        } else if (listener.positionX instanceof AudioParam) {
            listener.positionX.value = x;
            listener.positionY.value = y;
            listener.positionZ.value = z;
        } else {
            // log an error or do something else...
        }
    }


    /*
        Updates the audio listener view.
    */
    function updateListener(playerPos, viewDirection) {
        if (listener != null) {

//            listener = audioContext.create
//            audioContext.listener.setPosition(playerPos.x, playerPos.y, playerPos.z)
            setPosition(listener, playerPos.x, playerPos.y, playerPos.z)

/*            listener.position.x = playerPos.x
            listener.position.y = playerPos.y
            listener.position.z = playerPos.z
*/


//            listener.setPosition(playerPos.x, playerPos.y, playerPos.z);
//          listener.setPosition(playerVisualizer.position.x, playerVisualizer.position.y, playerVisualizer.position.z);
            if(viewDirection != null) {
                var vecOutput = rotateAxeX(viewDirection, 90 * 0.0174533);
                listener.setOrientation(viewDirection.x, viewDirection.y, viewDirection.z, vecOutput.x, vecOutput.y, vecOutput.z);
            }
        }
    }

    function initPointerLock() {
        var element = document.body
        if (havePointerLock) {
            var pointerlockchange = function (event) {
                if (document.pointerLockElement === element ||
                    document.mozPointerLockElement === element ||
                    document.webkitPointerLockElement === element) {
                    controlsEnabled  = true
                    controls.enabled = true
                } else {
                    controls.enabled = false
                }
            }

            var pointerlockerror = function (event) {
                element.innerHTML = 'PointerLock Error'
            }

            document.addEventListener('pointerlockchange', pointerlockchange, false)
            document.addEventListener('mozpointerlockchange', pointerlockchange, false)
            document.addEventListener('webkitpointerlockchange', pointerlockchange, false)

            document.addEventListener('pointerlockerror', pointerlockerror, false)
            document.addEventListener('mozpointerlockerror', pointerlockerror, false)
            document.addEventListener('webkitpointerlockerror', pointerlockerror, false)

            var requestPointerLock = function(event) {
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock
                element.requestPointerLock()
            }

            element.addEventListener('click', requestPointerLock, false)
        } else {
            element.innerHTML = 'Bad browser; No pointer lock'
        }
    }

    function onKeyDown(e) {
        switch (e.keyCode) {
            case 38: // up
            case 87: // w
                moveForward = true
                break
            case 37: // left
            case 65: // a
                moveLeft = true
                break
            case 40: // down
            case 83: // s
                moveBackward = true
                break
            case 39: // right
            case 68: // d
                moveRight = true
                break

            case 32: // space
                if (canJump === true) velocity.y += 350
                canJump = false
                break
        }
    }

    function onKeyUp(e) {
        switch(e.keyCode) {
            case 38: // up
            case 87: // w
                moveForward = false
                break
            case 37: // left
            case 65: // a
                moveLeft = false
                break
            case 40: // down
            case 83: // s
                moveBackward = false
                break
            case 39: // right
            case 68: // d
                moveRight = false
                break
        }
    }

    function initControls() {
        document.addEventListener('keydown', onKeyDown, false)
        document.addEventListener('keyup', onKeyUp, false)
        raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10)
    }

    var counterDist = 1
    /* Updates the controls like the mouse and keyboard input for the camera.*/
    function updateControls() {
        if(controlsEnabled) {
            var delta = clock.getDelta()
            var walkingSpeed = 100.0

            velocity.x -= velocity.x * 10.0 * delta
            velocity.z -= velocity.z * 10.0 * delta
//            velocity.y -= 9.8 * 100.0 * delta

            if (moveForward){ velocity.z -= walkingSpeed * delta
                zVel = -17;
            }
            if (moveBackward){velocity.z += walkingSpeed * delta

                zVel = 17
            }

            if (moveLeft){velocity.x -= walkingSpeed * delta
                xVel = -17
            }
            if (moveRight){ velocity.x += walkingSpeed * delta
                xVel = 17
            }

            if (moveForward || moveBackward || moveLeft || moveRight) {

                if(listenerIsCamera) {
                    //    updateListener(controls.getObject().position, controls.getDirection());
/*
                    updateListener(controls.getObject().position, controls.getDirection());

                    var x = oceanAmbient.customPanner.position.x - controls.getObject().position.x
                    var y = oceanAmbient.customPanner.position.y - controls.getObject().position.y
                    var z = oceanAmbient.customPanner.position.z - controls.getObject().position.z

                    var sum = x * x + y * y + z * z

                    var distance = Math.sqrt(sum);

                    var playerPos = controls.getObject().position

                    oceanAmbient.volume.gain.value = calculateCustomLoudness(oceanAmbient.customPanner.panner, distance)
                  */
                }
            }

            controls.getObject().translateX(velocity.x * delta)
            controls.getObject().translateY(velocity.y * delta)
            controls.getObject().translateZ(velocity.z * delta)
        }
    }
})()



function updateScenarioVolume(scenario, playerPos) {

    var ambient = null

    for (i = 0; i < scenario.items.length; i++) {

        ambient = scenario.items[i]

        //HRTF-Stuff
/*
        var rotPos = ambient.position

        rotPos = rotateAxeX(rotPos, -viewDirection.x)
        rotPos = rotateAxeY(rotPos, -viewDirection.y)
        rotPos = rotateAxeZ(rotPos, -viewDirection.z)

        var azimuth = calculateAzimuth  (rotPos.x, rotPos.y, rotPos.z)
        var phi     = calculatePhi      (rotPos.x, rotPos.y, rotPos.z)

        ambient.hrtfPanner.setPosition(azimuth, phi, 1)
*/
        var distance = calculateDistance(ambient.position, playerPos)
        updateSoundVolume(ambient, distance)

    }
}

function updateScenarioVolumeHRTF(scenario, playerPos){

    var ambient = null
    for(i = 0; i < scenario.items.length; i++){

        ambient = scenario.items[i]
        var distance = calculateDistance(ambient.position, playerPos)
    }
}

function updateSoundVolume(ambient, distance){

    var gainValue = 0
    if( ambient.distanceModel == 'continoues'){

        gainValue = calculateCustomLoudnessContinuous(ambient.maxDistance, distance)
    }
    else if(ambient.distanceModel == 'slow'){

        gainValue = calculateCustomLoudnessSlow(ambient.maxDistance, distance)
    }

    //fast

    else if(ambient.distanceModel == 'steep'){

        gainValue = calculateCustomLoudnessSteep(ambient.maxDistance, distance)
    }

    else{
        gainValue = calculateCustomLoudnessFast(ambient.maxDistance, distance)
    }

    if(ambient.gainNode != null) {
        ambient.gainNode.gain.value = gainValue
    }

    if(ambient.id == 'ocean') {
        var debugText = gainValue + " d:" + distance
        var debugContainer = document.getElementById('debug-text')
        debugContainer.innerHTML = debugText
    }
//    ambient.customPanner.panner.volume = gainValue
//    ambient.volume.gain.value = gainValue
//    console.log("v:", gainValue, "d:", distance)

}

// ------- ambientSoundCollection
function AmbientSoundCollection(collectables) {
    this.items = collectables
}