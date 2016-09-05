var theta = 0;
var radius = 100;
var height = 0;

/* loadSound(filename, shouldLoop, callback) */
initSound(footStepSound, true, function(){
    init();
});

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
    var x = Math.floor(Math.cos(theta*degreeToRad) * radius);
    var y = Math.floor(Math.sin(theta*degreeToRad) * radius);
    var z = height;

    $("#log").html("angle: " + theta + "  x: " + x + " / y: " + y + " / z: " + z );
    positionPanner(x, y, z);
    updateVisualPosition(x, -y);
}

function init(){
    setInterval(updatePosition, 1000);
    play();
    positionPanner(0, 0, 0);
}
