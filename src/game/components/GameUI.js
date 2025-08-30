// Game UI component for HUD and interface - FIXED POSITIONING
import React, { useMemo } from 'react';
import { COLORS, KEY_BINDINGS } from '../constants/gameConstants.js';

export function GameUI({ gameState, abilities, playerRef, onPause, onShopToggle }) {
  const player = playerRef?.current;
  
  // Calculate percentages for bars
  const healthPercent = useMemo(() => {
    if (!player) return 0;
    return (player.health / player.maxHealth) * 100;
  }, [player?.health, player?.maxHealth]);
  
  const manaPercent = useMemo(() => {
    if (!player) return 0;
    return (player.mana / player.maxMana) * 100;
  }, [player?.mana, player?.maxMana]);
  
  const experiencePercent = useMemo(() => {
    if (!player) return 0;
    return (player.experience / player.experienceToNext) * 100;
  }, [player?.experience, player?.experienceToNext]);
  
  // Format time display
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Get ability cooldown display
  const getAbilityCooldown = (ability) => {
    if (!ability || ability.cooldown === 0) return '';
    return Math.ceil(ability.cooldown / 1000).toString();
  };
  
  // Get ability ready state
  const isAbilityReady = (ability) => {
    return ability && ability.cooldown === 0 && player?.mana >= ability.manaCost;
  };

  return (
    <div className="game-ui" style={styles.container}>
      {/* Top Bar - Player Stats */}
      <div style={styles.topBar}>
        <div style={styles.statsPanel}>
          {/* Health Bar */}
          <div style={styles.barContainer}>
            <div style={styles.barLabel}>
              <span style={styles.barIcon}>❤️</span>
              <span>Health</span>
              <span style={styles.barValue}>{Math.floor(player?.health || 0)}/{player?.maxHealth || 100}</span>
            </div>
            <div style={styles.barBackground}>
              <div 
                style={{
                  ...styles.healthBar,
                  width: `${healthPercent}%`
                }}
              />
            </div>
          </div>
          
          {/* Mana Bar */}
          <div style={styles.barContainer}>
            <div style={styles.barLabel}>
              <span style={styles.barIcon}>💙</span>
              <span>Mana</span>
              <span style={styles.barValue}>{Math.floor(player?.mana || 0)}/{player?.maxMana || 100}</span>
            </div>
            <div style={styles.barBackground}>
              <div 
                style={{
                  ...styles.manaBar,
                  width: `${manaPercent}%`
                }}
              />
            </div>
          </div>
          
          {/* Experience Bar */}
          <div style={styles.barContainer}>
            <div style={styles.barLabel}>
              <span style={styles.barIcon}>⭐</span>
              <span>Level {player?.level || 1}</span>
              <span style={styles.barValue}>{Math.floor(player?.experience || 0)}/{player?.experienceToNext || 100} XP</span>
            </div>
            <div style={styles.barBackground}>
              <div 
                style={{
                  ...styles.experienceBar,
                  width: `${experiencePercent}%`
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Game Stats */}
        <div style={styles.gameStats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Score</span>
            <span style={styles.statValue}>{gameState.score.toLocaleString()}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Wave</span>
            <span style={styles.statValue}>{gameState.wave}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Enemies</span>
            <span style={styles.statValue}>{gameState.enemies.length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Time</span>
            <span style={styles.statValue}>{formatTime(gameState.gameTime)}</span>
          </div>
        </div>
        
        {/* Resources */}
        <div style={styles.resources}>
          <div style={styles.resourceItem}>
            <span style={styles.resourceIcon}>💰</span>
            <span style={styles.resourceValue}>{player?.coins || 0}</span>
          </div>
          <div style={styles.resourceItem}>
            <span style={styles.resourceIcon}>💀</span>
            <span style={styles.resourceValue}>{gameState.enemiesKilled}</span>
          </div>
          {gameState.combo > 1 && (
            <div style={styles.comboIndicator}>
              <span style={styles.comboText}>{gameState.combo}x COMBO!</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Bar - Abilities */}
      <div style={styles.bottomBar}>
        <div style={styles.abilitiesContainer}>
          {/* Fireball (Mouse) */}
          <div style={{
            ...styles.abilitySlot,
            opacity: isAbilityReady(abilities.fireball) ? 1 : 0.5
          }}>
            <div style={styles.abilityIcon}>🔥</div>
            <div style={styles.abilityName}>Fireball</div>
            <div style={styles.abilityKey}>CLICK</div>
            {abilities.fireball?.cooldown > 0 && (
              <div style={styles.cooldownOverlay}>
                <div style={styles.cooldownText}>{getAbilityCooldown(abilities.fireball)}</div>
              </div>
            )}
            <div style={styles.manaCost}>{abilities.fireball?.manaCost} MP</div>
          </div>
          
          {/* Heal (Space) */}
          <div style={{
            ...styles.abilitySlot,
            opacity: isAbilityReady(abilities.heal) ? 1 : 0.5
          }}>
            <div style={styles.abilityIcon}>❤️</div>
            <div style={styles.abilityName}>Heal</div>
            <div style={styles.abilityKey}>SPACE</div>
            {abilities.heal?.cooldown > 0 && (
              <div style={styles.cooldownOverlay}>
                <div style={styles.cooldownText}>{getAbilityCooldown(abilities.heal)}</div>
              </div>
            )}
            <div style={styles.manaCost}>{abilities.heal?.manaCost} MP</div>
          </div>
          
          {/* Lightning (Q) */}
          <div style={{
            ...styles.abilitySlot,
            opacity: isAbilityReady(abilities.lightning) ? 1 : 0.5
          }}>
            <div style={styles.abilityIcon}>⚡</div>
            <div style={styles.abilityName}>Lightning</div>
            <div style={styles.abilityKey}>Q</div>
            {abilities.lightning?.cooldown > 0 && (
              <div style={styles.cooldownOverlay}>
                <div style={styles.cooldownText}>{getAbilityCooldown(abilities.lightning)}</div>
              </div>
            )}
            <div style={styles.manaCost}>{abilities.lightning?.manaCost} MP</div>
          </div>
          
          {/* Shield (E) */}
          <div style={{
            ...styles.abilitySlot,
            opacity: isAbilityReady(abilities.shield) ? 1 : 0.5,
            border: abilities.shield?.duration > 0 ? '2px solid #00ffff' : '2px solid #444'
          }}>
            <div style={styles.abilityIcon}>🛡️</div>
            <div style={styles.abilityName}>Shield</div>
            <div style={styles.abilityKey}>E</div>
            {abilities.shield?.duration > 0 ? (
              <div style={styles.durationOverlay}>
                <div style={styles.durationText}>{Math.ceil(abilities.shield.duration / 1000)}s</div>
              </div>
            ) : abilities.shield?.cooldown > 0 && (
              <div style={styles.cooldownOverlay}>
                <div style={styles.cooldownText}>{getAbilityCooldown(abilities.shield)}</div>
              </div>
            )}
            <div style={styles.manaCost}>{abilities.shield?.manaCost} MP</div>
          </div>
          
          {/* Meteor (if unlocked) */}
          {abilities.meteor?.unlocked && (
            <div style={{
              ...styles.abilitySlot,
              opacity: isAbilityReady(abilities.meteor) ? 1 : 0.5
            }}>
              <div style={styles.abilityIcon}>☄️</div>
              <div style={styles.abilityName}>Meteor</div>
              <div style={styles.abilityKey}>R</div>
              {abilities.meteor?.cooldown > 0 && (
                <div style={styles.cooldownOverlay}>
                  <div style={styles.cooldownText}>{getAbilityCooldown(abilities.meteor)}</div>
                </div>
              )}
              <div style={styles.manaCost}>{abilities.meteor?.manaCost} MP</div>
            </div>
          )}
          
          {/* Freeze (if unlocked) */}
          {abilities.freeze?.unlocked && (
            <div style={{
              ...styles.abilitySlot,
              opacity: isAbilityReady(abilities.freeze) ? 1 : 0.5
            }}>
              <div style={styles.abilityIcon}>❄️</div>
              <div style={styles.abilityName}>Freeze</div>
              <div style={styles.abilityKey}>F</div>
              {abilities.freeze?.cooldown > 0 && (
                <div style={styles.cooldownOverlay}>
                  <div style={styles.cooldownText}>{getAbilityCooldown(abilities.freeze)}</div>
                </div>
              )}
              <div style={styles.manaCost}>{abilities.freeze?.manaCost} MP</div>
            </div>
          )}
        </div>
        
        {/* Control Buttons */}
        <div style={styles.controlButtons}>
          <button onClick={onShopToggle} style={styles.controlButton}>
            🛒 Shop
          </button>
          <button onClick={onPause} style={styles.controlButton}>
            ⏸️ Pause
          </button>
        </div>
      </div>
      
      {/* Active Effects Display */}
      {(player?.tempEffects?.speedDuration > 0 || player?.tempEffects?.damageDuration > 0) && (
        <div style={styles.activeEffects}>
          <div style={styles.effectsTitle}>Active Effects</div>
          {player.tempEffects.speedDuration > 0 && (
            <div style={styles.effectItem}>
              <span style={styles.effectIcon}>🏃</span>
              <span>Speed Boost: {Math.ceil(player.tempEffects.speedDuration / 1000)}s</span>
            </div>
          )}
          {player.tempEffects.damageDuration > 0 && (
            <div style={styles.effectItem}>
              <span style={styles.effectIcon}>⚔️</span>
              <span>Damage Boost: {Math.ceil(player.tempEffects.damageDuration / 1000)}s</span>
            </div>
          )}
        </div>
      )}
      
      {/* Controls Help (toggleable) */}
      <div style={styles.controlsHelp}>
        <div style={styles.helpTitle}>Controls</div>
        <div style={styles.helpGrid}>
          <div>WASD - Move</div>
          <div>Mouse - Aim/Fire</div>
          <div>Space - Heal</div>
          <div>Q - Lightning</div>
          <div>E - Shield</div>
          <div>P - Pause</div>
        </div>
      </div>
    </div>
  );
}

// Updated Styles with proper positioning
const styles = {
  container: {
    position: 'absolute',
    top: '55px', // Added margin to avoid browser UI
    left: 0,
    right: 0,
    bottom: '20px', // Added margin at bottom
    pointerEvents: 'none',
    fontFamily: 'Arial, sans-serif',
    color: 'white',
    userSelect: 'none'
  },
  
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 20px', // Reduced padding
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
    pointerEvents: 'auto'
  },
  
  statsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px', // Reduced gap
    minWidth: '220px' // Slightly smaller
  },
  
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  
  barLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px' // Slightly smaller
  },
  
  barIcon: {
    fontSize: '14px'
  },
  
  barValue: {
    marginLeft: 'auto',
    fontSize: '11px',
    color: '#ccc'
  },
  
  barBackground: {
    width: '180px', // Smaller bars
    height: '16px', // Thinner bars
    background: 'rgba(0,0,0,0.6)',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative'
  },
  
  healthBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff0000, #ff6600)',
    transition: 'width 0.3s ease',
    boxShadow: '0 0 8px rgba(255,0,0,0.5)'
  },
  
  manaBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #0066ff, #00ccff)',
    transition: 'width 0.3s ease',
    boxShadow: '0 0 8px rgba(0,102,255,0.5)'
  },
  
  experienceBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #ffaa00, #ffff00)',
    transition: 'width 0.3s ease',
    boxShadow: '0 0 8px rgba(255,255,0,0.5)'
  },
  
  gameStats: {
    display: 'flex',
    gap: '15px', // Reduced gap
    alignItems: 'center'
  },
  
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px'
  },
  
  statLabel: {
    fontSize: '11px',
    color: '#aaa',
    textTransform: 'uppercase'
  },
  
  statValue: {
    fontSize: '18px', // Slightly smaller
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  },
  
  resources: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-end'
  },
  
  resourceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(0,0,0,0.6)',
    padding: '3px 10px', // Smaller padding
    borderRadius: '15px',
    border: '1px solid #333'
  },
  
  resourceIcon: {
    fontSize: '16px'
  },
  
  resourceValue: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  
  comboIndicator: {
    background: 'linear-gradient(45deg, #ff6600, #ffaa00)',
    padding: '6px 12px',
    borderRadius: '15px',
    animation: 'pulse 0.5s ease-in-out infinite'
  },
  
  comboText: {
    fontSize: '16px',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  },
  
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: '15px 20px', // Reduced padding
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    pointerEvents: 'auto'
  },
  
  abilitiesContainer: {
    display: 'flex',
    gap: '8px' // Reduced gap
  },
  
  abilitySlot: {
    position: 'relative',
    width: '70px', // Smaller slots
    height: '70px',
    background: 'rgba(0,0,0,0.8)',
    border: '2px solid #444',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  
  abilityIcon: {
    fontSize: '26px', // Smaller icons
    marginBottom: '2px'
  },
  
  abilityName: {
    fontSize: '10px',
    fontWeight: 'bold'
  },
  
  abilityKey: {
    fontSize: '9px',
    color: '#aaa',
    position: 'absolute',
    top: '3px',
    right: '3px',
    background: 'rgba(0,0,0,0.8)',
    padding: '1px 3px',
    borderRadius: '3px'
  },
  
  manaCost: {
    fontSize: '9px',
    color: '#00ccff',
    position: 'absolute',
    bottom: '3px',
    left: '3px'
  },
  
  cooldownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px'
  },
  
  cooldownText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ff6666'
  },
  
  durationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: '2px solid #00ffff'
  },
  
  durationText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#00ffff',
    textShadow: '0 0 8px rgba(0,255,255,0.8)'
  },
  
  controlButtons: {
    display: 'flex',
    gap: '8px'
  },
  
  controlButton: {
    padding: '8px 16px', // Smaller buttons
    background: 'rgba(0,0,0,0.8)',
    border: '2px solid #444',
    borderRadius: '6px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    pointerEvents: 'auto'
  },
  
  activeEffects: {
    position: 'absolute',
    top: '120px', // Adjusted position
    right: '20px',
    background: 'rgba(0,0,0,0.8)',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #444',
    minWidth: '180px'
  },
  
  effectsTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '6px',
    textAlign: 'center',
    color: '#ffaa00'
  },
  
  effectItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    marginBottom: '3px'
  },
  
  effectIcon: {
    fontSize: '14px'
  },
  
  controlsHelp: {
    position: 'absolute',
    bottom: '90px', // Adjusted position
    left: '20px',
    background: 'rgba(0,0,0,0.8)',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #444',
    fontSize: '11px',
    opacity: 0.7,
    transition: 'opacity 0.2s ease'
  },
  
  helpTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '6px',
    textAlign: 'center'
  },
  
  helpGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3px 10px'
  }
};

export default GameUI;