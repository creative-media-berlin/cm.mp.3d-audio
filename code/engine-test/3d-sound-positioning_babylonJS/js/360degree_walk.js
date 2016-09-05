var theta = 0;
var radius = 100;
var height = 0;//1.1;
var counter = 0;
var music = new BABYLON.Sound("music", "resources/audio/norm/footsteps-snow-sand_norm.wav",
    scene, null, {
        loop: true, autoplay: true, spatialSound: true, refDistance: 100, distanceModel: "equalpower", rolloffFactor: 2
        // loop: true, autoplay: true, spatialSound: true//, distanceModel: "exponential", rolloffFactor: 2
    });

// var twoPi = Math.PI * 2;
var radToDegree = 180 / Math.PI;
var degreeToRad = Math.PI / 180;

function updateVisualPosition(x, y){
    var playerY = parseInt($("#player").css('top'))
    var playerX = parseInt($("#player").css('left'))

    var soundX = playerX + x;
    var soundY = playerY + y;

    $("#walking_sound").css('top', soundY);
    $("#walking_sound").css('left', soundX);

}

function updatePosition(){
 
    theta += 10;
    theta = theta % 360;
    // var theta = counter % 360; 
    var x = Math.cos(theta*degreeToRad) * radius;
    var y = Math.sin(theta*degreeToRad) * radius;
    var z = height;

    console.log("angle: " + theta + "  x: " + x + " / y: " + y + " / z: " + z );
    music.setPosition(new BABYLON.Vector3(x, z, y));
    updateVisualPosition(x,y); 
}

function init(){
    setInterval(updatePosition, 1000);
    music.play();
}

init();



