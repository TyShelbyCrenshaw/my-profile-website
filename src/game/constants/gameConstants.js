// Game configuration and constants
export const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    FPS: 60,
    DELTA_TIME: 16, // milliseconds per frame at 60fps
    
    // Player defaults
    PLAYER_INITIAL_X: 400,
    PLAYER_INITIAL_Y: 300,
    PLAYER_SIZE: 30,
    PLAYER_BASE_SPEED: 3,
    PLAYER_BASE_HEALTH: 100,
    PLAYER_BASE_MANA: 100,
    PLAYER_BASE_DAMAGE: 25,
    PLAYER_BASE_CRIT_CHANCE: 0.1,
    PLAYER_BASE_CRIT_MULTIPLIER: 2,
    
    // Mana regeneration
    MANA_REGEN_RATE: 0.1,
    
    // Combat
    KNOCKBACK_FORCE_PLAYER: 20,
    KNOCKBACK_FORCE_ENEMY: 15,
    
    // Wave system
    INITIAL_ENEMY_COUNT: 3,
    WAVE_TIMER_DURATION: 20000, // 20 seconds
    WAVE_TIMER_MIN: 5000, // 5 seconds minimum before next wave
    ENEMY_SPAWN_DELAY: 500, // milliseconds between enemy spawns
    
    // Effects
    DAMAGE_FLASH_DURATION: 200,
    COMBO_TIMER_DURATION: 3000,
    
    // Spawn chances
    POWERUP_SPAWN_CHANCE: 0.0008,
  };
  
  // Initial game state factory
  export const getInitialGameState = () => ({
    player: {
      x: GAME_CONFIG.PLAYER_INITIAL_X,
      y: GAME_CONFIG.PLAYER_INITIAL_Y,
      health: GAME_CONFIG.PLAYER_BASE_HEALTH,
      maxHealth: GAME_CONFIG.PLAYER_BASE_HEALTH,
      mana: GAME_CONFIG.PLAYER_BASE_MANA,
      maxMana: GAME_CONFIG.PLAYER_BASE_MANA,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      speed: GAME_CONFIG.PLAYER_BASE_SPEED,
      damage: GAME_CONFIG.PLAYER_BASE_DAMAGE,
      critChance: GAME_CONFIG.PLAYER_BASE_CRIT_CHANCE,
      critMultiplier: GAME_CONFIG.PLAYER_BASE_CRIT_MULTIPLIER,
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
  
  // Initial abilities state factory
  export const getInitialAbilities = () => ({
    fireball: {
      cooldown: 0,
      maxCooldown: 800,
      damage: 30,
      manaCost: 15,
      level: 1,
      projectileSpeed: 12,
      range: 200
    },
    heal: {
      cooldown: 0,
      maxCooldown: 3000,
      healAmount: 40,
      manaCost: 25,
      level: 1
    },
    shield: {
      cooldown: 0,
      maxCooldown: 8000,
      duration: 0,
      maxDuration: 3000,
      manaCost: 30,
      level: 1
    },
    lightning: {
      cooldown: 0,
      maxCooldown: 2000,
      damage: 60,
      manaCost: 40,
      level: 1,
      range: 200
    },
    meteor: {
      cooldown: 0,
      maxCooldown: 5000,
      damage: 100,
      manaCost: 60,
      level: 1,
      warningDuration: 1000,
      explosionRadius: 80
    },
    freeze: {
      cooldown: 0,
      maxCooldown: 4000,
      duration: 2000,
      manaCost: 35,
      level: 1
    }
  });
  
  // Enemy type definitions
  export const ENEMY_TYPES = {
    slime: {
      health: 40,
      speed: 1.2,
      damage: 15,
      color: '#44ff44',
      points: 100,
      size: 20,
      spawnWeight: 0.4,
      minWave: 1
    },
    orc: {
      health: 80,
      speed: 1.8,
      damage: 25,
      color: '#ff4444',
      points: 150,
      size: 25,
      spawnWeight: 0.3,
      minWave: 2
    },
    golem: {
      health: 150,
      speed: 0.8,
      damage: 40,
      color: '#888888',
      points: 250,
      size: 35,
      spawnWeight: 0.2,
      minWave: 3
    },
    demon: {
      health: 100,
      speed: 2.5,
      damage: 35,
      color: '#ff00ff',
      points: 300,
      size: 30,
      spawnWeight: 0.15,
      minWave: 4
    },
    boss: {
      health: 400,
      speed: 1.5,
      damage: 50,
      color: '#8800ff',
      points: 1000,
      size: 50,
      spawnWeight: 0.05,
      minWave: 5
    }
  };
  
  // Powerup type definitions
  export const POWERUP_TYPES = {
    health: {
      color: '#ff3333',
      effect: 'heal',
      value: 50,
      duration: 0,
      icon: '❤️',
      description: 'Restore 50 HP'
    },
    mana: {
      color: '#3333ff',
      effect: 'mana',
      value: 40,
      duration: 0,
      icon: '💙',
      description: 'Restore 40 MP'
    },
    experience: {
      color: '#ffff33',
      effect: 'experience',
      value: 50,
      duration: 0,
      icon: '⭐',
      description: 'Gain 50 XP'
    },
    speed: {
      color: '#33ff33',
      effect: 'tempSpeed',
      value: 1.5,
      duration: 8000,
      icon: '🏃',
      description: 'Speed x1.5 for 8s'
    },
    damage: {
      color: '#ff8833',
      effect: 'tempDamage',
      value: 2,
      duration: 10000,
      icon: '⚔️',
      description: 'Damage x2 for 10s'
    }
  };
  
  // Level up configuration
  export const LEVEL_UP_BONUSES = {
    healthIncrease: 10,
    manaIncrease: 5,
    damageIncrease: 5,
    experienceMultiplier: 100 // experienceToNext = level * this value
  };
  
  // Visual effects configuration
  export const VISUAL_CONFIG = {
    PARTICLE_GRAVITY: 0.1,
    PARTICLE_AIR_RESISTANCE: 0.99,
    PARTICLE_DEFAULT_COUNT: 8,
    FLOATING_TEXT_RISE_SPEED: 1,
    POWERUP_PULSE_SPEED: 0.008,
    POWERUP_PULSE_AMPLITUDE: 0.2,
    POWERUP_BASE_SIZE: 15,
    SHIELD_DASH_PATTERN: [5, 5],
    CROSSHAIR_SIZE: 10,
    GRID_SIZE: 40,
    GRID_ALPHA: 0.3
  };
  
  // Colors used throughout the game
  export const COLORS = {
    // Background
    BG_GRADIENT_CENTER: '#1a1a2e',
    BG_GRADIENT_EDGE: '#0f0f1e',
    GRID: '#333',
    
    // Player
    PLAYER: '#0088ff',
    PLAYER_OUTLINE: '#ffffff',
    
    // Effects
    DAMAGE_TEXT: '#ff0000',
    HEAL_TEXT: '#00ff00',
    MANA_TEXT: '#0099ff',
    EXPERIENCE_TEXT: '#ffff00',
    COINS_TEXT: '#ffd700',
    COMBO_TEXT: '#ff8800',
    BLOCKED_TEXT: '#00ffff',
    CRITICAL_TEXT: '#ffff00',
    
    // UI
    HEALTH_BAR_BG: '#ff0000',
    HEALTH_BAR_FILL: '#00ff00',
    MANA_BAR_GRADIENT_START: '#0066ff',
    MANA_BAR_GRADIENT_END: '#00ccff',
    
    // Abilities
    FIREBALL: '#ff4400',
    LIGHTNING: '#ffff00',
    SHIELD: 'rgba(68, 255, 255, ',
    FREEZE: '#00ffff',
    METEOR: '#ff4400',
    
    // Misc
    ENEMY_OUTLINE: '#000000',
    WHITE: '#ffffff',
    BLACK: '#000000'
  };
  
  // Input key mappings
  export const KEY_BINDINGS = {
    MOVE_UP: 'w',
    MOVE_LEFT: 'a',
    MOVE_DOWN: 's',
    MOVE_RIGHT: 'd',
    HEAL: ' ',
    LIGHTNING: 'q',
    SHIELD: 'e',
    PAUSE: 'p',
    RESTART: 'r'
  };
  
  // Game state keys for easier refactoring
  export const GAME_STATES = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
  };
  
  // Spawn positions for enemies
  export const SPAWN_POSITIONS = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3
  };