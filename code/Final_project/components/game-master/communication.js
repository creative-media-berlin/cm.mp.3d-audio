(function() {
  window.scope = {
    collectables: [],
    players: [],
    ambients: [],
    localCollectables: {},
    localPlayers: {},
    localAmbients: {},
    showAmbients: false,
    cameraTop: false,
    showPlayground: false,
    socket: io.connect('http://localhost:8080/game-master')
  }

  window.scope.socket.on('game-master-updates', function (data) {
    // Writing collectables and players
    window.scope.collectables = data.level.collectables.items
    window.scope.players = data.playerCollection.items
    window.scope.ambients = data.level.ambients.items

    // Displaying scores
    var scoreDiv = document.getElementById('player-scores')
    scoreDiv.innerHTML = ""
    scoreDiv.appendChild(document.createTextNode("Level " + data.level.id + " => "))
    window.scope.players.forEach(function (player, i) {
      scoreDiv.appendChild(document.createTextNode("Player " + player.id + ": " + player.score + "; "))
    })
  })

  var games = []
  window.scope.socket.on('games-list-update', function (data) {
    var dropDown = document.getElementById("game-list")
    // Clearing dropdown
    dropDown.innerHTML = ""

    // Default entry "New Game"
    var optionNG = document.createElement("option")
    var contentNG = document.createTextNode("New Game")
    optionNG.appendChild(contentNG)
    dropDown.appendChild(optionNG)

    // Fill games dropdown
    if(games.length !== data.length) {
      games = []
      for(var i = 0; i < data.length; i++) {
        var gameDescription = data[i].date ? `Game ${i} (${new Date(data[i].date).toDateString()})` : `Game ${i}`
        var option = document.createElement("option")
        var content = document.createTextNode(gameDescription)
        option.appendChild(content)
        dropDown.appendChild(option)
      }
    }
  })

  // EVENT LISTENERS FOR BUTTONS BELOW
  document.getElementById('start-game').onclick = function() {
    var selectedIndex = document.getElementById("game-list").selectedIndex
    var gameId = selectedIndex == 0 ? null : selectedIndex-1
    console.log('start-game with id: ' + gameId)
    window.scope.socket.emit("game-start", {gameId: gameId})
  }

  document.getElementById('stop-game').onclick = function() {
    console.log('stop-game')
    window.scope.socket.emit('game-stop')
  }

  document.getElementById('reset-vd').onclick = function() {
    console.log('reset-vd')
    window.scope.socket.emit('reset-player-vd')
  }

  document.getElementById('showAmbient').onchange = function() {
    window.scope.showAmbients = !window.scope.showAmbients
    
    var span = document.getElementById("ambient-color-box")
    if(span != null && !window.scope.showAmbients) {
      span.parentNode.removeChild(span)
    } else if(span == null && window.scope.showAmbients) {
      var span = document.createElement("span")
      span.setAttribute("id", "ambient-color-box")
      document.getElementById("buttons").appendChild(span)
    }

    console.log("Show ambient: " + window.scope.showAmbients)
  }

  document.getElementById('cameraTop').onchange = function() {
    window.scope.cameraTop = !window.scope.cameraTop
    console.log("Camera top: " + window.scope.cameraTop)
  }

  document.getElementById('showPlayground').onchange = function() {
    window.scope.showPlayground = !window.scope.showPlayground
    console.log("Show playground " + window.scope.showPlayground)
  }

  // For testing purposes - sends random positions for all collectables
  document.getElementById('random-pos').onclick = function() {
    for(key in window.scope.localCollectables) {
      var currentCollectable = {
        id: window.scope.localCollectables[key].gmId,
        location: {
          x: Math.random() * (0.75 - 0.25) + 0.25,
          y: Math.random(),
          z: Math.random() * (0.75 - 0.25) + 0.25
        }
      }
      window.scope.socket.emit('collectable-location-data', { collectable: currentCollectable })
    }
  }
}).call(this)