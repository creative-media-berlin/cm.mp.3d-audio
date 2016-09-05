
var AudioContext = require('web-audio-api').AudioContext
    , fs = require('fs')
    , context = new AudioContext
    , Speaker = require('speaker')
    , BABYLON = require('babylonjs')
    , THREE = require('three')

//var MockBrowser = require('mock-browser').mocks.MockBrowser;
//var mock = new MockBrowser();
//
//var window = MockBrowser.createWindow();

var engine = new BABYLON.Engine(canvas, true);

//scene = new THREE.Scene()

console.log('encoding format : ' + context.format.numberOfChannels + ' channels ; ' + context.format.bitDepth + ' bits ; ' + context.sampleRate + ' Hz')
context.outStream = new Speaker({
    channels: context.format.numberOfChannels,
    bitDepth: context.format.bitDepth,
    sampleRate: context.sampleRate
})

fs.readFile(__dirname + '/resources/audio/rain.wav', function(err, buffer) {
    if (err) throw err
    context.decodeAudioData(buffer, function(audioBuffer) {
        var bufferNode = context.createBufferSource()
        bufferNode.connect(context.destination)
        bufferNode.buffer = audioBuffer
        bufferNode.loop = true
        bufferNode.start(0)
    })
})
