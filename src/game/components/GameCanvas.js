// src/game/components/GameCanvas.js
import React, { useRef, useEffect, useCallback } from 'react';
import { GAME_CONFIG, COLORS, VISUAL_CONFIG } from '../constants/gameConstants.js';
// We'll need CollisionSystem and entity creation/factories
import { getCollisionSystem } from '../systems/CollisionSystem.js';
import { createEnemy } from '../entities/Enemy.js'; // Example
import { ProjectileFactory } from '../entities/Projectile.js'; // Example
import { useGameInput } from '../hooks/useGameState'; // Import useGameInput
// Particle system if you have one separate
// import { ParticleSystem, ParticleEffects } from '../entities/Particle.js';

// Helper to add floating text (can be moved to a system/util later)
const addFloatingTextToState = (setGameState, x, y, text, color, duration = 1000) => {
  setGameState(prev => ({
    ...prev,
    floatingTexts: [...(prev.floatingTexts || []), {
      x, y, text, color,
      life: duration, maxLife: duration, alpha: 1, id: Date.now() + Math.random()
    }]
  }));
};

// Helper to add particles (can be moved to a system/util later)
const createParticlesInState = (setGameState, x, y, color, count = 8, particleOptions = {}) => {
  setGameState(prev => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6, // Basic particle physics
        vy: (Math.random() - 0.5) * 6 - 2,
        color,
        life: 1 + Math.random(), // in seconds
        id: Date.now() + Math.random(),
        ...particleOptions
      });
    }
    return {
      ...prev,
      particles: [...(prev.particles || []), ...newParticles]
    };
  });
};


