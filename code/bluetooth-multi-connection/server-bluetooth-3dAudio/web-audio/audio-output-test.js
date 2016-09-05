if (require.main === module) { // Just to avoid mocha running this
    var AudioContext = require('web-audio-api').AudioContext
        , fs = require('fs')
        , context = new AudioContext
        , Speaker = require('speaker')

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
}