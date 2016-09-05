var width = window.innerWidth;
var height = window.innerHeight;
var canvas = $("#canvas").get(0);

function draw() {
  var player = $("#player");
  player.css('left', width/2-10);
  player.css('top', height/2-10);
}

draw();


var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);
var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);




