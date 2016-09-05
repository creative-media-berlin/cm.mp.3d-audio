var ready = false;

/* loadSound(filename, shouldLoop, callback) */
initSound(anyoneHereSound, false, function(){
  ready = true;
});

function showCoords(event) {
  if(ready){
    console.log("showCoords");
    var playerY = parseInt($("#player").css('top'))
    var playerX = parseInt($("#player").css('left'))
    var x = event.clientX;
    var y = event.clientY;

    var relativeToPlayerX = x - playerX - playerWidth/2;
    var relativeToPlayerY = playerY - y + playerWidth/2;

    //relativeToPlayerX = relativeToPlayerX;

    var coords = "X coords: "
        + relativeToPlayerX
        + ", Y coords: " + relativeToPlayerY;

    $("#log").html(coords);

    positionPanner(relativeToPlayerX, relativeToPlayerY, 0);
    play();
  } else {
    console.log("still loading sound .. ");
  }
}

