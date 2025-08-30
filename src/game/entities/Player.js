// Player entity class with proper state management
import { GAME_CONFIG, LEVEL_UP_BONUSES } from '../constants/gameConstants.js';

export class Player {
  constructor(initialState = {}) {
    // Initialize with default values or provided state
    this.x = initialState.x || GAME_CONFIG.PLAYER_INITIAL_X;
    this.y = initialState.y || GAME_CONFIG.PLAYER_INITIAL_Y;
    this.health = initialState.health || GAME_CONFIG.PLAYER_BASE_HEALTH;
    this.maxHealth = initialState.maxHealth || GAME_CONFIG.PLAYER_BASE_HEALTH;
    this.mana = initialState.mana || GAME_CONFIG.PLAYER_BASE_MANA;
    this.maxMana = initialState.maxMana || GAME_CONFIG.PLAYER_BASE_MANA;
    this.level = initialState.level || 1;
    this.experience = initialState.experience || 0;
    this.experienceToNext = initialState.experienceToNext || 100;
    this.speed = initialState.speed || GAME_CONFIG.PLAYER_BASE_SPEED;
    this.damage = initialState.damage || GAME_CONFIG.PLAYER_BASE_DAMAGE;
    this.critChance = initialState.critChance || GAME_CONFIG.PLAYER_BASE_CRIT_CHANCE;
    this.critMultiplier = initialState.critMultiplier || GAME_CONFIG.PLAYER_BASE_CRIT_MULTIPLIER;
    this.coins = initialState.coins || 0;
    
    // Temporary effects
    this.tempEffects = {
      speedMultiplier: 1,
      damageMultiplier: 1,
      speedDuration: 0,
      damageDuration: 0
    };
    
    // Movement state
    this.velocity = { x: 0, y: 0 };
  }

  // Update player movement based on input
  updateMovement(keys, deltaTime) {
    let dx = 0;
    let dy = 0;

    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    // Apply speed with temporary effects
    const effectiveSpeed = this.speed * this.tempEffects.speedMultiplier;
    this.velocity.x = dx * effectiveSpeed;
    this.velocity.y = dy * effectiveSpeed;

    // Update position with bounds checking
    this.x = Math.max(
      GAME_CONFIG.PLAYER_SIZE / 2,
      Math.min(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_SIZE / 2, 
               this.x + this.velocity.x)
    );
    this.y = Math.max(
      GAME_CONFIG.PLAYER_SIZE / 2,
      Math.min(GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_SIZE / 2, 
               this.y + this.velocity.y)
    );
  }

  // Update temporary effects
  updateTempEffects(deltaTime) {
    if (this.tempEffects.speedDuration > 0) {
      this.tempEffects.speedDuration -= deltaTime;
      if (this.tempEffects.speedDuration <= 0) {
        this.tempEffects.speedMultiplier = 1;
      }
    }

    if (this.tempEffects.damageDuration > 0) {
      this.tempEffects.damageDuration -= deltaTime;
      if (this.tempEffects.damageDuration <= 0) {
        this.tempEffects.damageMultiplier = 1;
      }
    }
  }

  // Auto-regenerate mana
  regenerateMana(deltaTime) {
    if (this.mana < this.maxMana) {
      this.mana = Math.min(this.maxMana, this.mana + GAME_CONFIG.MANA_REGEN_RATE);
    }
  }

  // Main update method
  update(keys, deltaTime) {
    this.updateMovement(keys, deltaTime);
    this.updateTempEffects(deltaTime);
    this.regenerateMana(deltaTime);
  }

  // Take damage with knockback
  takeDamage(amount, enemyPosition) {
    const actualDamage = Math.max(0, amount);
    this.health = Math.max(0, this.health - actualDamage);

    // Calculate knockback
    const dx = this.x - enemyPosition.x;
    const dy = this.y - enemyPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      // Apply knockback
      this.x += normalizedDx * GAME_CONFIG.KNOCKBACK_FORCE_PLAYER;
      this.y += normalizedDy * GAME_CONFIG.KNOCKBACK_FORCE_PLAYER;

      // Keep player in bounds
      this.x = Math.max(
        GAME_CONFIG.PLAYER_SIZE / 2,
        Math.min(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_SIZE / 2, this.x)
      );
      this.y = Math.max(
        GAME_CONFIG.PLAYER_SIZE / 2,
        Math.min(GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_SIZE / 2, this.y)
      );
    }

