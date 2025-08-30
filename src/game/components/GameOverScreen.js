// Game Over screen component
import React, { useEffect, useState } from 'react';
import { getAchievementById } from '../constants/achievements.js';

export function GameOverScreen({ 
  gameState, 
  onRestart, 
  onMainMenu,
  newAchievements = [],
  highScore = 0
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Animate entrance
  useEffect(() => {
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setShowStats(true), 600);
    const timer3 = setTimeout(() => setShowAchievements(true), 1100);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);
  
  // Format time display
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate score rating
  const getScoreRating = (score) => {
    if (score >= 10000) return { rating: 'LEGENDARY', color: '#ff00ff' };
    if (score >= 5000) return { rating: 'EPIC', color: '#ff4400' };
    if (score >= 2500) return { rating: 'GREAT', color: '#00ff00' };
    if (score >= 1000) return { rating: 'GOOD', color: '#00ccff' };
    return { rating: 'ROOKIE', color: '#ffffff' };
  };
  
  const scoreRating = getScoreRating(gameState.score);
  const isNewHighScore = gameState.score > highScore;

  return (
    <div style={{
      ...styles.overlay,
      opacity: isVisible ? 1 : 0
    }}>
      <div style={{
        ...styles.container,
        transform: isVisible ? 'scale(1)' : 'scale(0.8)'
      }}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>GAME OVER</h1>
          {isNewHighScore && (
            <div style={styles.newHighScore}>
              🏆 NEW HIGH SCORE! 🏆
            </div>
          )}
        </div>
        
        {/* Main Stats */}
        <div style={{
          ...styles.mainStats,
          opacity: showStats ? 1 : 0,
          transform: showStats ? 'translateY(0)' : 'translateY(20px)'
        }}>
          <div style={styles.scoreContainer}>
            <div style={styles.scoreLabel}>Final Score</div>
            <div style={styles.scoreValue}>{gameState.score.toLocaleString()}</div>
            <div style={{
              ...styles.scoreRating,
              color: scoreRating.color
            }}>
              {scoreRating.rating}
            </div>
          </div>
          
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>🌊</div>
              <div style={styles.statValue}>{gameState.wave}</div>
              <div style={styles.statLabel}>Wave Reached</div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>⭐</div>
              <div style={styles.statValue}>{gameState.player.level}</div>
              <div style={styles.statLabel}>Level Achieved</div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>💀</div>
              <div style={styles.statValue}>{gameState.enemiesKilled}</div>
              <div style={styles.statLabel}>Enemies Defeated</div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>⏱️</div>
              <div style={styles.statValue}>{formatTime(gameState.gameTime)}</div>
              <div style={styles.statLabel}>Time Survived</div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>💰</div>
              <div style={styles.statValue}>{gameState.player.coins}</div>
              <div style={styles.statLabel}>Coins Collected</div>
            </div>
            
            <div style={styles.statItem}>
              <div style={styles.statIcon}>🔥</div>
              <div style={styles.statValue}>{gameState.combo}</div>
              <div style={styles.statLabel}>Max Combo</div>
            </div>
          </div>
        </div>
        
        {/* New Achievements */}
        {newAchievements.length > 0 && (
          <div style={{
            ...styles.achievementsSection,
            opacity: showAchievements ? 1 : 0,
            transform: showAchievements ? 'translateY(0)' : 'translateY(20px)'
          }}>
            <h3 style={styles.achievementsTitle}>New Achievements!</h3>
            <div style={styles.achievementsList}>
              {newAchievements.map(achievementId => {
                const achievement = getAchievementById(achievementId);
                if (!achievement) return null;
                
                return (
                  <div key={achievement.id} style={styles.achievementItem}>
                    <div style={styles.achievementIcon}>{achievement.icon}</div>
                    <div style={styles.achievementInfo}>
                      <div style={styles.achievementName}>{achievement.name}</div>
                      <div style={styles.achievementDesc}>{achievement.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div style={styles.buttons}>
          <button 
            onClick={onRestart}
            style={{
              ...styles.button,
              ...styles.primaryButton
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(255,107,107,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            }}
          >
            🎮 Play Again
          </button>
          
          <button 
            onClick={onMainMenu}
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            }}
          >
            🏠 Main Menu
          </button>
        </div>
        
        {/* Tips */}
        <div style={styles.tips}>
          <div style={styles.tipText}>
            💡 Tip: Collect powerups to boost your stats and survive longer!
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
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    transition: 'opacity 0.5s ease'
  },
  
  container: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '3px solid #444',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.1)',
    transition: 'transform 0.5s ease',
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
    background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  
  newHighScore: {
    fontSize: '20px',
    color: '#ffd700',
    fontWeight: 'bold',
    animation: 'pulse 1s ease-in-out infinite',
    textShadow: '0 0 10px rgba(255,215,0,0.5)'
  },
  
  mainStats: {
    marginBottom: '30px',
    transition: 'all 0.5s ease 0.3s'
  },
  
  scoreContainer: {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '15px',
    border: '2px solid #333'
  },
  
  scoreLabel: {
    fontSize: '18px',
    color: '#888',
    marginBottom: '10px'
  },
  
  scoreValue: {
    fontSize: '56px',
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    lineHeight: '1'
  },
  
  scoreRating: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: '10px',
    textShadow: '0 0 10px currentColor'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px'
  },
  
  statItem: {
    background: 'rgba(0,0,0,0.4)',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #333',
    transition: 'transform 0.2s ease',
    cursor: 'default'
  },
  
  statIcon: {
    fontSize: '32px',
    marginBottom: '10px'
  },
  
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '5px'
  },
  
  statLabel: {
    fontSize: '14px',
    color: '#888'
  },
  
  achievementsSection: {
    marginBottom: '30px',
    transition: 'all 0.5s ease 0.6s'
  },
  
  achievementsTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center',
    color: '#ffd700'
  },
  
  achievementsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  
  achievementItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: 'rgba(255,215,0,0.1)',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #ffd700'
  },
  
  achievementIcon: {
    fontSize: '32px'
  },
  
  achievementInfo: {
    flex: 1
  },
  
  achievementName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: '4px'
  },
  
  achievementDesc: {
    fontSize: '14px',
    color: '#ccc'
  },
  
  buttons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  
  button: {
    padding: '15px 30px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #333, #555)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    outline: 'none'
  },
  
  primaryButton: {
    background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)'
  },
  
  tips: {
    textAlign: 'center',
    marginTop: '20px'
  },
  
  tipText: {
    fontSize: '14px',
    color: '#888',
    fontStyle: 'italic'
  }
};

// Add keyframe animation for pulse
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(styleSheet);

export default GameOverScreen;