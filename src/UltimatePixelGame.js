import React, { useState, useEffect, useRef, useCallback } from 'react';

const UltimatePixelGame = () => {
  // Initial game state - moved to a function for reusability
  const getInitialGameState = () => ({
    player: { 
      x: 400, y: 300, 
      health: 100, maxHealth: 100,
      mana: 100, maxMana: 100,
      level: 1, experience: 0, experienceToNext: 100,
      speed: 3, damage: 25,
      critChance: 0.1, critMultiplier: 2,
      coins: 0
    },
    enemies: [],
    powerups: [],
    projectiles: [],
    particles: [],
    floatingTexts: [],
    explosions: [],
    wave: 1,
    waveTimer: 0,
    enemiesKilled: 0,
    gameActive: true,
    isPaused: false,
    score: 0,
    gameTime: 0,
    combo: 0,
    comboTimer: 0,
    shopOpen: false,
    achievements: []
  });

  // Initial abilities state - moved to function for reusability
  const getInitialAbilities = () => ({
    fireball: { cooldown: 0, maxCooldown: 800, damage: 30, manaCost: 15, level: 1 },
    heal: { cooldown: 0, maxCooldown: 3000, healAmount: 40, manaCost: 25, level: 1 },
    shield: { cooldown: 0, maxCooldown: 8000, duration: 0, maxDuration: 3000, manaCost: 30, level: 1 },
    lightning: { cooldown: 0, maxCooldown: 2000, damage: 60, manaCost: 40, level: 1 },
    meteor: { cooldown: 0, maxCooldown: 5000, damage: 100, manaCost: 60, level: 1 },
    freeze: { cooldown: 0, maxCooldown: 4000, duration: 2000, manaCost: 35, level: 1 }
  });

  // Core game state
  const [gameState, setGameState] = useState(getInitialGameState);

  // Player abilities with proper state management
  const [abilities, setAbilities] = useState(getInitialAbilities);

  // Shop items
  const shopItems = [
    { id: 'health_upgrade', name: 'Health Boost', description: '+20 Max Health', price: 100, type: 'permanent' },
    { id: 'mana_upgrade', name: 'Mana Boost', description: '+15 Max Mana', price: 80, type: 'permanent' },
    { id: 'speed_upgrade', name: 'Speed Boost', description: '+0.5 Movement Speed', price: 120, type: 'permanent' },
    { id: 'crit_upgrade', name: 'Critical Strike', description: '+5% Crit Chance', price: 150, type: 'permanent' },
    { id: 'fireball_upgrade', name: 'Fireball Mastery', description: '+10 Damage, -200ms Cooldown', price: 200, type: 'ability' },
    { id: 'heal_upgrade', name: 'Healing Mastery', description: '+15 Healing, -500ms Cooldown', price: 180, type: 'ability' },
    { id: 'lightning_upgrade', name: 'Lightning Mastery', description: '+20 Damage, Chain 2 Enemies', price: 250, type: 'ability' },
    { id: 'meteor_unlock', name: 'Meteor Spell', description: 'Unlock devastating area spell', price: 300, type: 'unlock' }
  ];

  // Achievements system
  const achievementList = [
    { id: 'first_kill', name: 'First Blood', description: 'Kill your first enemy', condition: (state) => state.enemiesKilled >= 1 },
    { id: 'wave_5', name: 'Survivor', description: 'Reach wave 5', condition: (state) => state.wave >= 5 },
    { id: 'level_5', name: 'Experienced', description: 'Reach level 5', condition: (state) => state.player.level >= 5 },
    { id: 'combo_10', name: 'Combo Master', description: 'Get a 10x combo', condition: (state) => state.combo >= 10 },
    { id: 'rich', name: 'Wealthy Mage', description: 'Collect 500 coins', condition: (state) => state.player.coins >= 500 },
    { id: 'wave_10', name: 'Veteran', description: 'Reach wave 10', condition: (state) => state.wave >= 10 },
    { id: 'perfectionist', name: 'Untouchable', description: 'Complete a wave without taking damage', condition: (state) => false }, // Custom logic needed
    { id: 'speed_demon', name: 'Speed Demon', description: 'Kill 20 enemies in 30 seconds', condition: (state) => false } // Custom logic needed
  ];

  // Enhanced enemy types with better balance
  const enemyTypes = {
    slime: { 
      health: 40, speed: 1.2, damage: 15, color: '#44ff44', points: 100, size: 20,
      spawnWeight: 0.4, minWave: 1
    },
    orc: { 
      health: 80, speed: 1.8, damage: 25, color: '#ff4444', points: 150, size: 25,
      spawnWeight: 0.3, minWave: 2
    },
    golem: { 
      health: 150, speed: 0.8, damage: 40, color: '#888888', points: 250, size: 35,
      spawnWeight: 0.2, minWave: 3
    },
    demon: { 
      health: 100, speed: 2.5, damage: 35, color: '#ff00ff', points: 300, size: 30,
      spawnWeight: 0.15, minWave: 4
    },
    boss: { 
      health: 400, speed: 1.5, damage: 50, color: '#8800ff', points: 1000, size: 50,
      spawnWeight: 0.05, minWave: 5
    }
  };

  // Powerup types
  const powerupTypes = {
    health: { color: '#ff3333', effect: 'heal', value: 50, duration: 0 },
    mana: { color: '#3333ff', effect: 'mana', value: 40, duration: 0 },
    experience: { color: '#ffff33', effect: 'experience', value: 50, duration: 0 },
    speed: { color: '#33ff33', effect: 'tempSpeed', value: 1.5, duration: 8000 },
    damage: { color: '#ff8833', effect: 'tempDamage', value: 2, duration: 10000 }
  };

  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const keysRef = useRef({ w: false, a: false, s: false, d: false });
  const mouseRef = useRef({ x: 400, y: 300, down: false });
  const tempEffectsRef = useRef({ speed: 0, damage: 0, speedMultiplier: 1, damageMultiplier: 1 });
  const spawnTimeoutRef = useRef(null); // Add ref to track spawn timeout

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 800;
      canvas.height = 600;
    }
    
    // Add initial enemies
    spawnWaveEnemies(3);
    
    startGameLoop();
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      // Clear any pending spawn timeouts
      if (spawnTimeoutRef.current) {
        clearTimeout(spawnTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key.toLowerCase()) {
        case 'w': keysRef.current.w = true; break;
        case 'a': keysRef.current.a = true; break;
        case 's': keysRef.current.s = true; break;
        case 'd': keysRef.current.d = true; break;
        case ' ': 
          e.preventDefault(); 
          castHeal(); 
          break;
        case 'q': castLightning(); break;
        case 'e': castShield(); break;
        case 'p': togglePause(); break;
        case 'r': if (!gameState.gameActive) restartGame(); break;
      }
    };

    const handleKeyUp = (e) => {
      switch(e.key.toLowerCase()) {
        case 'w': keysRef.current.w = false; break;
        case 'a': keysRef.current.a = false; break;
        case 's': keysRef.current.s = false; break;
        case 'd': keysRef.current.d = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse controls
  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }
  };

  const handleMouseDown = (e) => {
    mouseRef.current.down = true;
    castFireball(mouseRef.current.x, mouseRef.current.y);
  };

  const handleMouseUp = () => {
    mouseRef.current.down = false;
  };

  // Game loop
  const gameLoop = useCallback(() => {
    // Only update abilities when game is paused or over, but stop everything else
    if (!gameState.gameActive) {
      updateAbilities(16); // Keep updating cooldowns for UI
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (gameState.isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    setGameState(prevState => {
      const newState = { ...prevState };
      const deltaTime = 16; // Assume 60fps

      // Update game time
      newState.gameTime += deltaTime;

      // Update player movement
      updatePlayerMovement(newState, deltaTime);

      // Update wave system
      updateWaveSystem(newState, deltaTime);

      // Update all game objects
      updateEnemies(newState, deltaTime);
      updateProjectiles(newState, deltaTime);
      updateParticles(newState, deltaTime);
      updateFloatingTexts(newState, deltaTime);
      updateExplosions(newState, deltaTime);
      updateTempEffects(deltaTime);

      // Check all collisions
      checkCollisions(newState);

      // Update abilities and effects
      updatePlayerStats(newState);

      // Spawn powerups occasionally
      if (Math.random() < 0.0008) {
        spawnPowerup(newState);
      }

      // Auto mana regeneration
      if (newState.player.mana < newState.player.maxMana) {
        newState.player.mana = Math.min(newState.player.maxMana, newState.player.mana + 0.1);
      }

      return newState;
    });

    // Update abilities separately to avoid state issues
    updateAbilities(16);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameActive, gameState.isPaused]);

  const startGameLoop = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const updatePlayerMovement = (state, deltaTime) => {
    const speed = state.player.speed * tempEffectsRef.current.speedMultiplier;
    let dx = 0, dy = 0;

    if (keysRef.current.w) dy -= speed;
    if (keysRef.current.s) dy += speed;
    if (keysRef.current.a) dx -= speed;
    if (keysRef.current.d) dx += speed;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    // Update position with bounds checking
    state.player.x = Math.max(20, Math.min(780, state.player.x + dx));
    state.player.y = Math.max(20, Math.min(580, state.player.y + dy));
  };

  const updateWaveSystem = (state, deltaTime) => {
    state.waveTimer += deltaTime;
    
    // Update combo timer
    if (state.combo > 0) {
      state.comboTimer -= deltaTime;
      if (state.comboTimer <= 0) {
        state.combo = 0;
      }
    }
    
    // New wave every 20 seconds or when all enemies are dead
    if (state.waveTimer > 20000 || (state.enemies.length === 0 && state.waveTimer > 5000)) {
      state.wave += 1;
      state.waveTimer = 0;
      
      const enemyCount = Math.min(3 + Math.floor(state.wave / 2), 12);
      spawnWaveEnemies(enemyCount);
      
      addFloatingText(state, 400, 100, `Wave ${state.wave}!`, '#ffff00', 2000);
      
      // Check wave achievements
      checkAchievements(state);
    }
  };

  const spawnWaveEnemies = (count) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        setGameState(prevState => {
          // Check if game is still active before spawning
          if (!prevState.gameActive) return prevState;
          
          const newState = { ...prevState };
          spawnEnemy(newState);
          return newState;
        });
      }, i * 500);
    }
  };

  const spawnEnemy = (state) => {
    // Filter enemy types based on current wave
    const availableTypes = Object.entries(enemyTypes).filter(
      ([_, type]) => state.wave >= type.minWave
    );

    // Weighted random selection
    const totalWeight = availableTypes.reduce((sum, [_, type]) => sum + type.spawnWeight, 0);
    let random = Math.random() * totalWeight;
    let selectedType = 'slime';

    for (const [typeName, type] of availableTypes) {
      random -= type.spawnWeight;
      if (random <= 0) {
        selectedType = typeName;
        break;
      }
    }

    // Spawn position (from edges)
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
      case 0: x = Math.random() * 800; y = -30; break;
      case 1: x = 830; y = Math.random() * 600; break;
      case 2: x = Math.random() * 800; y = 630; break;
      case 3: x = -30; y = Math.random() * 600; break;
    }

    const enemyData = enemyTypes[selectedType];
    const enemy = {
      id: Date.now() + Math.random(),
      x, y, type: selectedType,
      health: enemyData.health + Math.floor(state.wave * 5), // Scale with wave
      maxHealth: enemyData.health + Math.floor(state.wave * 5),
      speed: enemyData.speed + (state.wave * 0.1),
      damage: enemyData.damage + Math.floor(state.wave * 2),
      ...enemyData,
      lastDamageTime: 0
    };

    state.enemies.push(enemy);
  };

  const updateEnemies = (state, deltaTime) => {
    state.enemies.forEach(enemy => {
      // Handle freeze effect
      if (enemy.frozen > 0) {
        enemy.frozen -= deltaTime;
        if (enemy.frozen <= 0) {
          enemy.speed = enemy.originalSpeed || enemy.speed;
        }
      }
      
      if (enemy.speed > 0) {
        const dx = state.player.x - enemy.x;
        const dy = state.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;
          
          enemy.x += normalizedDx * enemy.speed;
          enemy.y += normalizedDy * enemy.speed;
        }
      }

      // Update damage flash
      if (enemy.lastDamageTime > 0) {
        enemy.lastDamageTime -= deltaTime;
      }
    });
  };

  const updateProjectiles = (state, deltaTime) => {
    state.projectiles = state.projectiles.filter(projectile => {
      projectile.x += projectile.vx;
      projectile.y += projectile.vy;
      projectile.life -= deltaTime;
      
      return projectile.x > -50 && projectile.x < 850 && 
             projectile.y > -50 && projectile.y < 650 &&
             projectile.life > 0;
    });
  };

  const updateParticles = (state, deltaTime) => {
    state.particles = state.particles.filter(particle => {
      particle.life -= deltaTime / 1000;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // Gravity
      particle.vx *= 0.99; // Air resistance
      
      return particle.life > 0;
    });
  };

  const updateFloatingTexts = (state, deltaTime) => {
    state.floatingTexts = state.floatingTexts.filter(text => {
      text.life -= deltaTime;
      text.y -= 1;
      text.alpha = text.life / text.maxLife;
      return text.life > 0;
    });
  };

  const updateTempEffects = (deltaTime) => {
    const effects = tempEffectsRef.current;
    
    if (effects.speed > 0) {
      effects.speed -= deltaTime;
      if (effects.speed <= 0) {
        effects.speedMultiplier = 1;
      }
    }
    
    if (effects.damage > 0) {
      effects.damage -= deltaTime;
      if (effects.damage <= 0) {
        effects.damageMultiplier = 1;
      }
    }
  };

  const updateAbilities = (deltaTime) => {
    setAbilities(prev => {
      const newAbilities = { ...prev };
      
      Object.keys(newAbilities).forEach(key => {
        if (newAbilities[key].cooldown > 0) {
          newAbilities[key].cooldown = Math.max(0, newAbilities[key].cooldown - deltaTime);
        }
        if (newAbilities[key].duration > 0) {
          newAbilities[key].duration = Math.max(0, newAbilities[key].duration - deltaTime);
        }
      });
      
      return newAbilities;
    });
  };

  const updatePlayerStats = (state) => {
    // Check for level up
    if (state.player.experience >= state.player.experienceToNext) {
      state.player.level += 1;
      state.player.experience -= state.player.experienceToNext;
      state.player.experienceToNext = state.player.level * 100;
      
      // Level up bonuses
      state.player.maxHealth += 10;
      state.player.health = state.player.maxHealth;
      state.player.maxMana += 5;
      state.player.mana = state.player.maxMana;
      state.player.damage += 5;
      
      addFloatingText(state, state.player.x, state.player.y - 30, 'LEVEL UP!', '#ffff00', 2000);
      createParticles(state, state.player.x, state.player.y, '#ffff00', 15);
    }
  };

  const checkCollisions = (state) => {
    // Player vs enemies
    state.enemies.forEach((enemy, enemyIndex) => {
      const dx = state.player.x - enemy.x;
      const dy = state.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = 25 + enemy.size / 2;
      
      if (distance < minDistance) {
        if (abilities.shield.duration > 0) {
          // Shield blocks damage - just add visual feedback
          addFloatingText(state, state.player.x, state.player.y - 20, 'BLOCKED!', '#00ffff', 800);
          createParticles(state, state.player.x, state.player.y, '#00ffff', 6);
          
          // Knockback enemy instead
          const knockbackForce = 15;
          const normalizedDx = -dx / distance;
          const normalizedDy = -dy / distance;
          enemy.x += normalizedDx * knockbackForce;
          enemy.y += normalizedDy * knockbackForce;
        } else {
          // Take damage
          state.player.health = Math.max(0, state.player.health - enemy.damage);
          addFloatingText(state, state.player.x, state.player.y - 20, `-${enemy.damage}`, '#ff0000', 1000);
          createParticles(state, state.player.x, state.player.y, '#ff0000', 8);
          
          // Knockback player
          const knockbackForce = 20;
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;
          state.player.x += normalizedDx * knockbackForce;
          state.player.y += normalizedDy * knockbackForce;
          
          if (state.player.health <= 0) {
            state.gameActive = false;
          }
        }
      }
    });

    // Projectiles vs enemies
    state.projectiles.forEach((projectile, pIndex) => {
      state.enemies.forEach((enemy, eIndex) => {
        const dx = projectile.x - enemy.x;
        const dy = projectile.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < enemy.size / 2 + 5) {
          let damage = Math.floor(projectile.damage * tempEffectsRef.current.damageMultiplier);
          
          // Check for critical hit
          const isCrit = Math.random() < state.player.critChance;
          if (isCrit) {
            damage = Math.floor(damage * state.player.critMultiplier);
            addFloatingText(state, enemy.x, enemy.y - 30, `CRIT! -${damage}`, '#ffff00', 1000);
            createParticles(state, enemy.x, enemy.y, '#ffff00', 8);
          } else {
            addFloatingText(state, enemy.x, enemy.y - 20, `-${damage}`, '#ffffff', 800);
          }
          
          enemy.health -= damage;
          enemy.lastDamageTime = 200;
          
          createParticles(state, enemy.x, enemy.y, projectile.color, 6);
          
          // Handle meteor explosion
          if (projectile.type === 'meteor') {
            createExplosion(state, projectile.x, projectile.y, 80, damage * 0.7);
          }
          
          // Remove projectile
          state.projectiles.splice(pIndex, 1);
          
          if (enemy.health <= 0) {
            // Enemy defeated
            const points = enemy.points * (1 + state.combo * 0.1); // Combo bonus
            const coins = Math.floor(enemy.points / 20) + Math.floor(Math.random() * 3);
            
            state.score += Math.floor(points);
            state.player.experience += Math.floor(points / 10);
            state.player.coins += coins;
            state.enemiesKilled += 1;
            
            // Update combo
            state.combo += 1;
            state.comboTimer = 3000; // 3 seconds to maintain combo
            
            addFloatingText(state, enemy.x, enemy.y, `+${Math.floor(points)}`, '#00ff00', 1000);
            addFloatingText(state, enemy.x, enemy.y + 15, `+${coins} coins`, '#ffd700', 800);
            if (state.combo > 1) {
              addFloatingText(state, enemy.x, enemy.y - 35, `${state.combo}x COMBO!`, '#ff8800', 1200);
            }
            
            createParticles(state, enemy.x, enemy.y, enemy.color, 12);
            
            state.enemies.splice(eIndex, 1);
            
            // Check achievements
            checkAchievements(state);
          }
        }
      });
    });

    // Player vs powerups
    state.powerups.forEach((powerup, index) => {
      const dx = state.player.x - powerup.x;
      const dy = state.player.y - powerup.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 30) {
        applyPowerup(state, powerup);
        state.powerups.splice(index, 1);
        createParticles(state, powerup.x, powerup.y, powerup.color, 8);
      }
    });
  };

  const spawnPowerup = (state) => {
    const types = Object.keys(powerupTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerup = {
      id: Date.now() + Math.random(),
      x: Math.random() * 750 + 25,
      y: Math.random() * 550 + 25,
      type,
      ...powerupTypes[type],
      pulsePhase: 0
    };

    state.powerups.push(powerup);
  };

  const applyPowerup = (state, powerup) => {
    const effects = tempEffectsRef.current;
    
    switch(powerup.effect) {
      case 'heal':
        state.player.health = Math.min(state.player.maxHealth, state.player.health + powerup.value);
        addFloatingText(state, state.player.x, state.player.y - 20, `+${powerup.value} HP`, '#00ff00', 1000);
        break;
      case 'mana':
        state.player.mana = Math.min(state.player.maxMana, state.player.mana + powerup.value);
        addFloatingText(state, state.player.x, state.player.y - 20, `+${powerup.value} MP`, '#0099ff', 1000);
        break;
      case 'experience':
        state.player.experience += powerup.value;
        addFloatingText(state, state.player.x, state.player.y - 20, `+${powerup.value} XP`, '#ffff00', 1000);
        break;
      case 'tempSpeed':
        effects.speed = powerup.duration;
        effects.speedMultiplier = powerup.value;
        addFloatingText(state, state.player.x, state.player.y - 20, 'SPEED UP!', '#00ff00', 1000);
        break;
      case 'tempDamage':
        effects.damage = powerup.duration;
        effects.damageMultiplier = powerup.value;
        addFloatingText(state, state.player.x, state.player.y - 20, 'DAMAGE UP!', '#ff8800', 1000);
        break;
    }
  };

  const createExplosion = (state, x, y, radius, damage) => {
    state.explosions.push({
      x, y, radius,
      life: 500,
      maxLife: 500
    });
    
    // Damage enemies in explosion radius
    state.enemies.forEach(enemy => {
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < radius) {
        const explosionDamage = Math.floor(damage * (1 - distance / radius));
        enemy.health -= explosionDamage;
        enemy.lastDamageTime = 200;
        
        addFloatingText(state, enemy.x, enemy.y - 20, `-${explosionDamage}`, '#ff8800', 800);
        createParticles(state, enemy.x, enemy.y, '#ff4400', 6);
        
        if (enemy.health <= 0) {
          const points = enemy.points * (1 + state.combo * 0.1);
          const coins = Math.floor(enemy.points / 20) + Math.floor(Math.random() * 3);
          
          state.score += Math.floor(points);
          state.player.experience += Math.floor(points / 10);
          state.player.coins += coins;
          state.enemiesKilled += 1;
          state.combo += 1;
          state.comboTimer = 3000;
          
          addFloatingText(state, enemy.x, enemy.y, `+${Math.floor(points)}`, '#00ff00', 1000);
          
          const enemyIndex = state.enemies.indexOf(enemy);
          if (enemyIndex > -1) {
            state.enemies.splice(enemyIndex, 1);
          }
        }
      }
    });
    
    createParticles(state, x, y, '#ff4400', 20);
  };

  const updateExplosions = (state, deltaTime) => {
    state.explosions = state.explosions.filter(explosion => {
      explosion.life -= deltaTime;
      return explosion.life > 0;
    });
  };

  const checkAchievements = (state) => {
    achievementList.forEach(achievement => {
      if (!state.achievements.includes(achievement.id) && achievement.condition(state)) {
        state.achievements.push(achievement.id);
        addFloatingText(state, 400, 200, `Achievement: ${achievement.name}!`, '#ffd700', 3000);
        createParticles(state, 400, 200, '#ffd700', 15);
        
        // Achievement rewards
        state.player.coins += 50;
        state.player.experience += 100;
      }
    });
  };

  const purchaseItem = (itemId) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || gameState.player.coins < item.price) return;

    setGameState(prevState => {
      const newState = { ...prevState };
      newState.player.coins -= item.price;
      
      switch(item.id) {
        case 'health_upgrade':
          newState.player.maxHealth += 20;
          newState.player.health = newState.player.maxHealth;
          break;
        case 'mana_upgrade':
          newState.player.maxMana += 15;
          newState.player.mana = newState.player.maxMana;
          break;
        case 'speed_upgrade':
          newState.player.speed += 0.5;
          break;
        case 'crit_upgrade':
          newState.player.critChance += 0.05;
          break;
      }
      
      addFloatingText(newState, newState.player.x, newState.player.y - 30, `Purchased: ${item.name}!`, '#00ff00', 2000);
      
      return newState;
    });

    // Handle ability upgrades
    if (item.type === 'ability') {
      setAbilities(prev => {
        const newAbilities = { ...prev };
        
        switch(item.id) {
          case 'fireball_upgrade':
            newAbilities.fireball.damage += 10;
            newAbilities.fireball.maxCooldown = Math.max(400, newAbilities.fireball.maxCooldown - 200);
            break;
          case 'heal_upgrade':
            newAbilities.heal.healAmount += 15;
            newAbilities.heal.maxCooldown = Math.max(1500, newAbilities.heal.maxCooldown - 500);
            break;
          case 'lightning_upgrade':
            newAbilities.lightning.damage += 20;
            break;
        }
        
        return newAbilities;
      });
    }
  };

  const addFloatingText = (state, x, y, text, color, duration) => {
    state.floatingTexts.push({
      x, y, text, color,
      life: duration,
      maxLife: duration,
      alpha: 1
    });
  };

  // Spell casting functions
  const castFireball = (targetX, targetY) => {
    if (abilities.fireball.cooldown > 0 || gameState.player.mana < abilities.fireball.manaCost || !gameState.gameActive) return;

    const dx = targetX - gameState.player.x;
    const dy = targetY - gameState.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 12;

    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, mana: prev.player.mana - abilities.fireball.manaCost },
      projectiles: [...prev.projectiles, {
        x: prev.player.x,
        y: prev.player.y,
        vx: (dx / distance) * speed,
        vy: (dy / distance) * speed,
        damage: abilities.fireball.damage,
        color: '#ff4400',
        life: 2000
      }]
    }));

    setAbilities(prev => ({
      ...prev,
      fireball: { ...prev.fireball, cooldown: prev.fireball.maxCooldown }
    }));
  };

  const castHeal = () => {
    if (abilities.heal.cooldown > 0 || gameState.player.mana < abilities.heal.manaCost || !gameState.gameActive) return;

    setGameState(prev => {
      const healAmount = Math.min(abilities.heal.healAmount, prev.player.maxHealth - prev.player.health);
      const newState = {
        ...prev,
        player: {
          ...prev.player,
          health: Math.min(prev.player.maxHealth, prev.player.health + abilities.heal.healAmount),
          mana: prev.player.mana - abilities.heal.manaCost
        }
      };
      
      addFloatingText(newState, prev.player.x, prev.player.y - 20, `+${healAmount}`, '#00ff00', 1000);
      createParticles(newState, prev.player.x, prev.player.y, '#00ff00', 10);
      
      return newState;
    });

    setAbilities(prev => ({
      ...prev,
      heal: { ...prev.heal, cooldown: prev.heal.maxCooldown }
    }));
  };

  const castShield = () => {
    if (abilities.shield.cooldown > 0 || gameState.player.mana < abilities.shield.manaCost || !gameState.gameActive) return;

    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, mana: prev.player.mana - abilities.shield.manaCost }
    }));

    setAbilities(prev => ({
      ...prev,
      shield: { 
        ...prev.shield, 
        cooldown: prev.shield.maxCooldown,
        duration: prev.shield.maxDuration
      }
    }));
  };

  const castLightning = () => {
    if (abilities.lightning.cooldown > 0 || gameState.player.mana < abilities.lightning.manaCost || !gameState.gameActive) return;

    setGameState(prev => {
      const newState = { ...prev };
      newState.player.mana -= abilities.lightning.manaCost;
      
      // Find closest enemy
      let closestEnemy = null;
      let closestDistance = Infinity;
      
      newState.enemies.forEach(enemy => {
        const dx = enemy.x - newState.player.x;
        const dy = enemy.y - newState.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < closestDistance && distance < 200) {
          closestDistance = distance;
          closestEnemy = enemy;
        }
      });
      
      if (closestEnemy) {
        const damage = Math.floor(abilities.lightning.damage * tempEffectsRef.current.damageMultiplier);
        closestEnemy.health -= damage;
        closestEnemy.lastDamageTime = 200;
        
        addFloatingText(newState, closestEnemy.x, closestEnemy.y - 20, `-${damage}`, '#ffff00', 800);
        createParticles(newState, closestEnemy.x, closestEnemy.y, '#ffff00', 12);
        
        if (closestEnemy.health <= 0) {
          newState.score += closestEnemy.points;
          newState.player.experience += Math.floor(closestEnemy.points / 10);
          newState.enemiesKilled += 1;
          
          const enemyIndex = newState.enemies.indexOf(closestEnemy);
          if (enemyIndex > -1) {
            newState.enemies.splice(enemyIndex, 1);
          }
        }
      }
      
      return newState;
    });

    setAbilities(prev => ({
      ...prev,
      lightning: { ...prev.lightning, cooldown: prev.lightning.maxCooldown }
    }));
  };

  const createParticles = (state, x, y, color, count = 8) => {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        color,
        life: 1 + Math.random()
      });
    }
  };

  const castMeteor = (targetX, targetY) => {
    if (abilities.meteor.cooldown > 0 || gameState.player.mana < abilities.meteor.manaCost || !gameState.gameActive) return;

    // Create meteor warning circle first
    setGameState(prev => {
      const newState = { ...prev };
      newState.player.mana -= abilities.meteor.manaCost;
      
      // Add visual warning
      addFloatingText(newState, targetX, targetY - 50, 'INCOMING!', '#ff4400', 1500);
      createParticles(newState, targetX, targetY, '#ff4400', 10);
      
      // Meteor lands after 1 second
      setTimeout(() => {
        setGameState(prevState => {
          if (!prevState.gameActive) return prevState; // Check if game is still active
          
          const meteorState = { ...prevState };
          meteorState.projectiles.push({
            x: targetX,
            y: targetY,
            vx: 0, vy: 0,
            damage: abilities.meteor.damage,
            color: '#ff4400',
            life: 100,
            type: 'meteor'
          });
          return meteorState;
        });
      }, 1000);
      
      return newState;
    });

    setAbilities(prev => ({
      ...prev,
      meteor: { ...prev.meteor, cooldown: prev.meteor.maxCooldown }
    }));
  };

  const castFreeze = () => {
    if (abilities.freeze.cooldown > 0 || gameState.player.mana < abilities.freeze.manaCost || !gameState.gameActive) return;

    setGameState(prev => {
      const newState = { ...prev };
      newState.player.mana -= abilities.freeze.manaCost;
      
      // Freeze all enemies temporarily
      newState.enemies.forEach(enemy => {
        enemy.frozen = abilities.freeze.duration;
        enemy.originalSpeed = enemy.speed;
        enemy.speed = 0;
      });
      
      addFloatingText(newState, newState.player.x, newState.player.y - 30, 'TIME FREEZE!', '#00ffff', 2000);
      createParticles(newState, newState.player.x, newState.player.y, '#00ffff', 15);
      
      return newState;
    });

    setAbilities(prev => ({
      ...prev,
      freeze: { ...prev.freeze, cooldown: prev.freeze.maxCooldown }
    }));
  };

  const togglePause = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const restartGame = () => {
    // Clear any pending timeouts
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
    }
    
    // Cancel current game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    // Reset all state completely
    setGameState(getInitialGameState());
    setAbilities(getInitialAbilities());
    
    // Reset temp effects
    tempEffectsRef.current = { speed: 0, damage: 0, speedMultiplier: 1, damageMultiplier: 1 };
    
    // Reset key states - THIS IS IMPORTANT
    keysRef.current = { w: false, a: false, s: false, d: false };
    
    // Restart the game loop and spawn enemies immediately
    setTimeout(() => {
      // Start with some enemies already in the game
      setGameState(prevState => {
        const newState = { ...prevState };
        // Spawn 3 enemies directly
        for (let i = 0; i < 3; i++) {
          spawnEnemy(newState);
        }
        return newState;
      });
      
      startGameLoop();
    }, 100);
  };

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 500);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f1e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw particles
    gameState.particles.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw powerups with pulse effect
    gameState.powerups.forEach(powerup => {
      const pulse = Math.sin(Date.now() * 0.008) * 0.2 + 0.8;
      const size = 15 * pulse;
      
      ctx.fillStyle = powerup.color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(powerup.x, powerup.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      // Flash effect when damaged
      if (enemy.lastDamageTime > 0) {
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.fillStyle = enemy.color;
      }
      
      const size = enemy.size;
      ctx.fillRect(enemy.x - size/2, enemy.y - size/2, size, size);
      
      // Enemy outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(enemy.x - size/2, enemy.y - size/2, size, size);
      
      // Health bar
      const barWidth = size;
      const barHeight = 6;
      const healthPercent = enemy.health / enemy.maxHealth;
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(enemy.x - barWidth/2, enemy.y - size/2 - 12, barWidth, barHeight);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(enemy.x - barWidth/2, enemy.y - size/2 - 12, barWidth * healthPercent, barHeight);
      
      // Health bar outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(enemy.x - barWidth/2, enemy.y - size/2 - 12, barWidth, barHeight);
    });

    // Draw projectiles
    gameState.projectiles.forEach(projectile => {
      ctx.fillStyle = projectile.color;
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw player
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(gameState.player.x - 15, gameState.player.y - 15, 30, 30);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(gameState.player.x - 15, gameState.player.y - 15, 30, 30);

    // Draw shield effect
    if (abilities.shield.duration > 0) {
      const shieldAlpha = Math.min(1, abilities.shield.duration / 1000);
      ctx.strokeStyle = `rgba(68, 255, 255, ${shieldAlpha})`;
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(gameState.player.x, gameState.player.y, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw floating texts
    gameState.floatingTexts.forEach(text => {
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = text.color;
      ctx.globalAlpha = text.alpha;
      ctx.textAlign = 'center';
      ctx.fillText(text.text, text.x, text.y);
    });
    ctx.globalAlpha = 1;

    // Draw crosshair at mouse position
    if (mouseRef.current.x && mouseRef.current.y) {
      const range = 200; // Fireball range
      const dx = mouseRef.current.x - gameState.player.x;
      const dy = mouseRef.current.y - gameState.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      ctx.strokeStyle = distance <= range ? '#00ff00' : '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mouseRef.current.x - 10, mouseRef.current.y);
      ctx.lineTo(mouseRef.current.x + 10, mouseRef.current.y);
      ctx.moveTo(mouseRef.current.x, mouseRef.current.y - 10);
      ctx.lineTo(mouseRef.current.x, mouseRef.current.y + 10);
      ctx.stroke();
      
      // Range circle
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(gameState.player.x, gameState.player.y, range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

  }, [gameState, abilities, mouseRef.current]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCooldownPercent = (ability) => {
    return ability.cooldown > 0 ? (ability.cooldown / ability.maxCooldown) * 100 : 0;
  };

  return (
    <div className="ultimate-pixel-game" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      padding: '20px', 
      borderRadius: '15px',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    }}>
      {/* Game UI Header */}
      <div style={{ 
        color: 'white', 
        marginBottom: '15px', 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '20px',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '10px'
      }}>
        {/* Player Stats */}
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Player Stats</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ width: '60px' }}>Health:</span>
            <div style={{ 
              background: '#333', 
              height: '20px', 
              width: '120px', 
              borderRadius: '10px',
              overflow: 'hidden',
              marginRight: '10px'
            }}>
              <div style={{ 
                background: 'linear-gradient(90deg, #ff0000, #ff6600)',
                height: '100%',
                width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <span>{gameState.player.health}/{gameState.player.maxHealth}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ width: '60px' }}>Mana:</span>
            <div style={{ 
              background: '#333', 
              height: '20px', 
              width: '120px', 
              borderRadius: '10px',
              overflow: 'hidden',
              marginRight: '10px'
            }}>
              <div style={{ 
                background: 'linear-gradient(90deg, #0066ff, #00ccff)',
                height: '100%',
                width: `${(gameState.player.mana / gameState.player.maxMana) * 100}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <span>{Math.floor(gameState.player.mana)}/{gameState.player.maxMana}</span>
          </div>
          <div>Level: {gameState.player.level} (XP: {Math.floor(gameState.player.experience)}/{gameState.player.experienceToNext})</div>
        </div>

        {/* Game Stats */}
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Game Stats</div>
          <div>Score: {gameState.score.toLocaleString()}</div>
          <div>Wave: {gameState.wave}</div>
          <div>Enemies: {gameState.enemies.length}</div>
          <div>Killed: {gameState.enemiesKilled}</div>
          <div>Time: {formatTime(gameState.gameTime)}</div>
        </div>

        {/* Abilities */}
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Abilities</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '12px' }}>
            <div style={{ opacity: abilities.fireball.cooldown > 0 ? 0.5 : 1 }}>
              🔥 Fireball (Click)
              {abilities.fireball.cooldown > 0 && (
                <div style={{ background: '#333', height: '4px', borderRadius: '2px' }}>
                  <div style={{ 
                    background: '#ff4400', 
                    height: '100%', 
                    width: `${100 - getCooldownPercent(abilities.fireball)}%`,
                    borderRadius: '2px',
                    transition: 'width 0.1s ease'
                  }}></div>
                </div>
              )}
            </div>
            <div style={{ opacity: abilities.heal.cooldown > 0 ? 0.5 : 1 }}>
              ❤️ Heal (Space)
              {abilities.heal.cooldown > 0 && (
                <div style={{ background: '#333', height: '4px', borderRadius: '2px' }}>
                  <div style={{ 
                    background: '#00ff00', 
                    height: '100%', 
                    width: `${100 - getCooldownPercent(abilities.heal)}%`,
                    borderRadius: '2px',
                    transition: 'width 0.1s ease'
                  }}></div>
                </div>
              )}
            </div>
            <div style={{ opacity: abilities.lightning.cooldown > 0 ? 0.5 : 1 }}>
              ⚡ Lightning (Q)
              {abilities.lightning.cooldown > 0 && (
                <div style={{ background: '#333', height: '4px', borderRadius: '2px' }}>
                  <div style={{ 
                    background: '#ffff00', 
                    height: '100%', 
                    width: `${100 - getCooldownPercent(abilities.lightning)}%`,
                    borderRadius: '2px',
                    transition: 'width 0.1s ease'
                  }}></div>
                </div>
              )}
            </div>
            <div style={{ opacity: abilities.shield.cooldown > 0 ? 0.5 : 1 }}>
              🛡️ Shield (E)
              {abilities.shield.duration > 0 ? (
                <div style={{ color: '#00ffff' }}>Active: {Math.ceil(abilities.shield.duration/1000)}s</div>
              ) : abilities.shield.cooldown > 0 && (
                <div style={{ background: '#333', height: '4px', borderRadius: '2px' }}>
                  <div style={{ 
                    background: '#00ffff', 
                    height: '100%', 
                    width: `${100 - getCooldownPercent(abilities.shield)}%`,
                    borderRadius: '2px',
                    transition: 'width 0.1s ease'
                  }}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Temporary Effects Display */}
      {(tempEffectsRef.current.speed > 0 || tempEffectsRef.current.damage > 0) && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Active Effects:</div>
          {tempEffectsRef.current.speed > 0 && (
            <div style={{ color: '#00ff00' }}>
              🏃 Speed Boost: {Math.ceil(tempEffectsRef.current.speed/1000)}s
            </div>
          )}
          {tempEffectsRef.current.damage > 0 && (
            <div style={{ color: '#ff8800' }}>
              ⚔️ Damage Boost: {Math.ceil(tempEffectsRef.current.damage/1000)}s
            </div>
          )}
        </div>
      )}

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ 
          border: '3px solid #333', 
          borderRadius: '10px',
          cursor: 'crosshair',
          display: 'block',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}
      />

      {/* Controls */}
      <div style={{ 
        color: 'white', 
        marginTop: '15px', 
        fontSize: '14px',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
      }}>
        <div>
          <strong>Movement:</strong> WASD Keys<br/>
          <strong>Attack:</strong> Click to cast Fireball<br/>
          <strong>Heal:</strong> Space Bar
        </div>
        <div>
          <strong>Lightning:</strong> Q Key<br/>
          <strong>Shield:</strong> E Key<br/>
          <strong>Pause:</strong> P Key
        </div>
      </div>

      {/* Game Over Screen */}
      {!gameState.gameActive && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '40px',
          borderRadius: '15px',
          textAlign: 'center',
          boxShadow: '0 0 30px rgba(0,0,0,0.8)',
          border: '3px solid #fff'
        }}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Game Over!
          </h2>
          <div style={{ fontSize: '18px', marginBottom: '15px' }}>
            <div>🏆 Final Score: <strong>{gameState.score.toLocaleString()}</strong></div>
            <div>🌊 Wave Reached: <strong>{gameState.wave}</strong></div>
            <div>⭐ Level Achieved: <strong>{gameState.player.level}</strong></div>
            <div>💀 Enemies Defeated: <strong>{gameState.enemiesKilled}</strong></div>
            <div>⏱️ Survival Time: <strong>{formatTime(gameState.gameTime)}</strong></div>
          </div>
          <button 
            onClick={restartGame}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🎮 Play Again (R)
          </button>
        </div>
      )}

      {/* Pause Screen */}
      {gameState.isPaused && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid #fff'
        }}>
          <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>⏸️ Game Paused</h3>
          <p style={{ fontSize: '16px' }}>Press P to resume</p>
        </div>
      )}
    </div>
  );
};

export default UltimatePixelGame;