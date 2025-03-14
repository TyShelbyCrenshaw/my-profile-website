// src/MusicPage.js
import React, { useState, useRef, useEffect } from 'react';
// Import all processed audio files
import audioFiles from './music/audioIndex';
// Import track metadata
import trackInfo from './music/trackInfo';

const MusicPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioSource, setAudioSource] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [tracks, setTracks] = useState([]);
  const audioRef = useRef(null);
  
  // Initialize tracks
  useEffect(() => {
    try {
      // Combine track info with audio data
      const tracksWithAudio = trackInfo.map(track => ({
        ...track,
        audioData: audioFiles[track.id]
      }));
      
      setTracks(tracksWithAudio);
      console.log(`Loaded ${tracksWithAudio.length} tracks`);
    } catch (e) {
      console.error("Error initializing tracks:", e);
      setError(`Failed to load tracks: ${e.message}`);
    }
  }, []);

  // Load the selected track
  const loadTrack = (trackIndex) => {
    if (!tracks || tracks.length === 0 || trackIndex >= tracks.length) {
      setError("No tracks available");
      return;
    }
    
    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    
    try {
      console.log(`Loading track: ${tracks[trackIndex].title}`);
      const trackData = tracks[trackIndex];
      
      // Set a small timeout to allow UI to update and show loading state
      setTimeout(() => {
        try {
          // Process the audio data
          const base64Data = trackData.audioData.trim();
          setLoadingProgress(30);
          
          // Log the first and last few characters to debug
          console.log("First 20 chars:", base64Data.substring(0, 20));
          console.log("Last 20 chars:", base64Data.substring(base64Data.length - 20));
          
          // Create a data URL
          const dataUrl = `data:audio/mpeg;base64,${base64Data}`;
          setLoadingProgress(60);
          
          // Set the audio source
          setAudioSource(dataUrl);
          
          // Pause current audio if playing
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
          
          // Create a new audio element
          const audio = new Audio();
          
          // Set up event listeners before setting source
          audio.addEventListener('loadedmetadata', () => {
            console.log("Audio metadata loaded, duration:", audio.duration);
            setDuration(audio.duration);
            setLoading(false);
            setLoadingProgress(100);
          });
          
          audio.addEventListener('error', (e) => {
            console.error("Audio loading error:", e);
            const errorDetails = audio.error ? 
              `Code: ${audio.error.code}, Message: ${audio.error.message}` : 
              'Unknown error';
            setError(`Failed to load audio: ${errorDetails}`);
            setLoading(false);
          });
          
          audio.addEventListener('ended', () => {
            setIsPlaying(false);
            
            // Auto play next track option
            // if (currentTrack < tracks.length - 1) {
            //   changeTrack(currentTrack + 1);
            // }
          });
          
          // Set the source
          audio.src = dataUrl;
          audioRef.current = audio;
          
          console.log("Audio setup complete");
          
          // Update current track
          setCurrentTrack(trackIndex);
          setLoadingProgress(80);
        } catch (e) {
          console.error("Error processing audio data:", e);
          setError(`Error processing audio data: ${e.message}`);
          setLoading(false);
        }
      }, 100);
    } catch (e) {
      console.error("Error setting up audio:", e);
      setError(`Error setting up audio: ${e.message}`);
      setLoading(false);
    }
  };

  // Initial track load when tracks are available
  useEffect(() => {
    if (tracks && tracks.length > 0) {
      loadTrack(0);
    }
    
    // Clean up function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [tracks]);
  
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
  
  // Change track handler
  const changeTrack = (index) => {
    if (index === currentTrack && !loading) {
      togglePlay();
    } else {
      loadTrack(index);
    }
  };
  
  // Previous and Next track handlers
  const playPrevious = () => {
    if (tracks.length <= 1) return;
    const newIndex = (currentTrack - 1 + tracks.length) % tracks.length;
    changeTrack(newIndex);
  };
  
  const playNext = () => {
    if (tracks.length <= 1) return;
    const newIndex = (currentTrack + 1) % tracks.length;
    changeTrack(newIndex);
  };
  
  return (
    <div className="container mt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto"}}>
      <div className="p-3 bg-tertiary shadow">
        <div className="bg-secondary m-3 p-5 shadow">
          <h1 className="text-accent mb-4">My Music Player</h1>
          
          {/* Display any errors */}
          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              {error}
            </div>
          )}
          
          {/* Message when no tracks are available */}
          {(!tracks || tracks.length === 0) && !loading && !error && (
            <div className="alert alert-warning mb-4" role="alert">
              No audio tracks found. Please add MP3 files to your music directory and run the processor.
            </div>
          )}
          
          {/* Loading indicator with progress */}
          {loading && (
            <div className="alert alert-info mb-4" role="alert">
              <div>Loading audio... Please wait.</div>
              <div className="progress mt-2" style={{ height: "10px" }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${loadingProgress}%` }} 
                  aria-valuenow={loadingProgress} 
                  aria-valuemin="0" 
                  aria-valuemax="100">
                </div>
              </div>
            </div>
          )}
          
          {/* Current Track Info */}
          {tracks && tracks.length > 0 && (
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
                  <h2 className="text-accent">{tracks[currentTrack]?.title || "Unknown Track"}</h2>
                  <h5 className="text-primary mb-4">{tracks[currentTrack]?.artist || "Unknown Artist"}</h5>
                  
                  <div className="controls mb-3 d-flex">
                    <button onClick={playPrevious} className="btn btn-secondary me-2" style={{width: "40px", height: "40px"}} disabled={loading || !!error || tracks.length <= 1}>
                      <span style={{fontSize: "1.2rem"}}>⏮</span>
                    </button>
                    
                    <button onClick={togglePlay} className="btn btn-primary me-2" style={{width: "50px", height: "50px"}} disabled={loading || !!error}>
                      <span style={{fontSize: "1.5rem"}}>{isPlaying ? '❚❚' : '▶'}</span>
                    </button>
                    
                    <button onClick={playNext} className="btn btn-secondary me-2" style={{width: "40px", height: "40px"}} disabled={loading || !!error || tracks.length <= 1}>
                      <span style={{fontSize: "1.2rem"}}>⏭</span>
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
          )}
          
          {/* Playlist */}
          {tracks && tracks.length > 0 && (
            <div className="playlist mt-4">
              <h3 className="text-accent mb-3">Playlist ({tracks.length} tracks)</h3>
              <div className="list-group">
                {tracks.map((track, index) => (
                  <button
                    key={index}
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${currentTrack === index ? 'active' : ''}`}
                    onClick={() => changeTrack(index)}
                    disabled={loading && currentTrack === index}
                  >
                    <div>
                      <h5 className="mb-1">{track.title}</h5>
                      <p className="mb-1">{track.artist}</p>
                      <small className="text-muted">{track.fileName}</small>
                    </div>
                    {currentTrack === index && isPlaying && (
                      <span className="badge bg-primary rounded-pill">
                        <div className="playing-icon">
                          <div className="playing-bar"></div>
                          <div className="playing-bar"></div>
                          <div className="playing-bar"></div>
                        </div>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
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
        
        .playing-icon {
          display: flex;
          align-items: flex-end;
          height: 16px;
        }
        
        .playing-bar {
          width: 3px;
          margin: 0 1px;
          background-color: white;
          animation: sound 0ms -800ms linear infinite alternate;
        }
        
        .playing-bar:nth-child(1) { height: 8px; animation-duration: 474ms; }
        .playing-bar:nth-child(2) { height: 16px; animation-duration: 433ms; }
        .playing-bar:nth-child(3) { height: 10px; animation-duration: 407ms; }
        `}
      </style>
    </div>
  );
};

export default MusicPage;