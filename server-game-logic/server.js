var serverSocket = require('socket.io')(8080);

var DataManager = require('./data/dataManager.js'),
    dataManager = new DataManager()
    GameController = require('./controllers/gameController'),
    gameController = new GameController(dataManager),
    LocationUpdateController = require('./controllers/locationUpdateController.js')

gameController.startNewGame(function(){
  console.log("started new games")
  setTimeout(function(){
    gameController.stopGame()
  }, 200)
})

locationUpdateController = new LocationUpdateController(dataManager)
locationUpdateController.listenForLocationUpdates(serverSocket)