    return actualDamage;
  }

  // Heal the player
  heal(amount) {
    const actualHeal = Math.min(amount, this.maxHealth - this.health);
    this.health = Math.min(this.maxHealth, this.health + amount);
    return actualHeal;
  }

  restoreMana(amount) {
    if (!this.isAlive()) return 0; // Can't restore mana if not alive
    const actualRestore = Math.min(amount, this.maxMana - this.mana);
    this.mana = Math.min(this.maxMana, this.mana + amount); // Ensure you don't exceed maxMana
    return actualRestore; // Return the amount actually restored
  }

  // Make sure useMana is also robust
  useMana(amount) {
    if (this.mana >= amount) {
      this.mana -= amount;
      return true;
    }
    return false;
  }

  // Add experience and check for level up
  addExperience(amount) {
    this.experience += amount;
    let levelsGained = 0;

    while (this.experience >= this.experienceToNext) {
      this.experience -= this.experienceToNext;
      this.level += 1;
      levelsGained += 1;
      this.experienceToNext = this.level * LEVEL_UP_BONUSES.experienceMultiplier;

      // Apply level up bonuses
      this.maxHealth += LEVEL_UP_BONUSES.healthIncrease;
      this.health = this.maxHealth; // Full heal on level up
      this.maxMana += LEVEL_UP_BONUSES.manaIncrease;
      this.mana = this.maxMana; // Full mana restore on level up
      this.damage += LEVEL_UP_BONUSES.damageIncrease;
    }

    return levelsGained;
  }

  // Add coins
  addCoins(amount) {
    this.coins += amount;
    return this.coins;
  }

  // Spend coins
  spendCoins(amount) {
    if (this.coins >= amount) {
      this.coins -= amount;
      return true;
    }
    return false;
  }

  // Apply temporary effect
  applyTempEffect(type, multiplier, duration) {
    switch (type) {
      case 'speed':
        this.tempEffects.speedMultiplier = multiplier;
        this.tempEffects.speedDuration = duration;
        break;
      case 'damage':
        this.tempEffects.damageMultiplier = multiplier;
        this.tempEffects.damageDuration = duration;
        break;
    }
  }

  // Get effective damage (with temp effects and crit)
  getEffectiveDamage() {
    let damage = this.damage * this.tempEffects.damageMultiplier;
    
    // Check for critical hit
    const isCrit = Math.random() < this.critChance;
    if (isCrit) {
      damage *= this.critMultiplier;
    }

    return {
      damage: Math.floor(damage),
      isCrit
    };
  }

  // Check if player is alive
  isAlive() {
    return this.health > 0;
  }

  // Get player state for saving/serialization
  getState() {
    return {
      x: this.x,
      y: this.y,
      health: this.health,
      maxHealth: this.maxHealth,
      mana: this.mana,
      maxMana: this.maxMana,
      level: this.level,
      experience: this.experience,
      experienceToNext: this.experienceToNext,
      speed: this.speed,
      damage: this.damage,
      critChance: this.critChance,
      critMultiplier: this.critMultiplier,
      coins: this.coins
    };
  }

  // Reset player to initial state
  reset(initialState = {}) {
    this.x = initialState.x || GAME_CONFIG.PLAYER_INITIAL_X;
    this.y = initialState.y || GAME_CONFIG.PLAYER_INITIAL_Y;
    this.health = initialState.health || GAME_CONFIG.PLAYER_BASE_HEALTH;
    this.maxHealth = initialState.maxHealth || GAME_CONFIG.PLAYER_BASE_HEALTH;
    this.mana = initialState.mana || GAME_CONFIG.PLAYER_BASE_MANA;
    this.maxMana = initialState.maxMana || GAME_CONFIG.PLAYER_BASE_MANA;
    this.level = initialState.level || 1;
    this.experience = initialState.experience || 0;
    this.experienceToNext = initialState.experienceToNext || 100;
    this.speed = initialState.speed || GAME_CONFIG.PLAYER_BASE_SPEED;
    this.damage = initialState.damage || GAME_CONFIG.PLAYER_BASE_DAMAGE;
    this.critChance = initialState.critChance || GAME_CONFIG.PLAYER_BASE_CRIT_CHANCE;
    this.critMultiplier = initialState.critMultiplier || GAME_CONFIG.PLAYER_BASE_CRIT_MULTIPLIER;
    this.coins = initialState.coins || 0;
    
    // Reset temporary effects
    this.tempEffects = {
      speedMultiplier: 1,
      damageMultiplier: 1,
      speedDuration: 0,
      damageDuration: 0
    };
    
    this.velocity = { x: 0, y: 0 };
  }
}

export default Player;