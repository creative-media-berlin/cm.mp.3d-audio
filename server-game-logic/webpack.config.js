
//const path = require('path');
//const node_modules = path.resolve(__dirname, 'node_modules');
//const vendors = [
//    'socket.io',
//    'express',
//    'jsonfile'
//];

module.exports = {
    entry: "./frontend/player/mobile-player-app.js",
    output: {
        path: __dirname,
        filename: "./public/bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};