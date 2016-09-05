(function() {
  window.scene = new THREE.Scene()
  window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  // blau, grün, gelb, rot, lila, grau, braun, türkis, orange
  var colorArray = [0x0066ff, 0x00cc00, 0xffff00, 0xff0000, 0xff33cc, 0xD9D9D9, 0x996600, 0x00FAD9, 0xffa500]

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMapEnabled = true
  document.body.appendChild(renderer.domElement)

  // Room
  var wallGeometry  = new THREE.PlaneGeometry(20, 16)
  var floorGeometry = new THREE.PlaneGeometry(20, 20)
  var material = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide})

  var backwall = new THREE.Mesh(wallGeometry, material)
  material.wireframe = true
  backwall.position.set(10, 8, -20)
  scene.add(backwall)
  var floor = new THREE.Mesh(floorGeometry, material)
  floor.position.set(10, 0, -10)
  floor.rotation.x = Math.PI / 2
  scene.add(floor)
  var leftWall = new THREE.Mesh(wallGeometry, material)
  leftWall.position.set(0, 8, -10)
  leftWall.rotation.y = Math.PI / 2
  scene.add(leftWall)
  var rightWall = new THREE.Mesh(wallGeometry, material)
  rightWall.position.set(20, 8, -10)
  rightWall.rotation.y = Math.PI / 2
  scene.add(rightWall)

  // Playground
  var playground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10),
                             new THREE.MeshBasicMaterial({color: 0xff6666, side: THREE.DoubleSide}))
  playground.position.set(10, 0, -10)
  playground.rotation.x = Math.PI / 2
  scene.add(playground)

  // window.scope.collectables.push({
  //   id: 1,
  //   location: {
  //     x: 0.75,
  //     y: 0.5,
  //     z: 0.75
  //   }
  // })

  // window.scope.players.push({
  //   location: {
  //     distanceToHead: 70,
  //     hipPosition: {
  //       x: 0.25,
  //       y: 0,
  //       z: 0.25
  //     }
  //   },
  //   viewDirection: {
  //     x: 0,
  //     y: 0,
  //     z: -1
  //   }
  // })

  // window.scope.ambients.push({
  //   id: 1,
  //   location: {
  //     x: 0.5,
  //     y: 0.5,
  //     z: 0.5
  //   },
  //   maxDistance: 0.2
  // })

  // render loop
  render = function() {
    // Display option
    if(window.scope.cameraTop) {
      camera.position.fromArray([10, 40, 0])
      camera.lookAt(new THREE.Vector3(10, -40, -20))
    } else {
      camera.position.fromArray([10, 18, 12])
      camera.lookAt(new THREE.Vector3(10, 8, -10))
    }
    if(window.scope.showPlayground) {
      scene.remove(playground)
      scene.add(playground)
    } else {
      scene.remove(playground)
    }

    // Check if server data matches local collectables data
    for (var i = 0; i < window.scope.collectables.length; i++) {
      var currentServerCollectableId = window.scope.collectables[i].id
      if(window.scope.localCollectables[currentServerCollectableId]) {
        // There is a local representation for this collectable, update its properties
        var position = window.scope.collectables[i].location

        // Convert positions
        var convertedPos = {
          x: position.x * 20,
          y: position.y * 16,
          z: position.z * -20
        }

        window.scope.localCollectables[currentServerCollectableId].position   = new THREE.Vector3(convertedPos.x, convertedPos.y, convertedPos.z)
        window.scope.localCollectables[currentServerCollectableId].lastUpdate = Date.now()
      } else {
        // There is no local representation, create it!
        var newCollectable = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0x555555))

        // Convert positions
        var convertedPos = {
          x: window.scope.collectables[i].location.x * 20,
          y: window.scope.collectables[i].location.y * 16,
          z: window.scope.collectables[i].location.z * -20
        }

        console.log("newCollectable : " , newCollectable)
        console.log("scope.collectables[i].location : " , scope.collectables[i].location)

        newCollectable.position   = new THREE.Vector3(convertedPos.x, convertedPos.y, convertedPos.z)
        newCollectable.gmId       = currentServerCollectableId
        newCollectable.lastUpdate = Date.now()
        scene.add(newCollectable)
        
        // And store it locally
        window.scope.localCollectables[currentServerCollectableId] = newCollectable
        console.log("New collectable created, at position (" + newCollectable.position.x + ", " + newCollectable.position.y + ", " + newCollectable.position.z + ")")
      }
    }

    // Check if server data matches local players data
    for (var i = 0; i < window.scope.players.length; i++) {
      var currentServerPlayerId = window.scope.players[i].id
      if(window.scope.localPlayers[currentServerPlayerId]) {
        // There is a local representation for this player, update its properties
        var height        = window.scope.players[i].location.distanceToHead
        var position      = window.scope.players[i].location.hipPosition
        var viewDirection = window.scope.players[i].viewDirection ? window.scope.players[i].viewDirection : {x: 0, y: 0, z: 0}
        
        // Convert positions
        var convertedPos = {
          x: position.x * 20,
          y: position.y + height/2,
          z: position.z * -20
        }

        window.scope.localPlayers[currentServerPlayerId].position = new THREE.Vector3(convertedPos.x, convertedPos.y, convertedPos.z)
        window.scope.localPlayers[currentServerPlayerId].viewDirection.position = new THREE.Vector3(convertedPos.x, convertedPos.y+height/2, convertedPos.z)
        window.scope.localPlayers[currentServerPlayerId].viewDirection.setDirection(new THREE.Vector3(viewDirection.x, viewDirection.y, viewDirection.z))
        window.scope.localPlayers[currentServerPlayerId].lastUpdate = Date.now()
      } else {
        // There is no local representation, create it!
        var height = window.scope.players[i].location.distanceToHead
        console.log(height)
        var position = window.scope.players[i].location.hipPosition
        var viewDirection = window.scope.players[i].viewDirection ? window.scope.players[i].viewDirection : {x: 0, y: 0, z: 0}
        
        // Convert positions
        var convertedPos = {
          x: position.x * 20,
          y: position.y * 16,
          z: position.z * -20
        }

        // Player representation
        var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} )
        var newPlayer = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.8, height, 10, 1, true), material)
        newPlayer.position = new THREE.Vector3(convertedPos.x, convertedPos.y, convertedPos.z)
        newPlayer.gmId = currentServerPlayerId

        // View direction representation with initial viewDirection
        var arrow = new THREE.ArrowHelper(
          new THREE.Vector3(viewDirection.x, viewDirection.y, viewDirection.z),
          new THREE.Vector3(convertedPos.x, convertedPos.y+height/2, convertedPos.z), 5, 0xffffff
        )

        newPlayer.viewDirection = arrow
        newPlayer.lastUpdate = Date.now()
        scene.add(arrow)
        scene.add(newPlayer)
        
        // And store it locally
        window.scope.localPlayers[currentServerPlayerId] = newPlayer
        console.log("New player created, at position (" + newPlayer.position.x + ", " + newPlayer.position.y + ", " + newPlayer.position.z + ")")
      }
    }

    // Check if server data matches local ambient data
    for (var i = 0; i < window.scope.ambients.length && window.scope.showAmbients; i++) {
      var currentServerAmbientId = window.scope.ambients[i].id
      if(window.scope.localAmbients[currentServerAmbientId]) {
        // There is a local representation for this collectable, update its properties
        var position = window.scope.ambients[i].location
        var maxDist  = window.scope.ambients[i].maxDistance
        
        // Convert positions
        var convertedPos = {
          x: position.x * 20,
          y: position.y * 16,
          z: position.z * -20
        }

        window.scope.localAmbients[currentServerAmbientId].position = new THREE.Vector3(convertedPos.x, convertedPos.y, convertedPos.z)
        window.scope.localAmbients[currentServerAmbientId].geometry.radius = maxDist*20
        window.scope.localAmbients[currentServerAmbientId].lastUpdate = Date.now()
      } else {
        // There is no local representation, create it!
        var position = window.scope.ambients[i].location
        var maxDist  = window.scope.ambients[i].maxDistance
        var soundRef = window.scope.ambients[i].soundResourceRef
        
        // Convert positions
        var convertedPos = {
          x: position.x * 20,
          y: position.y * 16,
          z: position.z * -20
        }

        var color = colorArray[(currentServerAmbientId+3)%colorArray.length]
        var sound = document.createElement("div")
        sound.innerHTML = soundRef.split("/").pop()
        var hexColor = "" + color.toString(16)
        sound.style.color = hexColor.length <= 4 ? "#00" + hexColor : "#" + hexColor
        document.getElementById("ambient-color-box").appendChild(sound)

        var material = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide, wireframe: true} );
        var newAmbient = new THREE.Mesh(new THREE.SphereGeometry(maxDist*20), material);
        newAmbient.position = new THREE.Vector3(convertedPos.x, convertedPos.y, convertedPos.z)
        newAmbient.gmId = currentServerAmbientId
        newAmbient.lastUpdate = Date.now()
        scene.add(newAmbient)
        
        // And store it locally
        window.scope.localAmbients[currentServerAmbientId] = newAmbient
        console.log("New ambient created, at position (" + newAmbient.position.x + ", " + newAmbient.position.y + ", " + newAmbient.position.z + ")")
      }
    }

    // Delete local representations if they were not updated in the last 'timeInterval' ms
    var timeInterval = 500
    var localPlayers = window.scope.localPlayers
    Object.keys(localPlayers).forEach(function(key) {      
      if((Date.now() - localPlayers[key].lastUpdate) > timeInterval) {
        scene.remove(localPlayers[key])
        scene.remove(localPlayers[key].viewDirection)
        delete window.scope.localPlayers[key]
      }
    })

    var localCollectables = window.scope.localCollectables
    Object.keys(localCollectables).forEach(function(key) {      
      if((Date.now() - localCollectables[key].lastUpdate) > timeInterval) {
        scene.remove(localCollectables[key])
        delete localCollectables[key]
      }
    })

    if(!window.scope.showAmbients) {
      Object.keys(window.scope.localAmbients).forEach(function(ambient) {
        scene.remove(window.scope.localAmbients[ambient])
      })
      window.scope.localAmbients = {}
    } else {
      var localAmbients = window.scope.localAmbients
      Object.keys(localAmbients).forEach(function(key) {      
        if((Date.now() - localAmbients[key].lastUpdate) > timeInterval) {
          scene.remove(localAmbients[key])
          delete localAmbients[key]
        }
      })
    }

    setTimeout( function() {
        requestAnimationFrame(render)
    }, 1000 / 15 )

    renderer.render(scene, camera)
  }

  render()
}).call(this)