var width = window.innerWidth;
var height = window.innerHeight;
var canvas = $("#canvas").get(0);


function draw() {
  var playerRed = $("#playerRed");
  var playerBlue = $("#playerBlue");
  playerRed.css('left', width/2-40);
  playerRed.css('top', height/2-10);
  playerBlue.css('left', height/2+40);
  playerBlue.css('top', height/2-10);
}

draw();

var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);
var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
// var music = new BABYLON.Sound("Music", "resources/audio/Chat.join_empty.snd.mp3", scene, null, { loop: false, autoplay: true });
var music = new BABYLON.Sound("music", "resources/audio/161815__dasdeer__sand-walk.wav", scene, null, {
    loop: true, autoplay: true, spatialSound: true, rolloffFactor: 2, maxDistance: 1000
});

// var playerId = "#playerBlue";
var playerId = "#playerRed";

function showCoords(event) {
  console.log("showCoords");
  var player = $(playerId);
	var playerY = parseInt(player.css('top'));
	var playerX = parseInt(player.css('left'));

  var x = event.clientX;
  var y = event.clientY;

  var relativeToPlayerX = x - playerX;
  var relativeToPlayerY = playerY - y;

  var coords = "X coords: " 
  + relativeToPlayerX 
  + ", Y coords: " + relativeToPlayerY;

  $("#log").html(coords);

  music.setPosition(new BABYLON.Vector3(relativeToPlayerX, relativeToPlayerY, relativeToPlayerY ));
}

