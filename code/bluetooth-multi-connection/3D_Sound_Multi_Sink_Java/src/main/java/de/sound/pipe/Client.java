package de.sound.pipe;

import java.io.InputStream;
import java.net.Socket;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class Client implements Runnable {
	private boolean listening = true;
	private Thread t;
	private Player player;
	// socket for connection to chat server
    private Socket socket;
    private InputStream in;	
    private int headsetId;
	
	public Client(String host, int port, int headsetId){
		this.headsetId = headsetId;
        // connect to server
        try {
        	socket = new Socket(host, port);
        } catch (Exception ex) { 
        	ex.printStackTrace(); 
        }
	}
	

    // listen to socket and print everything that server broadcasts
    private void listen(Socket socket) {
    	while(listening){
	    	// connect to server
	        try {
	            in = socket.getInputStream();
	            JSONParser jsonParser = new JSONParser();
	//            JSONObject jsonObject = (JSONObject)jsonParser.parse(new InputStreamReader(in, "UTF-8"));
	            startSound(0,0,0);
	
	        } catch (Exception ex) { 
	        	ex.printStackTrace(); 
	        	System.exit (1);
	        }
	        
	        try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
    	}
    }
	
	
	private void stopListening(){
		listening = false;
		t.destroy();
	}
	
	private void stopPlaying(){
		if(player != null) player.stop();
	}

	private void startSound(int x, int y, int z) {	    
		System.out.println("Start sound for headset: " + headsetId + " at " + headsetId);
	    String fileName1 = "114390__dymewiz__footsteps-snow-sand-01.wav";
//	    String fileName1 = "footsteps_sand_mono.wav";
	    player = new Player(headsetId, fileName1);
	    player.playSoundAt(x, y, z);
	}


	public void run() {
		System.out.println("Start listening for headset: " + headsetId);
    	listen(socket);
	}
}