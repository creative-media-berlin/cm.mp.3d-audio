var express = require('express'),
    playerApp = express(),
    demoClientsApp = express(),
    InteractSoundServer = require('./backend/interactSoundServer'),
    fs = require('fs'),
    os = require('os'),
    playerAppPort = 8881,
    playerAppEndpoint = "/player",
    demoClientsPort = 8882,
    demoClientsEndpoint = "/demo-clients";

var emoji = require('node-emoji');

function getServerIPAddress(){
    var ifaces = os.networkInterfaces();
    var ipInfos = ifaces["en0"];
    return ipInfos.find(function(ipInfo){
        if (ipInfo.address.length <= 15 && ipInfo.address.length > 10){
            return ipInfo.address
        }
    })
}

// var ipAddress = '127.0.0.1'
var ipAddress = getServerIPAddress().address;
//var ipAddress = '192.168.178.30'
// var ipAddress = '141.45.202.7'
// var ipAddress = '192.168.0.24'
console.log(ipAddress);

storeIPForClient(ipAddress, function(err){
    if (!err){
        buildWebpack(function(){
            startMainServer()
            startPlayerApp(playerAppPort)
            startDemoClientsApp(demoClientsPort)

            console.log("player-app URL: " + ipAddress + ":" + playerAppPort + playerAppEndpoint);
            console.log("demo-clients-app URL: " + ipAddress + ":" + demoClientsPort + demoClientsEndpoint);
        })

    } else {
        console.error(err)
    }
});

function buildWebpack(callback){
    var webpack = require("webpack");
    var path = require("path");

    // returns a Compiler instance
    var compiler = webpack({
        entry: path.join(__dirname,"./frontend/player/mobile-player-app.js"),
        output: {
            path: __dirname,
            filename: "./public/bundle.js"
        },
        module: {
            loaders: [
                { test: /\.css$/, loader: "style!css" }
            ]
        }
    });

    compiler.run(function(err, stats) {
        if(err)
            return console.log(err);
        var jsonStats = stats.toJson();
        if(jsonStats.errors.length > 0)
            return console.log(jsonStats.errors);
        if(jsonStats.warnings.length > 0)
            console.log(jsonStats.warnings);
        console.log("executed webpack ");
        callback()
    });
}

function startMainServer(){
    var interactSoundServer = new InteractSoundServer();
    interactSoundServer.start();
}

function startDemoClientsApp(port){
    demoClientsApp.get('/', function (req, res) {
        res.send('go to '+ demoClientsEndpoint);
    });

    demoClientsApp.listen(port, function () {
        console.log('demoClientsApp listening on port ' + port + '!');
    });

    demoClientsApp.use(demoClientsEndpoint, express.static(__dirname + '/frontend/demo-clients'));
}


function startPlayerApp(port){
    playerApp.get('/', function (req, res) {
        res.send('go to '+ playerAppEndpoint);
    });

    playerApp.listen(port, function () {
        console.log('Public app listening on port ' + port + '!');
    });

    playerApp.use(playerAppEndpoint, express.static(__dirname + '/public'));
}


function storeIPForClient(ipAddress, callback){
    var path = require('path');
    fs.writeFile(path.resolve(__dirname,'public/server-ip-address.js'), "var ip = function(){ \nthis.ip = '"+ipAddress+"';\n} \nmodule.exports = ip;", function (err) {
        callback(err)
    });
}