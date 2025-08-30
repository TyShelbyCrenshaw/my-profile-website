// Pause screen component
import React, { useState } from 'react';
import { KEY_BINDINGS } from '../constants/gameConstants.js';

export function PauseScreen({ 
  onResume, 
  onRestart, 
  onMainMenu,
  onSettingsToggle,
  gameState,
  soundEnabled = true,
  onSoundToggle
}) {
  const [showControls, setShowControls] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Format time display
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>PAUSED</h1>
          <div style={styles.subtitle}>Press P to Resume</div>
        </div>
        
        {/* Main Menu */}
        <div style={styles.menuSection}>
          <button 
            onClick={onResume}
            style={{
              ...styles.button,
              ...styles.primaryButton
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,255,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            }}
          >
            ▶️ Resume Game
          </button>
          
          <button 
            onClick={onRestart}
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            🔄 Restart
          </button>
          
          <button 
            onClick={() => setShowControls(!showControls)}
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            🎮 Controls
          </button>
          
          <button 
            onClick={() => setShowStats(!showStats)}
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            📊 Stats
          </button>
          
          <button 
            onClick={onSoundToggle}
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            {soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF'}
          </button>
          
          <button 
            onClick={onMainMenu}
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            🏠 Main Menu
          </button>
        </div>
        
        {/* Controls Section */}
        {showControls && (
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>Game Controls</h3>
            <div style={styles.controlsGrid}>
              <div style={styles.controlItem}>
                <div style={styles.controlKey}>WASD</div>
                <div style={styles.controlDesc}>Move Character</div>
              </div>
              <div style={styles.controlItem}>
                <div style={styles.controlKey}>Mouse</div>
                <div style={styles.controlDesc}>Aim & Fire</div>
              </div>
              <div style={styles.controlItem}>
                <div style={styles.controlKey}>Click</div>
                <div style={styles.controlDesc}>Cast Fireball</div>
              </div>
              <div style={styles.controlItem}>
                <div style={styles.controlKey}>Space</div>
                <div style={styles.controlDesc}>Heal</div>
              </div>
              <div style={styles.controlItem}>
                <div style={styles.controlKey}>Q</div>
                <div style={styles.controlDesc}>Lightning Strike</div>
              </div>
              <div style={styles.controlItem}>
                <div style={styles.controlKey}>E</div>
                <div style={styles.controlDesc}>Shield</div>
              </div>
              <div style={styles.controlItem}>
                <div style={styles.controlKey}>R</div>
                <div style={styles.controlDesc}>Meteor (if unlocked)</div>
              </div>
              <div style={styles.controlItem}>
                <div style={styles.controlKey}>F</div>
                <div style={styles.controlDesc}>Freeze (if unlocked)</div>
              </div>
              <div style={styles.controlItem}>
                <div style={styles.controlKey}>P</div>
                <div style={styles.controlDesc}>Pause/Resume</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Section */}
        {showStats && gameState && (
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>Current Game Stats</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Score</div>
                <div style={styles.statValue}>{gameState.score.toLocaleString()}</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Wave</div>
                <div style={styles.statValue}>{gameState.wave}</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Level</div>
                <div style={styles.statValue}>{gameState.player.level}</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Enemies Killed</div>
                <div style={styles.statValue}>{gameState.enemiesKilled}</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Time Played</div>
                <div style={styles.statValue}>{formatTime(gameState.gameTime)}</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>Coins</div>
                <div style={styles.statValue}>{gameState.player.coins}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tips */}
        <div style={styles.tips}>
          <div style={styles.tipText}>
            💡 Tip: Combine abilities for powerful combos!
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)'
  },
  
  container: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '3px solid #444',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.1)',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  },
  
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
    background: 'linear-gradient(45deg, #00ff00, #00cc00)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '3px'
  },
  
  subtitle: {
    fontSize: '16px',
    color: '#888',
    fontStyle: 'italic'
  },
  
  menuSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px'
  },
  
  button: {
    padding: '15px 25px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #333, #555)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  
  primaryButton: {
    background: 'linear-gradient(45deg, #00ff00, #00cc00)',
    fontSize: '20px',
    padding: '18px 30px'
  },
  
  infoSection: {
    background: 'rgba(0,0,0,0.4)',
    padding: '20px',
    borderRadius: '15px',
    marginBottom: '20px',
    border: '1px solid #333'
  },
  
  infoTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center',
    color: '#00ff00'
  },
  
  controlsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  
  controlItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px'
  },
  
  controlKey: {
    background: 'linear-gradient(45deg, #444, #666)',
    padding: '5px 10px',
    borderRadius: '5px',
    fontWeight: 'bold',
    minWidth: '60px',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
    border: '1px solid #777'
  },
  
  controlDesc: {
    fontSize: '14px',
    color: '#ccc'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  
  statItem: {
    background: 'rgba(0,0,0,0.3)',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center'
  },
  
  statLabel: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '5px'
  },
  
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#00ff00'
  },
  
  tips: {
    textAlign: 'center',
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(0,255,0,0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(0,255,0,0.3)'
  },
  
  tipText: {
    fontSize: '14px',
    color: '#aaa',
    fontStyle: 'italic'
  }
};

export default PauseScreen;