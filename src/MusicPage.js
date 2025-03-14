// src/MusicPage.js
import React, { useState, useRef, useEffect } from 'react';
import audioFile from './music/forever-live-sessions-vol-2-hq.mp3';

const MusicPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef(null);
  
  // Define your tracks
  const tracks = [
    { 
      title: "Forever Live Sessions Vol 2", 
      artist: "Artist Name", 
      src: audioFile // Use the imported file
    }
    // Add more tracks if needed
  ];
  
  // Play function that handles the audio
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Create a new Audio object and play it
      audioRef.current = new Audio(tracks[currentTrack].src);
      
      // Handle the Promise returned by play()
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Playback failed:", error);
            // Handle playback error
          });
      }
    }
  };
  
  return (
    <div className="container mt-5">
      <div className="p-3 bg-tertiary shadow">
        <div className="bg-secondary m-3 p-5 shadow">
          <h1 className="text-accent mb-4">My Music</h1>
          
          <div className="player-controls">
            <button 
              onClick={togglePlay}
              className="btn btn-primary"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <div className="mt-3">
              Now playing: {tracks[currentTrack].title} by {tracks[currentTrack].artist}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPage;