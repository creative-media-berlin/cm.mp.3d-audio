package de.sound.example;

import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.Mixer;

public class ConcurrentApp {

	public static void main(String[] args) {
	    Mixer.Info[] info = AudioSystem.getMixerInfo();
	    int i =0;
	    for(Mixer.Info print : info){
	
	        System.out.println("Name: "+ i + " " + print.getName());
	        i++;
	    }
	    
	    String fileName1 = "114390__dymewiz__footsteps-snow-sand-01.wav";
	    String fileName2 = "194204__pulswelle__steady-rain.wav";
        
	    SoundRunnable SA = new SoundRunnable(2, fileName1);
	    SoundRunnable SB = new SoundRunnable(4, fileName2);
		
	    SA.start();
	    SB.start();
	}
}

class SoundRunnable implements Runnable {
   private Thread t;
   private int headsetId;
   private String fileName;
   
   SoundRunnable(int headsetId, String fileName){
	   this.headsetId = headsetId;
	   this.fileName = fileName;
       System.out.println("Creating thread for headset: " +  headsetId );
   }
   
   public void run() {
	   System.out.println("Running " +  headsetId );
	   SoundPipe pipe = new SoundPipe(headsetId);
	   pipe.playSound(fileName);
	   System.out.println("Thread for headset " +  headsetId + " exiting.");
   }
   
   public void start ()
   {
      System.out.println("Starting " +  headsetId );
      if (t == null)
      {
         t = new Thread (this, ""+headsetId);
         t.start ();
      }
   }
}