// src/components/MusicPlayer.js
import React, { useState, useRef, useEffect } from 'react';
import song1 from '../../music/forever-live-sessions-vol-2-hq.mp3';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef(null);
  
  // You'll need to import these files and list them here
  // Since React can't access files dynamically from the filesystem
  // You'll need to import each audio file
  const tracks = [
    { 
      title: "Track 1", 
      src: song1
    }
  ];
  
  useEffect(() => {
    // Add event listeners for time updates
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      
      // Set initial volume
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
  
  const nextTrack = () => {
    const next = (currentTrack + 1) % tracks.length;
    setCurrentTrack(next);
    setCurrentTime(0);
    setIsPlaying(true);
    // We need to wait for the src to update before playing
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
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  return (
    <div className={`music-player ${isMinimized ? 'minimized' : ''}`} style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: isMinimized ? '60px' : '300px',
      backgroundColor: 'var(--bs-tertiary)',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      transition: 'width 0.3s ease',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <audio 
        ref={audioRef}
        src={tracks[currentTrack].src}
        onEnded={nextTrack}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="player-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: 'var(--bs-primary)',
        color: 'var(--bs-tertiary)'
      }}>
        <button 
          onClick={toggleMinimize} 
          className="btn btn-sm"
          style={{ color: 'var(--bs-tertiary)', padding: '0 5px' }}
        >
          {isMinimized ? '🔊' : '➖'}
        </button>
        
        {!isMinimized && (
          <div className="track-title" style={{ flexGrow: 1, textAlign: 'center' }}>
            {tracks[currentTrack].title}
          </div>
        )}
      </div>
      
      {!isMinimized && (
        <div className="player-body" style={{ padding: '10px' }}>
          <div className="progress-container mb-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="form-range"
            />
            <div className="time-display d-flex justify-content-between">
              <small>{formatTime(currentTime)}</small>
              <small>{formatTime(duration)}</small>
            </div>
          </div>
          
          <div className="controls d-flex justify-content-between align-items-center">
            <button 
              onClick={prevTrack} 
              className="btn btn-sm btn-primary"
            >
              ⏮️
            </button>
            <button 
              onClick={togglePlay} 
              className="btn btn-primary"
              style={{ width: '40px', height: '40px' }}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button 
              onClick={nextTrack}
              className="btn btn-sm btn-primary"
            >
              ⏭️
            </button>
          </div>
          
          <div className="volume-control mt-2 d-flex align-items-center">
            <span style={{ marginRight: '5px' }}>🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="form-range"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;