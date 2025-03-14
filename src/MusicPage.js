// src/MusicPage.js
import React, { useState, useRef, useEffect } from 'react';
// Import the audio file
import audioBase64 from './music/audioBase64.js';

const MusicPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioSource, setAudioSource] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  
  // Define your tracks
  const tracks = [
    { title: "Song Name 1", artist: "Artist 1", src: "" },
  ];

  useEffect(() => {
    // Set loading state while we process the audio
    setLoading(true);
    setError(null);
    
    try {
      console.log("Processing audio data...");
      
      // Try a different approach - using a data URL directly
      const base64Data = audioBase64.trim(); // trim any whitespace
      
      // Log the first and last few characters to debug
      console.log("First 20 chars:", base64Data.substring(0, 20));
      console.log("Last 20 chars:", base64Data.substring(base64Data.length - 20));
      
      // Create a data URL
      const dataUrl = `data:audio/mpeg;base64,${base64Data}`;
      
      // Set the audio source directly to the data URL instead of creating a blob
      setAudioSource(dataUrl);
      
      // Create the audio element
      const audio = new Audio();
      audio.src = dataUrl;
      audioRef.current = audio;
      
      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        console.log("Audio metadata loaded, duration:", audio.duration);
        setDuration(audio.duration);
        setLoading(false);
      });
      
      audio.addEventListener('error', (e) => {
        console.error("Audio loading error:", e);
        // Get more detailed error information
        const errorDetails = audio.error ? 
          `Code: ${audio.error.code}, Message: ${audio.error.message}` : 
          'Unknown error';
        setError(`Failed to load audio: ${errorDetails}`);
        setLoading(false);
      });
      
      console.log("Audio setup complete");
    } catch (e) {
      console.error("Error setting up audio:", e);
      setError(`Error setting up audio: ${e.message}`);
      setLoading(false);
    }
    
    // Clean up function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      audio.volume = volume;
    }
    
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, [volume]);
  
  const updateProgress = () => {
    setCurrentTime(audioRef.current.currentTime);
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
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Play error:", e);
            setError(`Couldn't play audio: ${e.message}`);
          });
        }
      }
      setIsPlaying(!isPlaying);
    } catch (e) {
      console.error("Toggle play error:", e);
      setError(`Error controlling playback: ${e.message}`);
    }
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
          
          {/* Loading indicator */}
          {loading && (
            <div className="alert alert-info mb-4" role="alert">
              Loading audio... Please wait.
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
                <h2 className="text-accent">{tracks[currentTrack].title}</h2>
                <h5 className="text-primary mb-4">{tracks[currentTrack].artist}</h5>
                
                <div className="controls mb-3">
                  <button onClick={togglePlay} className="btn btn-primary me-2" style={{width: "50px", height: "50px"}} disabled={loading || !!error}>
                    <span style={{fontSize: "1.5rem"}}>{isPlaying ? '❚❚' : '▶'}</span>
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
                    disabled={loading || !!error}
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
                    disabled={loading || !!error}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for the playing animation - using regular style tag */}
      <style>
        {`
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
        `}
      </style>
    </div>
  );
};

export default MusicPage;