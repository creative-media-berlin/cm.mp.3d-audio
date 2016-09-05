var WavDecoder = require("wav-decoder");
var fs = require("fs");

console.log('hallo')

var readFile = function(filepath) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filepath, function(err, buffer) {
            if (err) {
                return reject(err);
            }
            return resolve(buffer);
        });
    });
};

console.log(new Buffer([1,2,123,5]))

readFile("./resources/audio/161815__dasdeer__sand-walk.wav").then(function(buffer) {
    var decoded = WavDecoder.decode(buffer); // buffer is an instance of Buffer
    //console.log('asdf',new Uint8Array(buffer))
    return decoded
}).then(function(audioData) {

    //console.log('audioData:',audioData)
    //
    var ba = new Uint8Array(audioData.channelData)
    //var ba = new Uint8Array(audioData.channelData[0], 0, Float32Array.BYTES_PER_ELEMENT);

    //
    console.log('uint8Array:',ba)

});

