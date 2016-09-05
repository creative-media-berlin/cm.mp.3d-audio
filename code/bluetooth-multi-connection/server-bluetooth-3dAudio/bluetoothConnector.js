var headset1Address = "0c-a6-94-de-f9-cf";
var headset2Address = "0c-a6-94-d3-f0-8f";
var headset1Address_pi = '0C:A6:94:DE:F9:CF';
var headset2Address_pi = '0C:A6:94:D3:F0:8F';
var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
var AudioContext = require('web-audio-api').AudioContext
    , audioContext = new AudioContext
    , Speaker = require('speaker');

// Public

module.exports = {
    connectToDevices: function () {
        connectToDefault(defaultAddresses());
    },
    demo: function () {
        console.log('demo')
        btSerial.findSerialPortChannel(headset1Address, function (channel) {
            console.log("channel: ", channel);
            streamTestData(btSerial);
        }, function (err) {
            console.log('found nothing', err);
        });
    }
};

// Private

audioContext.outStream = new Speaker({
    channels: audioContext.format.numberOfChannels,
    bitDepth: audioContext.format.bitDepth,
    sampleRate: audioContext.sampleRate
});

btSerial.on('close', function() {
    console.log('connection has been closed (remotely?)');
});

btSerial.on('finished', function() {
    console.log('scan did finish');
});

function isAlreadyPairedWithHeadphone(address){
    var alreadyPaired = false;

    btSerial.listPairedDevices(function(pairedDevices) {
        pairedDevices.forEach(function(device) {
            if (device.address == address){
                alreadyPaired = true;
                console.log(device.address + " is already paired");
            }
        });
    });
    return alreadyPaired;
}

function connectToDefault(addresses) {
    addresses.forEach(function(address) {
        if (isAlreadyPairedWithHeadphone(address)){
            searchForFreeChannelOnAddress(address);
        }
    });
}

function defaultAddresses() {
    var addresses = [];
    if (process.platform == 'darwin'){
        addresses.push(headset1Address);
        addresses.push(headset2Address);
    } else {
        addresses.push(headset1Address_pi);
        addresses.push(headset2Address_pi);
    }
    return addresses;
}

function searchForNewDevice(){
    btSerial.on('found', function (address, name) {
        if(address == headset1Address ){
            // TODO: add further valid addresses
            searchForFreeChannelOnAddress(headset1Address);
        } else {
            console.log('found address ' + address + ' != headphone 1 ' + headset1Address);
        }
    });
    btSerial.inquire();
}

function searchForFreeChannelOnAddress(address) {
    btSerial.findSerialPortChannel(address, function (channel) {
        console.log("channel: ", channel);
        btSerial.connect(address, channel, function () {
            console.log(address + ' connected');
            streamSound(btSerial);
            //streamTestData(btSerial);
        }, function (error) {
            console.log(address + ' cannot connect', error);
            btSerial.close();
        });
    }, function () {
        console.log('found nothing');
    });
}

function streamSound(btSerial){
    console.log("streamSound()");

    var fs = require("fs");
    var WavEncoder = require("wav-encoder");
    var WavDecoder = require("wav-decoder");

    var readFile = function (filepath) {
        return new Promise(function (resolve, reject) {
            fs.readFile(filepath, function (err, buffer) {
                if (err) {
                    return reject(err);
                }
                return resolve(buffer);
            });
        });
    };

    //var filePath = './resources/audio/rain.wav';
    var filePath = './resources/audio/american_pie_bless_net.wav';
    //var fileCheck = fs.readFileSync(filePath, null);
    //if (fileCheck !== null) {
    //    console.log('File is not empty, so exists!');
    //} else {
    //    console.log('File does not exist');
    //}

    readFile(filePath).then(function (buffer) {
        return WavDecoder.decode(buffer); // buffer is an instance of Buffer
    }).then(function (audioData) {
        console.log("sampleRate " + audioData.sampleRate);
        //console.log(audioData.channelData[0]); // Float32Array
        //console.log(audioData.channelData[1]); // Float32Array
        btSerial.write(new Uint8Array(audioData.channelData[0]), function (err, bytesWritten) {
            if (err) {
                console.log(err);
            }
            console.log("bytesWritten: " + bytesWritten);
            console.log('success')
        });

        btSerial.on('data', function (buffer) {
            console.log("on: " + buffer.toString('utf-8'));
        });
    });
}

function streamTestData(btSerial){
    console.log("streamTestData()");
    btSerial.write(new Buffer('my data', 'utf-8'), function (err, bytesWritten) {
        if (err) {
            console.log(err);
            btSerial.close();
        }
        console.log("bytesWritten: " + bytesWritten);
    });

    btSerial.on('data', function (buffer) {
        console.log(buffer.toString('utf-8'));
    });
}
