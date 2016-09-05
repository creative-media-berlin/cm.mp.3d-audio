package de.sound.pipe;

import java.io.File;
import java.io.IOException;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.LineUnavailableException;
import javax.sound.sampled.Mixer;
import javax.sound.sampled.SourceDataLine;
import javax.sound.sampled.UnsupportedAudioFileException;

import com.jogamp.common.nio.ByteBufferInputStream;

// TODO: implement 3d sound
public class SoundPipe {

    private final int BUFFER_SIZE = 128000;
    private AudioInputStream audioStream;
    private SourceDataLine sourceLine;
    private int headsetId;
    
    public SoundPipe(int headsetId){
    	this.headsetId = headsetId;
    }

    public void playSound(String filename){
        audioStream = getAudioStream(filename);
        
        if (audioStream != null){
        	this.sourceLine = getSourceLine(audioStream);
            playSoundSample(audioStream, sourceLine);
        }
    }
    
    public void playSound(ByteBufferInputStream bis, int length){
    	AudioFormat format = new AudioFormat(44100, 16, 2, true, false);
        audioStream = new AudioInputStream(bis, format, length);
    	try {
    		audioStream = AudioSystem.getAudioInputStream(bis);
		} catch (UnsupportedAudioFileException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
//    	try {
//			audioStream = AudioSystem.getAudioInputStream(bis);
//		} catch (UnsupportedAudioFileException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		} catch (IOException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
        
        if (audioStream != null){
        	this.sourceLine = getSourceLine(audioStream);
            playSoundSample(audioStream, sourceLine);
        }
    }

    public void stopSound(){
        sourceLine.drain();
        sourceLine.close();
    }

	private SourceDataLine getSourceLine(AudioInputStream audioStream) {
		AudioFormat audioFormat = audioStream.getFormat();
		Mixer.Info[] mixerInfo = AudioSystem.getMixerInfo();
		// use mixer channel
		Mixer myMixer = AudioSystem.getMixer(mixerInfo[this.headsetId]);
		
		DataLine.Info info = new DataLine.Info(SourceDataLine.class, audioFormat);
		try {
			System.out.println("conntected to output device with id: " + this.headsetId);	
			SourceDataLine sourceLine = (SourceDataLine) myMixer.getLine(info);
		    sourceLine.open(audioFormat);
		    return sourceLine;
		} catch (LineUnavailableException e) {
		    e.printStackTrace();
		    System.exit(1);
		} catch (Exception e) {
		    e.printStackTrace();
		    System.exit(1);
		}
		return null;
	}

	private AudioInputStream getAudioStream(String strFilename) {
		try {
			File soundFile = new File(strFilename);
            if (soundFile != null){
            	AudioInputStream stream = AudioSystem.getAudioInputStream(soundFile);
            	return stream;
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
		return null;
	}
    
    private void playSoundSample(AudioInputStream audioStream, SourceDataLine sourceLine){
    	sourceLine.start();
        int nBytesRead = 0;
        byte[] abData = new byte[BUFFER_SIZE];
        while (nBytesRead != -1) {
        	try {
        		nBytesRead = audioStream.read(abData, 0, abData.length);
        	} catch (IOException e) {
        		e.printStackTrace();
        	}
        	if (nBytesRead >= 0) {
        		@SuppressWarnings("unused")
        		int nBytesWritten = sourceLine.write(abData, 0, nBytesRead);
        	}
        }

        sourceLine.drain();
        sourceLine.close();
    }
}