package de.sound.example;

import java.io.File;
import java.io.IOException;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.LineUnavailableException;
import javax.sound.sampled.Mixer;
import javax.sound.sampled.SourceDataLine;

public class SoundPipe {

    private final int BUFFER_SIZE = 128000;
    private File soundFile;
    private AudioInputStream audioStream;
    private AudioFormat audioFormat;
    private SourceDataLine sourceLine;
    private int headsetId;
    
    public SoundPipe(int headsetId){
    	this.headsetId = headsetId;
    }

    /**
     * @param filename the name of the file that is going to be played
     */
    public void playSound(String filename){

        String strFilename = filename;

        try {
            soundFile = new File(strFilename);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }

        try {
            audioStream = AudioSystem.getAudioInputStream(soundFile);
        } catch (Exception e){
            e.printStackTrace();
            System.exit(1);
        }

        audioFormat = audioStream.getFormat();
        Mixer.Info[] mixerInfo = AudioSystem.getMixerInfo();
        // use mixer channel
        Mixer myMixer = AudioSystem.getMixer(mixerInfo[this.headsetId]);
        
        DataLine.Info info = new DataLine.Info(SourceDataLine.class, audioFormat);
        try {
        	System.out.println("conntected to output device with id: " + this.headsetId);	
            sourceLine = (SourceDataLine) myMixer.getLine(info);
            sourceLine.open(audioFormat);
        } catch (LineUnavailableException e) {
            e.printStackTrace();
            System.exit(1);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }

        playSoundSample(audioStream, sourceLine);
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