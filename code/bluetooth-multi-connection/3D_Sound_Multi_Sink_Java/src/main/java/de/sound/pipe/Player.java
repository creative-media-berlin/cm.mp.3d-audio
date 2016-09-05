package de.sound.pipe;

class Player {
   private int headsetId;
   private String fileName;
   private SoundPipe pipe;
   
   Player(int headsetId, String fileName){
	   this.headsetId = headsetId;
	   this.fileName = fileName;
	   this.pipe = new SoundPipe(headsetId);
       System.out.println("Creating player for headset: " +  headsetId );
   }
   
   public void playSoundAt(int x, int y, int z) {
	   if(pipe != null) {
		   pipe.playSound(fileName);
		   System.out.println("Running " +  headsetId );
	   }
	   updatePosition(x, y, z);
   }
  
   public void updatePosition(int x, int y, int z) {
	   // TODO: update position
	   System.out.println("Update position to " +  x + "/" + y + "/" + z);
   }

   public void stop(){
      pipe.stopSound();
   }
}