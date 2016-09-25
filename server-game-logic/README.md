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



# Client Server app

* includes Sound app 

* [How to identify a player?](#how-to-identify-a-player)
    *  [From Kinect](#from-kinect)
    *  [From server side - registration on mobile](#from-server-side-registration-on-mobile)

-----

## How to identify a player?

### From Kinect

* player (`bodyId`) standing left is mapped to player 1
* player (`bodyId`) standing right is mapped to player 2

### From server side - registration on mobile

> :zap: Being able to connect to server as a player and mapping to a unique player id on Kinect and server side

> :paperclip: [commit](https://gitlab.cm.htw-berlin.de/studentenprojekte/mp-interactive-sound-environment/commit/5a2b00d09a60335984236dd0ab086a577b80f3d8)

* goal: user on mobile can click a button to register as player 1 or 2
* player 1 has to stand left and player 2 right (that mapping with kinect works)

 ![Screen_Shot_2016-06-12_at_16.55.06](https://github.com/creative-media-berlin/cm.mp.3d-audio/wiki/Images/server/image1.png)

*  when player 1 presses `player 1` button the server will create a new player and add it to the collection. The socket will be stores as property of the player

![Screen_Shot_2016-06-12_at_16.47.26](https://github.com/creative-media-berlin/cm.mp.3d-audio/wiki/Images/server/image2.png)

* same for player 2

![Screen_Shot_2016-06-12_at_16.47.49](https://github.com/creative-media-berlin/cm.mp.3d-audio/wiki/Images/server/image3.png)

* when a player attempts to register again (e.g. due to network interruption) the new socket will be added to the existing player instance

![Screen_Shot_2016-06-12_at_16.48.17](https://github.com/creative-media-berlin/cm.mp.3d-audio/wiki/Images/server/image4.png)

![Screen_Shot_2016-06-12_at_16.48.06](https://github.com/creative-media-berlin/cm.mp.3d-audio/wiki/Images/server/image5.png)


* to disable the option that a player can register for both player ids the button of the second player gets disabled after player felt a decision

![Screen_Shot_2016-06-12_at_17.18.12](https://github.com/creative-media-berlin/cm.mp.3d-audio/wiki/Images/server/image6.png)

* player mobile interface:

![Photo_Jun_12__18_43_25](https://github.com/creative-media-berlin/cm.mp.3d-audio/wiki/Images/server/image7.png)![Photo_Jun_12__18_43_17](https://github.com/creative-media-berlin/cm.mp.3d-audio/wiki/Images/server/image8.png)
