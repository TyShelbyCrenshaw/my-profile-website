// src/MusicPage.js
import React, { useState, useRef, useEffect } from 'react';
import song1 from '../../music/forever-live-sessions-vol-2-hq.mp3';

const MusicPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  
  // You'll need to replace these with your actual music files
  const tracks = [
    { title: "Song Name 1", artist: "Artist 1", src: song1 },
  ];
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.volume = volume;
    }
    
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, [currentTrack]);
  
  const updateProgress = () => {
    setCurrentTime(audioRef.current.currentTime);
  };
  
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const playTrack = (index) => {
    setCurrentTrack(index);
    setIsPlaying(true);
    setTimeout(() => audioRef.current.play(), 100);
  };
  
  const nextTrack = () => {
    const next = (currentTrack + 1) % tracks.length;
    setCurrentTrack(next);
    setCurrentTime(0);
    setIsPlaying(true);
    setTimeout(() => audioRef.current.play(), 100);
  };
  
  const prevTrack = () => {
    const prev = (currentTrack - 1 + tracks.length) % tracks.length;
    setCurrentTrack(prev);
    setCurrentTime(0);
    setIsPlaying(true);
    setTimeout(() => audioRef.current.play(), 100);
  };
  
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };
  
  const handleSeek = (e) => {
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
          
          {/* Audio Element */}
          <audio 
            ref={audioRef}
            src={tracks[currentTrack].src}
            onEnded={nextTrack}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
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
                  <button onClick={prevTrack} className="btn btn-primary me-2">
                    <span style={{fontSize: "1.2rem"}}>⏮️</span>
                  </button>
                  <button onClick={togglePlay} className="btn btn-primary me-2" style={{width: "50px", height: "50px"}}>
                    <span style={{fontSize: "1.5rem"}}>{isPlaying ? '❚❚' : '▶'}</span>
                  </button>
                  <button onClick={nextTrack} className="btn btn-primary">
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