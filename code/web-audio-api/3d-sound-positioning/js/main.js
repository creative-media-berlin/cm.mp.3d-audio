var width = window.innerWidth;
var height = window.innerHeight;
var canvas = $("#canvas").get(0);
var player = $("#player");
var playerWidth = player.width();

var footStepSound = "resources/audio/norm/footsteps-snow-sand_norm.wav";
var catSound = "resources/audio/333916__thearxx08__cat-meowing.mp3";
//var catSound = "resources/audio/56380__oliver-eye__cat.wav";
var catpurrSound = "resources/audio/37185__klankschap__cat-1.mp3";
var birdSound = "resources/audio/34207__cajo__birds-01.wav";
//var birdSound = "resources/audio/73617__jus__lakeside-birds-2.wav";
var anyoneHereSound = "resources/audio/norm/Chat.join_empty_norm.wav";

$('input:radio[name="sound-source"]').change(function(){
  switch ($(this).val()) {
    case "foot-steps":
      changeSound(footStepSound);
      break;
    case "cat":
      changeSound(catSound);
      break;
    case "cat-purr":
      changeSound(catpurrSound);
      break;
    case "bird":
      changeSound(birdSound);
      break;
    case "robot":
      changeSound(anyoneHereSound);
      break;
    default:
      changeSound(footStepSound);
      break;
  }
});

function draw() {
  player.css('left', width/2 - playerWidth/2);
  player.css('top', height/2 - playerWidth/2);
}


draw();

