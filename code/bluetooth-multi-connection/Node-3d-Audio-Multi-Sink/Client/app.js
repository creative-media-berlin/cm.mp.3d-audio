var net = require('net')
    , player = require("./OpenAL-Interface/3d-audio-player.js")
    , first = true;

var client = new net.Socket();
client.connect(5000, '127.0.0.1', function() {
    console.log('Connected');
    client.write('Hello, server! Love, Client.');
});

client.on('data', function(data) {
    //console.log('Received: ' + data);
    var player1 = JSON.parse(data)["players"][0];
    var pos = player1["position"];

    if (first){
        first = false;
        player.startSoundAt(pos[0], pos[1], pos[2]);
    } else {
        player.updateSoundPosition(pos[0], pos[1], pos[2]);
    }
});

client.on('close', function() {
    console.log('Connection closed');
    player.stopSound();
});

client.on('error', function(err){
    console.log("Error: "+err.message);
});