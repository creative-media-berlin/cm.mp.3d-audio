var API = require('web-audio-api')
    , AudioContext = API.AudioContext
//, AudioListener =  = require('web-audio-api').AudioListener
    , fs = require('fs')
    , context = new AudioContext
    , Speaker = require('speaker')

console.log('encoding format : ' + context.format.numberOfChannels + ' channels ; ' + context.format.bitDepth + ' bits ; ' + context.sampleRate + ' Hz')
context.outStream = new Speaker({
    channels: context.format.numberOfChannels,
    bitDepth: context.format.bitDepth,
    sampleRate: context.sampleRate
})

fs.readFile(__dirname + '/../resources/audio/rain.wav', function(err, buffer) {
    if (err) throw err
    context.decodeAudioData(buffer, function(audioBuffer) {
        var soundSource = context.createBufferSource()
        soundSource.connect(context.destination)
        soundSource.buffer = audioBuffer
        soundSource.loop = true
        soundSource.start(0)
    })
    context.listener.setPosition(20, -5, 0);
})