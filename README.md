Headio
=======

```
This project is the result of a two semester Master-Program course at the HTW Berlin. We developed a game that allows the users to jump into an imaginary world. The world is based on a manipulated 3D sound environment which could be a setting of a forest or a beach, for example. Headphones with attached mobile phones are used to feed the player with 3D sound, calculated directly in the phone's browser via the Web Audio API. The user relies on his sense of hearing to orientate through the scene. In addition to the ambient sound, we will introduce moving items, which can be distinguished by a remarkable sound. Their function is to be caught or collected by the player or even by one of the player in a multiplayer game. 

In a single player game the player wins when he collects a specific amount of those items, whereas in a multi player version the game ends after all items are collected and the player with the most collected items wins.

The all over purpose of this project is the creation of a pure audio base experience, far away from the ordinary way to interact via a visual interface.  

Additionally we introduced a Game-Master, who can see the overall playground with all collectable and ambient sounds. His purpose is to the overview the entire game and to start and stop a round. But more importantly he has also the ability to move the collectable sounds inside the 3D sound space via the Leap Motion Interface. 
```


This project mainly consists of the following.

1. The [Main server](https://github.com/creative-media-berlin/cm.mp.3d-audio/tree/master/server-game-logic) manages the data of all components and contains all of the game logic.
2. The [Game-Master component](https://github.com/creative-media-berlin/cm.mp.3d-audio/tree/master/components/game-master) renders a visual image of the scene and allows certain interaction with the game.
3. The [Location tracker component](https://github.com/creative-media-berlin/cm.mp.3d-audio/tree/master/components/location-tracker) tracks both of the players in the playground using two Microsoft Kinect devices and sends location data to the main server.
4. The [Client application](https://github.com/creative-media-berlin/cm.mp.3d-audio/tree/master/server-game-logic/frontend/player) runs on the players smartphone device, tracks the players view direction and calculates the sounds from the server data.


The [Wiki section](https://github.com/creative-media-berlin/cm.mp.3d-audio/wiki) reflects the teams research and testing results.