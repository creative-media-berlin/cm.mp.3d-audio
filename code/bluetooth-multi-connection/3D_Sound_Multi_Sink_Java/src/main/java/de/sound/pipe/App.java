package de.sound.pipe;

import java.util.LinkedList;

import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.Mixer;

public class App {
	public static void main(String[] args) {
//		LinkedList<Integer> headsets = getListOfHeadsets();
//		while(headsets.size() > 0){
//			int id = headsets.pop();
//			new Thread(new Client("localhost", 5000, id), "client "+ id).start();
			int id = Integer.parseInt(args[0]); 
			new Thread(new Client("localhost", 5000, id), "client "+ id).start();
//		}        
    }
	
	private static LinkedList<Integer> getListOfHeadsets(){
		LinkedList<Integer> headsets = new LinkedList<Integer>();
		LinkedList<String> names = new LinkedList<String>();
		
		Mixer.Info[] info = AudioSystem.getMixerInfo();
        int headsetId = 0;
        System.out.println("Available devices: ");
        for(Mixer.Info print : info){
        	String name = print.getName();
        	System.out.println("Name: " + print.getName() + " "  + headsetId);
        	if( !names.contains(name) && !name.contains("Port")){
//        		System.out.println("new headset!! " + name);
        		names.add(name);
        		headsets.add(new Integer(headsetId));
        	}
        	headsetId++;
        }
        return headsets;
	}
}
