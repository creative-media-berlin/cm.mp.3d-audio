var music = new BABYLON.Sound("Music", "resources/audio/norm/Chat.join_empty_norm.wav", 
// var music = new BABYLON.Sound("music", "resources/audio/161815__dasdeer__sand-walk.wav",
    scene, null, {
        // loop: false, autoplay: true, spatialSound: true, refDistance: 1, distanceModel: "exponential", rolloffFactor: 1
        loop: false, autoplay: true, spatialSound: true, maxDistance: 1000
    });

function showCoords(event) {
  console.log("showCoords");
	var playerY = parseInt($("#player").css('top'))
	var playerX = parseInt($("#player").css('left'))
  var x = event.clientX;
  var y = event.clientY;

  var relativeToPlayerX = x - playerX;
  var relativeToPlayerY = playerY - y;

  var coords = "X coords: " 
  + relativeToPlayerX 
  + ", Y coords: " + relativeToPlayerY;

  $("#log").html(coords);

  music.setPosition(new BABYLON.Vector3(relativeToPlayerX, relativeToPlayerY, relativeToPlayerY));
  music.play();
}