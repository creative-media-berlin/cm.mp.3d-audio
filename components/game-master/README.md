# Game-Master Documentation

![game-master-screen](https://github.com/creative-media-berlin/cm.mp.3d-audio/wiki/Images/game-master/image1.png)

#### Index
1. [Dependecies](#dependencies)
2. [User-Interface](#user-interface)
	* [Scene](#scene-scenejs)
	* [Leap visualization](#leap-visualization-interfacejs)
	* [Other](#other-indexhtmlscenejs)
3. [Communication](#communication-communicationjs)


### Dependencies
The game-master interface is written in client-side JavaScript in combination of various libraries. The 3-dimensional presentation of the scene is in general done, using the open source library [ThreeJS](http://www.threejs.com/). To allow communication with the Leap Motion device the [Leap-JS API](http://github.com/leapmotion/leapjs/) is used. The visualization of the 3-dimensional hand – which is controlled using the Leap Motion device – and the conversion of the Leap space to Three.JS coordinates is done with the help of the [Leap-JS Rigged Hand](http://github.com/leapmotion/leapjs-rigged-hand/) plugin. The connection to the main game-server is established using WebSockets via [socket.io](http://www.socket.io/).


### User-Interface

For this documentation, the User-Interface is categorized in three different parts.


#### Scene (scene.js)
The scene visualizes the game environment consisting of the field, the players in it (including their view direction), the collectable sounds and ambient sounds.

There are only very few geometry used to visualize the scene:

1. PlaneGeometry (wall, floor)
	```javascript
	var wallGeometry  = new THREE.PlaneGeometry(20, 16)
	var material = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide})
	var backwall = new THREE.Mesh(wallGeometry, material)
	material.wireframe = true
	scene.add(backwall)
	```

2. SphereGeometry (collectable, ambient sound)
	```javascript
	var newCollectable = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial(0x555555))
	scene.add(newCollectable)
	```

3. CylinderGeometry (players)
	```javascript
    var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} )
    var newPlayer = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.8, height, 10, 1, true), material)
    scene.add(newPlayer)
	```

4. ArrowHelpers (view direction)
	```javascript
	var arrow = new THREE.ArrowHelper(
      new THREE.Vector3(viewDirection.x, viewDirection.y, viewDirection.z),
      new THREE.Vector3(convertedPos.x, convertedPos.y+height/2, convertedPos.z), 5, 0xffffff
    )
    scene.add(arrow)
	```

All of the geometries are getting updated in real-time, whenever an event arrives over an open web socket connection to the server, and represent the current state of the game in a visual form. A background loop is constantly updating the scene to always match the current state of the game. The loop identifies players, collectables and ambient sounds through IDs and adds new entities to the scene when the entity in question is not yet existent. The other way around, if an entity in the scene is not updated for the last 500 ms, the entity in the scene is being deleted.

#### Leap interaction (interface.js)

The Leap visualization part renders the hand – which is being detected by the Leap Motion device – into the scene and allows interaction with the collectables.

The Leap JavaScript API provides one Leap frame every 30th of a second. This frame delivers plenty of information of the hands it currently detects. Such as the relative position of the hands palm and its pinch strength.

```javascript
controller.on('frame', function(frame) {
    if (!frame.hands[0])
      return

    // hand detected
	hand = frame.hands[0]
	// pinch strength
	pinchStrength = hand.pinchStrength
	// palm pos
	palmPos = hand.palmPosition
}
```

Both of these informations are used to interfere with the ongoing game. The pinch gesture is for grabbing collectable sounds and moving them around in 3-dimensional space. The pinch strength ranges from 0 (hand is completely open) and 1 (hand is fully pinched). In our case, as soon as the pinch strength reaches the value of 0.6 or higher the current distance from the hands position to all of the existing collectable sounds is measured: If the minimum distance is equal or less to "2" the according collectables position is set to the current hand position for as many frames as it takes the pinch strength to drop beneath 0.6 again (in other means, it is dragged around the field). The new position is directly sent to the server and is only drawn when the new position is being sent from the server back to the game-master.


#### Other (index.html/scene.js)

Through check boxes it is possible to:

1. Toggle ambient sounds
2. Change between two camera perspectives
3. Show the actual field of the game, where users can go


Through buttons it is possible to:

1. Reset the players view direction to face front*
2. Randomize all of the collectables positions
3. Start a new game
4. Load old ones (if the according game has been selected in the drop down menu)**
5. To stop the game

\**This is necessary, since the sensory data to measure the view direction is relative data*
\*\**This list is also coming from the server*


Through labels it is possible to see:

1. Which level is currently running
2. Each of the players score


### Communication (communication.js)

There's one open WebSocket connection. Using this connection we are listening for two events.

**'game-master-update'**, which provides the main data – such as players, ambient sounds, collectables. The local data strucutres are appended to the global window element to be globally accessible by all modules. This event usually gets fired multiple times per second.
```javascript
socket.on('game-master-updates', function (data) {
	// writing fresh data to our local data structures
    window.scope.collectables = data.level.collectables.items
    window.scope.players = data.playerCollection.items
    window.scope.ambients = data.level.ambients.items
}
```

**'game-list-update'**, which provides the old games list, which the game-master can choose from. This event gets usually fired only once, when the game-master connects to the main server.
```javascript
socket.on('games-list-update', function (data) {
	// building drop down list from data
}
```