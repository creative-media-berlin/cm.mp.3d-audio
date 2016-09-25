(function() {
  var controller = new Leap.Controller({
    background: true
  })

  controller.use('riggedHand', {
    parent: window.scene,
    camera: window.camera,
    scale: 0.25,
    positionScale: 6,
    offset: new THREE.Vector3(1.5, -2, -2),
    renderFn: function() {},
    boneColors: function(boneMesh, leapHand) {
      return {
        hue: 0.6,
        saturation: 0.2,
        lightness: 0.8
      }
    }
  })

  controller.connect()

  controller.on('frame', function(frame) {
    var hand, handMesh, offsetDown, offsetForward, pos
    if (!frame.hands[0]) {
      return
    }
    hand = frame.hands[0]
    handMesh = hand.data('riggedHand.mesh')

    // When hand pinches
    if (hand.pinchStrength > 0.6) {
      // Save palm position
      pos = Leap.vec3.clone(hand.palmPosition)
      
      // Find nearest collectable
      if(Object.keys(window.scope.localCollectables).length > 0) {
        var minKey = 0
        var minDist = Number.MAX_VALUE

        for (key in window.scope.localCollectables) {
          // Get hand pos in leap coords
          var handPos = new THREE.Vector3().fromArray(pos)
          // Leap coords to scene coords
          handMesh.scenePosition(pos, handPos)

          // Collectable in scene coords
          var collectablePos = window.scope.localCollectables[key].position

          var dist = handPos.distanceTo(collectablePos)

          if(dist <= minDist) {
            minDist = dist
            minKey = key
          }
        }

        if(minDist <= 2) {
          // Transfer pos to scene pos and set it
          handMesh.scenePosition(pos, window.scope.localCollectables[minKey].position)
          var collectable = window.scope.localCollectables[minKey]

          var pos = {
            x: window.scope.localCollectables[key].position.x / 20,
            y: window.scope.localCollectables[key].position.y / 16,
            z: window.scope.localCollectables[key].position.z / -20
          }

          // Limit collectable pos to 0.25 - 0.75
          pos.x = pos.x < 0.25 ? 0.25 : pos.x > 0.75 ? 0.75 : pos.x
          pos.y = pos.y < 0 ? 0 : pos.y > 1 ? 1 : pos.y
          pos.z = pos.z < 0.25 ? 0.25 : pos.z > 0.75 ? 0.75 : pos.z
          
          // Before sending the collectable, normalize it and wrap it as expected from the server
          var currentCollectable = {
            id: window.scope.localCollectables[key].gmId,
            location: pos
          }

          // Send it
          window.scope.socket.emit('collectable-location-data', { collectable: currentCollectable })
        }
      }
    }
  })
}).call(this)