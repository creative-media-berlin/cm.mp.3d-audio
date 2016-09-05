// Load the TCP Library
net = require('net');

// Keep track of the chat clients
var clients = [];
var loop;

// Start a TCP Server
net.createServer(function (socket) {
    counter =0;

    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort

    // Put this new client in the list
    clients.push(socket);
    //console.log(socket.name + " joined\n", socket);

    loop = setInterval(function(){ updatePositions() }, 1000);

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
        //console.log(socket.name + "> " + data, socket);
    });

    // Remove the client from the list when it leaves
    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        clearInterval(loop);
        //console.log(socket.name + " left the chat.\n");
    });

    //// Send a message to all clients
    //function broadcast(message, sender) {
    //    clients.forEach(function (client) {
    //        // Don't want to send it to sender
    //        if (client === sender) return;
    //        client.write(message);
    //    });
    //    // Log it to the server output too
    //    process.stdout.write(message)
    //}

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 5000\n");

var counter = 0;
function updatePositions(){

    var data =  {
        "players" : [
            {
                "name": "player A",
                "position" : [counter, counter, 0]
            },
            {
                "name": "player B",
                "position" : [40, 50, 30]
            }
        ], "sounds" :[
            {
                "name": "Sound A",
                "position" : [counter, counter, 0]
            }
        ]
    };

    clients.forEach(function (client) {
        client.write(JSON.stringify(data));
    });
    counter += 1;
}