function GameCanvas({
  gameState,
  setGameState,
  abilities, // For rendering shield, etc. and ability ranges
  playerRef,
  inputRef,
  mouseRef,
  gameLoopInstance,      // Passed from UltimatePixelGame
  updateAbilitiesSystem, // Passed from UltimatePixelGame
  castAbilitySystem,     // Passed from UltimatePixelGame
  onGameOver
}) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const collisionSystemRef = useRef(null);

  useGameInput(inputRef, mouseRef, canvasRef);

  // Initialize canvas and context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = GAME_CONFIG.CANVAS_WIDTH;
      canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
      contextRef.current = canvas.getContext('2d');
      if (contextRef.current) {
        contextRef.current.imageSmoothingEnabled = false; // For pixel art
      }
    }
    if (!collisionSystemRef.current) {
        collisionSystemRef.current = getCollisionSystem();
    }
  }, []);

  // Main Game Update Logic
  const updateGame = useCallback((deltaTime) => {
    if (!gameState.gameActive || gameState.isPaused || !playerRef.current) return;

    playerRef.current.update(inputRef.current, deltaTime);

    if (updateAbilitiesSystem) {
      updateAbilitiesSystem(deltaTime);
    }

    setGameState(prev => {
      const newState = { ...prev };
      newState.gameTime += deltaTime;

      // Update enemies
      newState.enemies = (newState.enemies || []).map(enemy => {
        if(enemy.update) enemy.update(deltaTime, playerRef.current, newState.enemies);
        return enemy;
      }); // Death filtering happens after collisions

      // Update projectiles
      newState.projectiles = (newState.projectiles || []).map(projectile => {
        if(projectile.update) projectile.update(deltaTime);
        return projectile;
      }).filter(projectile => projectile.isActive); // Filter inactive ones before collision

      // Update powerups (they might move or expire)
      newState.powerups = (newState.powerups || []).map(powerup => {
        if(powerup.update) powerup.update(deltaTime, playerRef.current); // Powerups might be attracted to player
        return powerup;
      }).filter(powerup => powerup.isActive);

      // Update particles...
      newState.particles = (newState.particles || []).filter(p => {
        if (p.life === undefined) p.life = 1; // Default life if missing
        p.life -= deltaTime / 1000;
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        if (p.vy !== undefined) p.vy += (p.gravity !== undefined ? p.gravity : VISUAL_CONFIG.PARTICLE_GRAVITY);
        if (p.vx !== undefined) p.vx *= (p.friction !== undefined ? p.friction : VISUAL_CONFIG.PARTICLE_AIR_RESISTANCE);
        return p.life > 0;
      });


      // Update floating texts...
      newState.floatingTexts = (newState.floatingTexts || []).filter(text => {
          text.life -= deltaTime;
          text.y -= VISUAL_CONFIG.FLOATING_TEXT_RISE_SPEED;
          text.alpha = text.life / text.maxLife;
          return text.life > 0;
      });

      // Update explosions and check their collisions
      const activeExplosions = [];
      (newState.explosions || []).forEach(explosion => {
        explosion.life -= deltaTime;
        if (explosion.life > 0) {
          activeExplosions.push(explosion);
          // Explosion damage is handled by CollisionSystem callback now
        }
      });
      newState.explosions = activeExplosions;

      // Check Collisions
      if (collisionSystemRef.current && playerRef.current) {
        // `abilities` is needed for shield check
        collisionSystemRef.current.checkCollisions(newState, playerRef.current, abilities);
      }

      // Filter dead enemies AFTER collisions have been processed
      newState.enemies = newState.enemies.filter(enemy => enemy.isAlive);


      // Wave System... (simplified, needs to be robust)
      newState.waveTimer += deltaTime;
      if ((newState.enemies.length === 0 && newState.waveTimer > GAME_CONFIG.WAVE_TIMER_MIN) || newState.waveTimer > GAME_CONFIG.WAVE_TIMER_DURATION) {
        newState.wave += 1;
        newState.waveTimer = 0;
        addFloatingTextToState(setGameState, 400, 100, `Wave ${newState.wave}!`, COLORS.EXPERIENCE_TEXT, 2000);
        const numEnemiesToSpawn = Math.min(GAME_CONFIG.INITIAL_ENEMY_COUNT + Math.floor(newState.wave / 2), 12);
        for(let i = 0; i < numEnemiesToSpawn; i++) {
            // TODO: Add staggered spawning if desired using gameLoopInstance.addTimer
            const newEnemy = createEnemy(newState.wave);
            if(newEnemy) newState.enemies.push(newEnemy);
        }
      }
      
      // Update combo timer
      if (newState.combo > 0) {
        newState.comboTimer -= deltaTime;
        if (newState.comboTimer <= 0) {
          newState.combo = 0;
        }
      }


      // Sync player state from playerRef.current object into React's gameState.player
      if (playerRef.current) {
           newState.player = playerRef.current.getState(); // Get fresh state from player object
           if (newState.player.health <= 0 && newState.gameActive) { // Check for game over
               console.log("Player health zero, game over triggered from GameCanvas update");
               newState.gameActive = false;
               if (onGameOver) onGameOver();
           }
       }
      return newState;
    });

  }, [gameState.gameActive, gameState.isPaused, playerRef, inputRef, updateAbilitiesSystem, setGameState, onGameOver, abilities]); // Added `abilities` to deps

  // Main Game Render Logic
  const renderGame = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx || !playerRef.current) return;

    ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Draw Background
    const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 500);
    gradient.addColorStop(0, COLORS.BG_GRADIENT_CENTER);
    gradient.addColorStop(1, COLORS.BG_GRADIENT_EDGE);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    // ... (draw grid if you have one) ...

    // Draw Particles
    (gameState.particles || []).forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = Math.max(0, particle.life / (particle.maxLife || 1)); // Assuming life is in seconds and maxLife too
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;


    // Draw Enemies
    (gameState.enemies || []).forEach(enemy => {
      if (!enemy.isAlive) return;
      const enemyData = enemy.getVisuals ? enemy.getVisuals() : { x: enemy.x, y: enemy.y, size: enemy.size, color: enemy.color }; // Adapt if Enemy class has getVisuals
      ctx.fillStyle = enemy.lastDamageTime > 0 ? COLORS.WHITE : enemyData.color;
      ctx.fillRect(enemyData.x - enemyData.size / 2, enemyData.y - enemyData.size / 2, enemyData.size, enemyData.size);
      // ... (draw enemy health bars) ...
    });

    // Draw Projectiles
     (gameState.projectiles || []).forEach(projectile => {
        if (!projectile.isActive) return;
        const visual = projectile.getVisualProperties ? projectile.getVisualProperties() : { x: projectile.x, y: projectile.y, size: projectile.size, color: projectile.color };
        ctx.fillStyle = visual.color;
        ctx.beginPath();
        ctx.arc(visual.x, visual.y, visual.size, 0, Math.PI * 2);
        ctx.fill();
    });


    // Draw Player
    ctx.fillStyle = COLORS.PLAYER;
    ctx.fillRect(
      playerRef.current.x - GAME_CONFIG.PLAYER_SIZE / 2,
      playerRef.current.y - GAME_CONFIG.PLAYER_SIZE / 2,
      GAME_CONFIG.PLAYER_SIZE, GAME_CONFIG.PLAYER_SIZE
    );
    // Draw shield if active
    if (abilities.shield && abilities.shield.duration > 0) {
        const shieldAlpha = Math.min(1, abilities.shield.duration / 1000);
        ctx.strokeStyle = `rgba(68, 255, 255, ${shieldAlpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(playerRef.current.x, playerRef.current.y, GAME_CONFIG.PLAYER_SIZE + 5, 0, Math.PI * 2);
        ctx.stroke();
    }


    // Draw Floating Texts
    (gameState.floatingTexts || []).forEach(text => {
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = text.color;
      ctx.globalAlpha = text.alpha;
      ctx.textAlign = 'center';
      ctx.fillText(text.text, text.x, text.y);
    });
    ctx.globalAlpha = 1;

    // Draw Crosshair (if mouseRef is available)
    if (mouseRef && mouseRef.current.x && abilities.fireball) {
        const range = abilities.fireball.range || 200;
        const dx = mouseRef.current.x - playerRef.current.x;
        const dy = mouseRef.current.y - playerRef.current.y;
        const distance = Math.sqrt(dx*dx + dy*dy);

        ctx.strokeStyle = distance <= range ? COLORS.HEAL_TEXT : COLORS.DAMAGE_TEXT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mouseRef.current.x - 10, mouseRef.current.y);
        ctx.lineTo(mouseRef.current.x + 10, mouseRef.current.y);
        ctx.moveTo(mouseRef.current.x, mouseRef.current.y - 10);
        ctx.lineTo(mouseRef.current.x, mouseRef.current.y + 10);
        ctx.stroke();
    }


  }, [gameState, abilities, playerRef, mouseRef]); // Add all state/props read during render

  // Setup and manage the game loop
  useEffect(() => {
    if (gameLoopInstance && contextRef.current && playerRef.current) {
      console.log("GameCanvas: Initializing and starting game loop.");
      // The `updateGame` function is the `updateCallback` for the loop
      // The `renderGame` function is the `renderCallback` for the loop
      gameLoopInstance.init(updateGame, renderGame);
      if (!gameLoopInstance.isRunning && gameState.gameActive) {
        gameLoopInstance.start();
      } else if (gameLoopInstance.isRunning && !gameState.gameActive) {
        gameLoopInstance.stop();
      } else if (gameLoopInstance.isRunning && gameState.isPaused && !gameLoopInstance.isPaused) {
        gameLoopInstance.pause();
      } else if (gameLoopInstance.isRunning && !gameState.isPaused && gameLoopInstance.isPaused) {
        gameLoopInstance.resume();
      }
    }

    // Cleanup function for when the component unmounts or dependencies change
    // return () => {
    //   if (gameLoopInstance && gameLoopInstance.isRunning) {
    //     console.log("GameCanvas: Stopping game loop on unmount/deps change.");
    //     gameLoopInstance.stop();
    //   }
    // };
    // The gameLoopInstance lifecycle is now primarily managed by useGameState for restart/full stop.
    // GameCanvas just tells it to pause/resume based on gameState.
  }, [gameLoopInstance, updateGame, renderGame, gameState.gameActive, gameState.isPaused, playerRef]);

  const handlePlayerEnemyCollision = useCallback((collisionData) => {
    const { player, enemy, hasShield } = collisionData; // player is playerRef.current

    if (!enemy.isAlive || !player.isAlive()) return;

    if (hasShield) {
      addFloatingTextToState(setGameState, player.x, player.y - 20, 'BLOCKED!', COLORS.BLOCKED_TEXT, 800);
      createParticlesInState(setGameState, player.x, player.y, COLORS.SHIELD, 6);
      // Knockback enemy (Enemy class needs a knockback method)
      if (enemy.knockback) enemy.knockback(player.x, player.y, GAME_CONFIG.KNOCKBACK_FORCE_ENEMY);
    } else {
      const damageTaken = player.takeDamage(enemy.damage, { x: enemy.x, y: enemy.y }); // Player takes damage
      addFloatingTextToState(setGameState, player.x, player.y - 20, `-${damageTaken}`, COLORS.DAMAGE_TEXT, 1000);
      createParticlesInState(setGameState, player.x, player.y, COLORS.DAMAGE_TEXT, 8);

      // Player knockback is handled inside player.takeDamage
      // No need to call setGameState immediately for player health,
      // as playerRef.current is updated, and sync will happen at end of updateGame.
    }
  }, [setGameState]); // playerRef is stable, GAME_CONFIG and COLORS are constants

  const handleProjectileEnemyCollision = useCallback((collisionData) => {
    const { projectile, enemy } = collisionData;

    if (!enemy.isAlive) {
      return;
    }

    // Determine projectile damage (consider player buffs, crits)
    // This logic might be better placed in AbilityManager or Player class if damage is complex
    let finalDamage = projectile.damage;
    let isCrit = false;
    if (playerRef.current) {
        const effectiveDamage = playerRef.current.getEffectiveDamage(); // Assumes getEffectiveDamage considers projectile's base
        // For simplicity now, let's assume projectile.damage is already buffed.
        // If not, you'd do: finalDamage = projectile.damage * playerRef.current.tempEffects.damageMultiplier;
        // And then apply crit:
        if (Math.random() < playerRef.current.critChance) {
            finalDamage = Math.floor(finalDamage * playerRef.current.critMultiplier);
            isCrit = true;
        }
    }
    finalDamage = Math.floor(finalDamage);


    const damageDealt = enemy.takeDamage(finalDamage); // Enemy takes damage

    if (isCrit) {
      addFloatingTextToState(setGameState, enemy.x, enemy.y - 30, `CRIT! -${finalDamage}`, COLORS.CRITICAL_TEXT, 1000);
      createParticlesInState(setGameState, enemy.x, enemy.y, COLORS.CRITICAL_TEXT, 8);
    } else {
      addFloatingTextToState(setGameState, enemy.x, enemy.y - 20, `-${finalDamage}`, COLORS.WHITE, 800);
    }
    createParticlesInState(setGameState, enemy.x, enemy.y, projectile.color, 6);

    // Projectile is marked !isActive by its own checkHit or update logic
    // Enemy death handling will be done in the main update loop when filtering enemies.
    // Or, if enemy dies here, update score/xp immediately:
    if (!enemy.isAlive) {
        setGameState(prev => {
            const loot = enemy.getLoot ? enemy.getLoot() : { points: enemy.points || 50, experience: (enemy.points || 50)/10 , coins: (enemy.points || 50)/20 };
            const scoreToAdd = Math.floor(loot.points * (1 + (prev.combo || 0) * 0.1));
            if(playerRef.current) {
                playerRef.current.addExperience(loot.experience);
                playerRef.current.addCoins(loot.coins);
            }
            return {
                ...prev,
                score: prev.score + scoreToAdd,
                enemiesKilled: prev.enemiesKilled + 1,
                combo: (prev.combo || 0) + 1,
                comboTimer: GAME_CONFIG.COMBO_TIMER_DURATION,
                // enemies array will be filtered later
            };
        });
        //we dont have loot yet this broke the page
        // addFloatingTextToState(setGameState, enemy.x, enemy.y, `+${Math.floor(loot.points)}`, COLORS.HEAL_TEXT, 1000);
    }


    // Handle meteor explosion
    if (projectile.type === 'meteor' && projectile.explosionRadius) {
      // This logic should trigger an explosion entity or directly damage other enemies
      // For now, let's assume CollisionSystem handles explosion damage separately
      // Or, you'd create an explosion effect here that CollisionSystem then processes
      setGameState(prev => ({
        ...prev,
        explosions: [...(prev.explosions || []), {
            x: projectile.x, y: projectile.y, radius: projectile.explosionRadius,
            damage: projectile.damage * 0.7, // Area damage might be less
            life: 500, maxLife: 500, id: Date.now()
        }]
      }));
    }

  }, [setGameState, playerRef]); // playerRef dependency

  const handlePlayerPowerupCollision = useCallback((collisionData) => {
    const { powerup } = collisionData; // player is playerRef.current

    if (!powerup.isActive || !playerRef.current || !playerRef.current.isAlive()) return;

    const effectResult = powerup.applyEffect(playerRef.current); // Powerup applies its effect
    addFloatingTextToState(setGameState, playerRef.current.x, playerRef.current.y - 20, effectResult.message, powerup.color, 1000);
    createParticlesInState(setGameState, powerup.x, powerup.y, powerup.color, 8);

    // Mark powerup for removal
    setGameState(prev => ({
      ...prev,
      powerups: prev.powerups.filter(p => p.id !== powerup.id)
    }));
  }, [setGameState, playerRef]);

  const handleExplosionEnemyCollision = useCallback((collisionData) => {
    const { enemy, explosion, damagePercent } = collisionData;
    if (!enemy.isAlive) return;

    const explosionDamage = Math.floor(explosion.damage * damagePercent);
    enemy.takeDamage(explosionDamage);

    addFloatingTextToState(setGameState, enemy.x, enemy.y - 20, `-${explosionDamage}`, COLORS.METEOR, 800);
    createParticlesInState(setGameState, enemy.x, enemy.y, COLORS.METEOR, 4);

    if (!enemy.isAlive) {
      // Handle enemy death from explosion (similar to projectile kill)
      setGameState(prev => {
            const loot = enemy.getLoot ? enemy.getLoot() : { points: enemy.points || 50, experience: (enemy.points || 50)/10 , coins: (enemy.points || 50)/20 };
            const scoreToAdd = Math.floor(loot.points * (1 + (prev.combo || 0) * 0.1));
             if(playerRef.current) {
                playerRef.current.addExperience(loot.experience);
                playerRef.current.addCoins(loot.coins);
            }
            return {
                ...prev,
                score: prev.score + scoreToAdd,
                enemiesKilled: prev.enemiesKilled + 1,
                combo: (prev.combo || 0) + 1,
                comboTimer: GAME_CONFIG.COMBO_TIMER_DURATION,
            };
        });
    }
  }, [setGameState, playerRef]);

  // Mouse down handler for shooting (example)
  const handleMouseDown = useCallback((event) => {
    if (!gameState.gameActive || gameState.isPaused || !castAbilitySystem || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const targetX = event.clientX - rect.left;
    const targetY = event.clientY - rect.top;

    // Cast fireball towards mouse position
    castAbilitySystem('fireball', { x: targetX, y: targetY });

  }, [gameState.gameActive, gameState.isPaused, castAbilitySystem]);

  // Add mouse listeners to the canvas
  useEffect(() => {
      const currentCanvas = canvasRef.current;
      if (currentCanvas) {
          currentCanvas.addEventListener('mousedown', handleMouseDown);
      }
      return () => {
          if (currentCanvas) {
              currentCanvas.removeEventListener('mousedown', handleMouseDown);
          }
      };
  }, [handleMouseDown]);

  // useEffect to register collision callbacks with the system
  useEffect(() => {
    const cs = collisionSystemRef.current;
    if (cs) {
      cs.onPlayerEnemyCollision(handlePlayerEnemyCollision);
      cs.onProjectileEnemyCollision(handleProjectileEnemyCollision);
      cs.onPlayerPowerupCollision(handlePlayerPowerupCollision);
      cs.onExplosionEnemyCollision(handleExplosionEnemyCollision);
      // cs.onEnemyEnemyCollision(handleEnemyEnemySeparation); // If you implement this
    }
    // No cleanup needed for these, as CollisionSystem is a singleton and callbacks are replaced
  }, [handlePlayerEnemyCollision, handleProjectileEnemyCollision, handlePlayerPowerupCollision, handleExplosionEnemyCollision]);


  return (
    <canvas
      ref={canvasRef}
      className="game-canvas" // Add a class for potential CSS styling
      style={{
        border: '1px solid black', // Basic border
        cursor: 'crosshair'
        // ... other styles if needed
      }}
    />
  );
}

export default GameCanvas;