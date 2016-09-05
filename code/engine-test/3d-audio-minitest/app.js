// Create a PlayCanvas application
var canvas = document.getElementById("application-canvas");
// Create the application and start the update loop
var app = new pc.Application(canvas);
app.start();
app.assets.loadFromUrl("audio/162620__nathanaelsams__walking-in-the-forest.wav", "audio", function (err, asset) {
    entity = new pc.Entity();
    entity.addComponent("audiosource", {
        assets: [
            asset.id
        ],
        loop: true,
        pitch: 1.7
    });
    app.root.addChild(entity);
    // start the audio
    entity.audiosource.play("162620__nathanaelsams__walking-in-the-forest.wav");
    var angle = 135;
    var radius = 3;
    var height = 0;//1.1;
    app.on("update", function (dt) {
        angle += 30*dt;
        if (angle > 360) {
            angle -= 360;
        }
        entity.setLocalPosition(radius * Math.sin(angle*pc.math.DEG_TO_RAD), height, radius * Math.cos(angle*pc.math.DEG_TO_RAD));
        entity.setLocalEulerAngles(0, angle+90, 0);
    });
});