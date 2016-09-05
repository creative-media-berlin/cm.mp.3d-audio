package de.sound.example.threedimensionalsound;

import java.nio.ByteBuffer;

import com.jogamp.openal.AL;
import com.jogamp.openal.ALFactory;
import com.jogamp.openal.util.ALut;

public class OpenAL3DAudioTest {

	static AL al;
	// Maximum number of buffers we will need.
    static final int NUM_BUFFERS = 1;
    
    static final int SOUND_BUFFER_1 = 0;
    
    // Buffers hold sound data
    static int[] buffers = new int[NUM_BUFFERS];
    
    // Maximum emissions we will need.
    static final int NUM_SOURCES = 1;
    
    // Sources are points of emitting sound
    static int[] sources = new int[NUM_SOURCES];
   
    static final int SOUND_SOURCE_1 = 0;
	 
	// Source parameters
	static float[] sourcePos = { 0.0f, 1.0f, 0.0f };
	static float[] sourceVel = { 0.0f, 0.0f, 0.0f };
	
	// Position of the listener.
    static float[] listenerPos = { 0.0f, 1.0f, 0.0f };
    static float[] listenerVel = { 0.0f, 0.0f, 0.0f };
    // Orientation of the listener. (first 3 elements are "at", second 3 are "up")
    static float[] listenerOri = { 0.0f, 0.0f, 0.0f, 10.0f, 10.0f, 10.0f };
    
    
    public static void main(String[] args) {
        al = ALFactory.getAL();
        
        // Initialize OpenAL and clear the error bit

        ALut.alutInit();
        al.alGetError();
        
        if(loadALData() == AL.AL_FALSE) {
            System.exit(1);    
        }
        setListenerValues();
        
        al.alSourcePlay(sources[SOUND_SOURCE_1]);
        startRotatingSoundLoop();
    }
    
    static void setListenerValues() {
        al.alListenerfv(AL.AL_POSITION, listenerPos, 0);
        al.alListenerfv(AL.AL_VELOCITY, listenerVel, 0);
        al.alListenerfv(AL.AL_ORIENTATION, listenerOri, 0);
    }

    static int loadALData() {

        //variables to load into

        int[] format = new int[1];
        int[] size = new int[1];
        ByteBuffer[] data = new ByteBuffer[1];
        int[] freq = new int[1];
        int[] loop = new int[1];
        
        al.alGenBuffers(NUM_BUFFERS, buffers, 0);
        if (al.alGetError() != AL.AL_NO_ERROR) {
            return AL.AL_FALSE;
        }

        ALut.alutLoadWAVFile(
        	"./american_pie_bless_net.wav",
//          "./114390__dymewiz__footsteps-snow-sand-01.wav",
            format,
            data,
            size,
            freq,
            loop);
        
        al.alBufferData(
            buffers[SOUND_BUFFER_1],
            format[0],
            data[0],
            size[0],
            freq[0]);


        // bind buffers into audio sources
        al.alGenSources(NUM_SOURCES, sources, 0);

        al.alSourcei(sources[SOUND_SOURCE_1], AL.AL_BUFFER, buffers[SOUND_BUFFER_1]);
        al.alSourcef(sources[SOUND_SOURCE_1], AL.AL_PITCH, 1.0f);
        al.alSourcef(sources[SOUND_SOURCE_1], AL.AL_GAIN, 1.0f);
        al.alSourcefv(sources[SOUND_SOURCE_1], AL.AL_POSITION, sourcePos, 0);
        al.alSourcefv(sources[SOUND_SOURCE_1], AL.AL_VELOCITY, sourceVel, 0);
        al.alSourcei(sources[SOUND_SOURCE_1], AL.AL_LOOPING, AL.AL_TRUE);

        // do another error check and return
        if (al.alGetError() != AL.AL_NO_ERROR) {
            return AL.AL_FALSE;
        }

        return AL.AL_TRUE;
    }
    
    static void startRotatingSoundLoop(){
    	while(true) {
        	try {
    			Thread.sleep(100);
    		} catch (InterruptedException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    		}
            
            double theta = (System.currentTimeMillis()) % (Math.PI * 2);
            float  x = (float) (3.0f * Math.cos(theta)) ;
            float y = (float) (0.5 *  Math.sin(theta));
            float z = (float) (1.0 *  Math.sin(theta));
            float[] positions = { x, y, z };
            al.alSourcefv(sources[SOUND_SOURCE_1], AL.AL_POSITION, positions, 0);
        	System.out.println("position: "+ positions[0] +", "+ positions[1] +", "+ positions[2]);
    	}
    }
    
    static void startMovingSoundLoop(){
    	while(true) {
        	try {
    			Thread.sleep(100);
    		} catch (InterruptedException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    		}
    	
	    	listenerPos[0] += 0.1f;
	    	al.alListenerfv(AL.AL_POSITION, listenerPos, 0);
	    	sourcePos[0] += 1.0f;
	    	sourcePos[1] += 1.0f;
	    	al.alSourcefv(sources[SOUND_SOURCE_1], AL.AL_POSITION, sourcePos, 0);
	    	System.out.println("position: "+ sourcePos[0] +", "+ sourcePos[1] +", "+ sourcePos[2]);
	    	
	    	
	    	
    	}    
    } 
}
