## Intro

This page describes the location tracking component of our sound environment. It consists of two components: 
1. Kinect client, written in C#, running on VisualStudio
2. Kinect server, written in JavaScript, running on Node.Js

In our setup there are two KinectOne sensor, connected to one Laptop each, running on Windows. Due to limitations of the KinectOne USB3.0 connection it is not possible to connect 2x sensors to one Laptop. Hence we had to come up with an idea how to merge 2x location data streams coming from 2x laptops and merge them together into one big playground. For purposes of our game idea and to raise the complexity we wanted also to be able to track 2x Players in that big playground. To be always certain which player is "Player 1" and which play is "Player 2", even when the move out of sight from one or both of the Kinect sensors   was one of the challenges of this algorithm. 

## Merge Algorithm 

Here is a simplified version of the algorithm with is used to calculate the player position based on location data from Kinect1 and Kinect2:

````javascript
var server = ws.createServer(function (conn) {
		// When a kinect client sends data
	conn.on("text", function (incomingString) {
		if (conn.path == "/k1") {
			//... parse string into javascript object and save it to kinectData
		} else if (conn.path == "/k2") {
			//... parse string into javascript object and save it to kinectData
		}		
	
		// initialization runs for each Kinect separately and is complete when 2 Players are found in each Kinect
        // when timeout is over, initialization runs only with 1 Player for each Kinect
		initializePlayerMap()

		// the calculation only runs when init for both Kinects is complete (only 1 Kinect will not work)
		// fill verifiedKinectData object
		assignDataToPlayerIds()

		// if one of the verified data slots is empty, try a remap
		if (K1.rawData1 == null || K1.rawData2 == null || K2.rawData1 == null || K2.rawData2 == null) {
			remapPlayerIDs()
			assignDataToPlayerIds() // fill verifiedKinectData object again
		}
		
		// player-1 location calculation + format which is sent to the main server
		resultPlayer1 = calcPos(verifiedKinectData.kinect1.rawData1, verifiedKinectData.kinect2.rawData1)
		if (resultPlayer1) {
			playerLocations.push()
		}
		
		// player-2 location calculation + format which is sent to the main server
		resultPlayer2 = calcPos(verifiedKinectData.kinect1.rawData2, verifiedKinectData.kinect2.rawData2)
		if (resultPlayer2) {
			playerLocations.push()
		}		

		// dead end of the algorithm:
		// when in 2-Player mode one Player is already lost and the second Player gets lost too
		if (resultPlayer1 == undefined && resultPlayer2 == undefined) {
			console.log("Both Players lost!!! Restart required ")
		}
	}

	// sending the calculated result to the main server
	if (mainServerConnected) {
		kinectLocationsClientSocket.emit('kinect-location-data', playerLocations)
	}
}

````

Whenever we receive a new JSON object from one Kinect sensor, it gets parsed into a javascript object and stored into kinectData, which holds all the incoming raw data. When new data arrives, we wait until we have data from both Kinect sensors with both Players. So we need Player 1 and 2 in Kinect1 and Player1 and 2 in Kinect2, in total 4 Player data sets. Each data sets has a **BodyID** provided by the Kinect SDK. The algorithm stores and compares those BodyID's against each other to be certain that Player-1 in Kinect1 is also Player-1 in Kinect2. 

Initially both Player have to stand in middle of our playground, one player stand more left and one player stands more right in the **field of view of Kinect1**.  The left player is defined to be "Player-1" and the right is defined as "Player-2". The BodyID's for those data sets get initially stored inside the playerMap object.

After the init process each new incoming data object is checked whether the BodyID of that data set is known or unknown from the playerMap. If it is known the raw data set is to the verified data object. This step is nessesary since in the raw data which the Kinect sends it is possible that the data for Player1 is actually in raw data on position 2. So they need to switched for the verified data object, which is used to run the calculation. The filling of this verifiedData object happens in the assignDataToPlayerIds() function. 

The real challenge begins when players start to move around and get lost from the vew/tracking for one Kinect. If that happens the player get re-detected by the Kinect sensor and it gets assigned a new BodyID by the Kinect SDK. To know which player the new BodyID belongs to, we have to compare it with the still known player and it's BodyID inside the remapPlayerIDs() function. For example if know player2 in Kinect1 is still known and a new BodyID appears, we know that this raw data set must belong to Player1 and the playerMap for Player1 can therefore be updated. After we updated the playerMap it is necessary to copy the verified data once again, since the unknown player data didn't get copied to verifiedData. 

Now that we have all the needed data inside the verifiedData we can calculate the player position. The position is put into a certain format, which the main server expects and is finally send to the main server via emit. 

## Calculation algorithm

The calculation function takes both data sets from Kinect1 and Kinect2 for one specific Player to calculate the player position. If the player is recognized by both Kinect sensors there are two data sets, the data from the Kinect which is more close to the player position is used (Z-axis value). The more common case in our big playground is, that one player is detected only by one Kinect and therefore this data set is used. 

To calculate the X position value we use a Isosceles triangle formula with the following input values: 
-  height: half of our playground, max 4,5m 
- vertex angle: field of view of the Kinect Sensor, ideal: 70°

Calculation instructions can be found here:

 http://keisan.casio.com/exec/system/1273850202

Since the Kinect SDK uses an absolute coordinate system with values in meters, we had to convert the X- and Z-axis values into a relativ coordinate system with values between 0 and 1. 




````javascript
function calcPos(rawDataKinect1, rawDataKinect2) {
	var calcX, deltaZ

	if (rawDataKinect1 == null && rawDataKinect2 == null) {
		console.log("tried to run calcPos with no Player-Data")
	} else {
		// kinect 1
		if ((rawDataKinect2 == null && rawDataKinect1 != null) || (rawDataKinect1 != null && rawDataKinect2 != null && rawDataKinect1.z < rawDataKinect2.z)) {
			calcX = (rawDataKinect1.x - (width / 2)) * -1
			return {
				Kinect: 1,
				hipPosition: {
					x: Number((calcX / width).toFixed(5)),
					y: Number(rawDataKinect1.y.toFixed(5)),
					z: Number((rawDataKinect1.z / maxZ).toFixed(5))
				}
			};
			// kinect 2
		} else if (rawDataKinect2 != null) {
			calcX = rawDataKinect2.x - (width/(-2))
			deltaZ = maxZ - rawDataKinect2.z
			return {
				Kinect: 2,
				hipPosition: {
					x: Number((calcX / width).toFixed(5)),
					y: Number(rawDataKinect2.y.toFixed(5)),
					z: Number((deltaZ / maxZ).toFixed(5))
				}
			};
		}
	}
}

````

A more detailed description can be found as inline comments in the code:
