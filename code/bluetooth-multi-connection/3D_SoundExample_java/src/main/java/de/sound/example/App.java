package de.sound.example;

import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.Mixer;

public class App {
	public static void main(String[] args) {
        Mixer.Info[] info = AudioSystem.getMixerInfo();
        int i =0;
        for(Mixer.Info print : info){

            System.out.println("Name: "+ i + " " + print.getName());
            i++;
        }
        
        int headsetId = Integer.parseInt(args[0]);
        
        SoundPipe player = new SoundPipe(headsetId);
        player.playSound("194204__pulswelle__steady-rain.wav");
    }
}
