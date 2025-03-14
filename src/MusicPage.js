// src/MusicPage.js
import React, { useState, useRef, useEffect } from 'react';
// Import both audio files
import audioBase64 from './music/audioBase64.js';
import audioBase64_2 from './music/audioBase64-2.js';

const MusicPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioSources, setAudioSources] = useState([]);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  
  // Define your tracks with placeholder titles and artists
  // You'll associate these with the loaded audio sources
  const tracks = [
    { title: "Song Name 1", artist: "Artist 1", src: "" },
    { title: "Song Name 2", artist: "Artist 2", src: "" }
  ];

  useEffect(() => {
    // Process both audio files and create blob URLs
    const processedSources = [];
    
    // Process first audio file
    if (audioBase64) {
      try {
        const audioBlob1 = base64ToBlob(audioBase64, 'audio/mpeg');
        const audioUrl1 = URL.createObjectURL(audioBlob1);
        processedSources.push(audioUrl1);
        console.log("First audio file loaded successfully");
      } catch (e) {
        console.error("Error processing first audio file:", e);
        setError(`Failed to decode first audio: ${e.message}`);
      }
    }
    
    // Process second audio file
    if (audioBase64_2) {
      try {
        const audioBlob2 = base64ToBlob(audioBase64_2, 'audio/mpeg');
        const audioUrl2 = URL.createObjectURL(audioBlob2);
        processedSources.push(audioUrl2);
        console.log("Second audio file loaded successfully");
      } catch (e) {
        console.error("Error processing second audio file:", e);
        setError(`Failed to decode second audio: ${e.message}`);
      }
    }
    
    // Update the tracks with the processed audio sources
    const updatedTracks = tracks.map((track, index) => {
      return {
        ...track,
        src: processedSources[index] || ""
      };
    });
    
    // Update state with processed sources
    setAudioSources(processedSources);
    
    // Load the first track
    if (processedSources.length > 0) {
      const audio = new Audio(processedSources[0]);
      audioRef.current = audio;
      console.log("Initial audio loaded");
    } else {
      setError("No audio files were successfully loaded");
    }
    
    // Clean up function to revoke object URLs when component unmounts
    return () => {
      processedSources.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);
  
  // Helper function to convert Base64 to Blob with error handling
  const base64ToBlob = (base64, mimeType) => {
    try {
      // Remove any potential data URL prefix if present
      const base64Data = base64.includes('base64,') 
        ? base64.split('base64,')[1] 
        : base64;
        
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i += 512) {
        const slice = byteCharacters.slice(i, i + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      return new Blob(byteArrays, { type: mimeType });
    } catch (e) {
      console.error("Error in base64ToBlob:", e);
      throw e; // Re-throw to be caught by the caller
    }
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.addEventListener('error', (e) => {
        console.error("Audio element error:", e);
        //setError(`Audio playback error: ${e.target.error?.message || 'Unknown error'}`);
      });
      audio.volume = volume;
    }
    
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('error', () => {});
      }
    };
  }, [currentTrack, volume]);
  
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const togglePlay = () => {
    if (!audioRef.current) {
      setError("Audio not loaded yet");
      return;
    }
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play()
          .catch(e => {
            console.error("Play error:", e);
            setError(`Couldn't play audio: ${e.message}`);
          });
      }
      setIsPlaying(!isPlaying);
    } catch (e) {
      console.error("Toggle play error:", e);
      setError(`Error controlling playback: ${e.message}`);
    }
  };
  
  const playTrack = (index) => {
    // Check if the track exists and has a valid source
    if (!tracks[index] || !audioSources[index]) {
      setError(`Track ${index + 1} is not available`);
      return;
    }
    
    // Stop current audio if it's playing
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Create a new Audio object for the selected track
    const newAudio = new Audio(audioSources[index]);
    newAudio.volume = volume;
    audioRef.current = newAudio;
    
    // Set up event listeners for the new audio
    newAudio.addEventListener('timeupdate', updateProgress);
    newAudio.addEventListener('loadedmetadata', () => {
      setDuration(newAudio.duration);
    });
    newAudio.addEventListener('ended', () => {
      nextTrack();
    });
    
    // Update state and play
    setCurrentTrack(index);
    setCurrentTime(0);
    setIsPlaying(true);
    
    // Play with a small delay to ensure the audio is ready
    setTimeout(() => {
      try {
        newAudio.play()
          .catch(e => {
            console.error("Play track error:", e);
            setError(`Couldn't play track: ${e.message}`);
            setIsPlaying(false);
          });
      } catch (e) {
        console.error("Error in playTrack:", e);
        setError(`Error playing track: ${e.message}`);
        setIsPlaying(false);
      }
    }, 100);
  };
  
  const nextTrack = () => {
    const next = (currentTrack + 1) % tracks.length;
    playTrack(next);
  };
  
  const prevTrack = () => {
    const prev = (currentTrack - 1 + tracks.length) % tracks.length;
    playTrack(prev);
  };
  
  const handleVolumeChange = (e) => {
    if (!audioRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };
  
  const handleSeek = (e) => {
    if (!audioRef.current) return;
    
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    audioRef.current.currentTime = seekTime;
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="container mt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto"}}>
      <div className="p-3 bg-tertiary shadow">
        <div className="bg-secondary m-3 p-5 shadow">
          <h1 className="text-accent mb-4">My Music</h1>
          
          {/* Display any errors */}
          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              {error}
            </div>
          )}
          
          {/* Current Track Info */}
          <div className="current-track bg-tertiary p-4 rounded mb-4">
            <div className="row align-items-center">
              <div className="col-md-4">
                <div className="album-art bg-primary" style={{
                  height: "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px"
                }}>
                  <div className="text-tertiary">
                    {isPlaying ? 
                      <div className="playing-animation">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                      </div> : 
                      <span style={{fontSize: "48px"}}>🎵</span>
                    }
                  </div>
                </div>
              </div>
              
              <div className="col-md-8">
                <h2 className="text-accent">{tracks[currentTrack]?.title || "No Track Selected"}</h2>
                <h5 className="text-primary mb-4">{tracks[currentTrack]?.artist || ""}</h5>
                
                <div className="controls mb-3">
                  <button onClick={prevTrack} className="btn btn-primary me-2" disabled={!audioSources.length}>
                    <span style={{fontSize: "1.2rem"}}>⏮️</span>
                  </button>
                  <button onClick={togglePlay} className="btn btn-primary me-2" style={{width: "50px", height: "50px"}} disabled={!audioSources.length}>
                    <span style={{fontSize: "1.5rem"}}>{isPlaying ? '❚❚' : '▶'}</span>
                  </button>
                  <button onClick={nextTrack} className="btn btn-primary" disabled={!audioSources.length}>
                    <span style={{fontSize: "1.2rem"}}>⏭️</span>
                  </button>
                </div>
                
                <div className="progress-container mb-3">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="form-range"
                    disabled={!audioSources.length}
                  />
                  <div className="d-flex justify-content-between">
                    <small>{formatTime(currentTime)}</small>
                    <small>{formatTime(duration)}</small>
                  </div>
                </div>
                
                <div className="volume-control d-flex align-items-center">
                  <span className="me-2">🔈</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="form-range"
                    style={{width: "100px"}}
                    disabled={!audioSources.length}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Playlist */}
          <div className="playlist bg-tertiary p-4 rounded">
            <h3 className="text-accent mb-3">Playlist</h3>
            <div className="list-group">
              {tracks.map((track, index) => (
                <button
                  key={index}
                  onClick={() => playTrack(index)}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${currentTrack === index ? 'active bg-primary' : ''}`}
                  disabled={!audioSources[index]}
                >
                  <div>
                    <div className={currentTrack === index ? 'text-tertiary' : 'text-accent'}>
                      {track.title}
                    </div>
                    <small className={currentTrack === index ? 'text-tertiary' : 'text-primary'}>
                      {track.artist}
                    </small>
                  </div>
                  {currentTrack === index && isPlaying && (
                    <span className="badge bg-tertiary text-primary">
                      Playing
                    </span>
                  )}
                  {!audioSources[index] && (
                    <span className="badge bg-danger">
                      Unavailable
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for the playing animation */}
      <style jsx>{`
        .playing-animation {
          display: flex;
          align-items: flex-end;
          height: 40px;
        }
        
        .bar {
          width: 6px;
          margin: 0 2px;
          background-color: var(--bs-tertiary);
          animation: sound 0ms -800ms linear infinite alternate;
        }
        
        .bar:nth-child(1) { height: 15px; animation-duration: 474ms; }
        .bar:nth-child(2) { height: 25px; animation-duration: 433ms; }
        .bar:nth-child(3) { height: 35px; animation-duration: 407ms; }
        .bar:nth-child(4) { height: 25px; animation-duration: 458ms; }
        .bar:nth-child(5) { height: 15px; animation-duration: 400ms; }
        
        @keyframes sound {
          0% { height: 5px; }
          100% { height: 40px; }
        }
      `}</style>
    </div>
  );
};

export default MusicPage;