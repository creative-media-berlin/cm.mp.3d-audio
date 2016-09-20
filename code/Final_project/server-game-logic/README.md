# SERVER GAME LOGIC app

## How to run?

* start app:
  * go to folder `/server-game-logic`
  * before you run it for the first time: run `npm install`
  * execute `node app`
  * find server ip in log
* start game master
    * go to folder `/components/game-master`
    * run server (e.g. `python -m SimpleHTTPServer 3000`)
    * open url `localhost:3000` in browser
* open player app in browser:
  * open URL: `<server ip>:8881/player` best case on mobile phone

* **Mock clients**:
* enable/disable dummy clients (if needed):
  * go to folder`/server-game-logic/frontend/demo-clients`
  * enable/disable dummy clients by commenting in or out the `<script>` tags inside the `index.html`
* open demo-clients app in browser (so watch console logs e.g.):
  * open URL: `<server ip>:8882/demo-clients`


## Development notes:

* `bundle.js` will be build automatically when server was started (`node app`)
* manually:
    * after adding new files to `/js` directory or editing existing run webpack build script
        * go to `/public/js/
        * run command `webpack`

## Client connection:

### Kinect

* connect: `io.connect('http://<serverIP>:8080/kinect');`
    * send to server:
        * `socket.emit('player-location-data')`
        * `socket.emit('player-footstep-data')`

### Game master

* connect: `io.connect('http://<serverIP>:8080/game-master');`
    * send to server:
        * collectable locations `socket.emit('collectable-location-data')`
        * `socket.emit('start')`
        * `socket.emit('stop')`
        * `socket.emit('pause')`
    * listen to server
        * `socket.on('updates')`

### Player (internal app)

* connect: `io.connect('http://<serverIP>:8080/player');`
    * send to server:
        * view directions `socket.emit('view-direction-data', data)`
        * registration event `socket.emit('player-registration', playerId);`
    * listen to server:
        * receive player's data updates `emit('updates', data)`
        * receive game events:
            * `socket.on('game-data', data)`
            * `socket.on('game-start')`
            * `socket.on('game-stop')`
            * `socket.on('game-pause')`
            * `socket.on('player-footsteps-positions')`
            * `socket.on('points-update', playerId)`
            * `socket.on('level-update')`


## Add levels

* add audio files to : `/server-game-logic/public/resources/audio/levelX/`
* create new collectable, ambient, foot step sound objects
    * files:
        * `collectableCollection.js`
        * `collectableSoundCollection.js`
        * `ambientSoundCollection.js`
        * `footstepSoundCollection.js`