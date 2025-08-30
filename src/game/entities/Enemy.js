// Enemy entity class with AI behavior
import { ENEMY_TYPES, GAME_CONFIG } from '../constants/gameConstants.js';

export class Enemy {
  constructor(type, position, wave = 1) {
    const enemyData = ENEMY_TYPES[type] || ENEMY_TYPES.slime;
    
    // Position
    this.x = position.x;
    this.y = position.y;
    
    // Enemy type and properties
    this.type = type;
    this.size = enemyData.size;
    this.color = enemyData.color;
    this.points = enemyData.points;
    
    // Stats that scale with wave
    this.health = enemyData.health + Math.floor(wave * 5);
    this.maxHealth = this.health;
    this.speed = enemyData.speed + (wave * 0.1);
    this.damage = enemyData.damage + Math.floor(wave * 2);
    
    // Store original speed for freeze effects
    this.originalSpeed = this.speed;
    
    // State
    this.isAlive = true;
    this.lastDamageTime = 0;
    this.frozen = 0;
    
    // Unique ID for tracking
    this.id = `${type}_${Date.now()}_${Math.random()}`;
    
    // Movement
    this.velocity = { x: 0, y: 0 };
    
    // AI state
    this.aiState = 'chase'; // 'chase', 'flee', 'wander'
    this.aiTimer = 0;
  }

  // Update enemy AI and movement
  update(deltaTime, playerPosition, enemies) {
    // Update timers
    if (this.lastDamageTime > 0) {
      this.lastDamageTime -= deltaTime;
    }
    
    // Handle freeze effect
    if (this.frozen > 0) {
      this.frozen -= deltaTime;
      if (this.frozen <= 0) {
        this.speed = this.originalSpeed;
        this.frozen = 0;
      }
      return; // Don't move while frozen
    }
    
    // AI behavior based on enemy type
    this.updateAI(deltaTime, playerPosition, enemies);
    
    // Apply movement
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    // Keep enemy in bounds (with some margin to allow entry from edges)
    const margin = this.size;
    this.x = Math.max(-margin, Math.min(GAME_CONFIG.CANVAS_WIDTH + margin, this.x));
    this.y = Math.max(-margin, Math.min(GAME_CONFIG.CANVAS_HEIGHT + margin, this.y));
  }

  // Update AI behavior
  updateAI(deltaTime, playerPosition, enemies) {
    switch (this.type) {
      case 'slime':
        this.basicChaseAI(playerPosition);
        break;
        
      case 'orc':
        this.aggressiveChaseAI(playerPosition);
        break;
        
      case 'golem':
        this.tankAI(playerPosition, deltaTime);
        break;
        
      case 'demon':
        this.erraticAI(playerPosition, deltaTime);
        break;
        
      case 'boss':
        this.bossAI(playerPosition, enemies, deltaTime);
        break;
        
      default:
        this.basicChaseAI(playerPosition);
    }
  }

  // Basic chase AI - moves directly toward player
  basicChaseAI(playerPosition) {
    const dx = playerPosition.x - this.x;
    const dy = playerPosition.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      this.velocity.x = normalizedDx * this.speed;
      this.velocity.y = normalizedDy * this.speed;
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
  }

  // Aggressive chase - faster when player is far
  aggressiveChaseAI(playerPosition) {
    const dx = playerPosition.x - this.x;
    const dy = playerPosition.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      // Speed up when far from player
      const speedMultiplier = distance > 200 ? 1.5 : 1;
      
      this.velocity.x = normalizedDx * this.speed * speedMultiplier;
      this.velocity.y = normalizedDy * this.speed * speedMultiplier;
    }
  }

  // Tank AI - slow but steady, occasional charge
  tankAI(playerPosition, deltaTime) {
    this.aiTimer += deltaTime;
    
    const dx = playerPosition.x - this.x;
    const dy = playerPosition.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Charge every 3 seconds if close enough
    const isCharging = this.aiTimer % 3000 < 500 && distance < 150;
    
    if (distance > 1) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      const currentSpeed = isCharging ? this.speed * 2.5 : this.speed;
      
      this.velocity.x = normalizedDx * currentSpeed;
      this.velocity.y = normalizedDy * currentSpeed;
    }
  }

  // Erratic AI - unpredictable movement
  erraticAI(playerPosition, deltaTime) {
    this.aiTimer += deltaTime;
    
    const dx = playerPosition.x - this.x;
    const dy = playerPosition.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
      let normalizedDx = dx / distance;
      let normalizedDy = dy / distance;
      
      // Add random movement every 0.5 seconds
      if (this.aiTimer > 500) {
        this.aiTimer = 0;
        const randomAngle = (Math.random() - 0.5) * Math.PI * 0.5;
        const cos = Math.cos(randomAngle);
        const sin = Math.sin(randomAngle);
        
        const newDx = normalizedDx * cos - normalizedDy * sin;
        const newDy = normalizedDx * sin + normalizedDy * cos;
        
        normalizedDx = newDx;
        normalizedDy = newDy;
      }
      
      this.velocity.x = normalizedDx * this.speed;
      this.velocity.y = normalizedDy * this.speed;
    }
  }

  // Boss AI - complex behavior
  bossAI(playerPosition, enemies, deltaTime) {
    this.aiTimer += deltaTime;
    
    const dx = playerPosition.x - this.x;
    const dy = playerPosition.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Phase based on health
    const healthPercent = this.health / this.maxHealth;
    
    if (healthPercent > 0.5) {
      // Phase 1: Normal chase with occasional retreats
      if (this.aiTimer % 4000 < 3000) {
        this.basicChaseAI(playerPosition);
      } else {
        // Retreat
        if (distance > 1) {
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;
          
          this.velocity.x = -normalizedDx * this.speed * 0.5;
          this.velocity.y = -normalizedDy * this.speed * 0.5;
        }
      }
    } else {
      // Phase 2: Aggressive with speed boost
      const speedBoost = 1.5;
      this.speed = this.originalSpeed * speedBoost;
      this.aggressiveChaseAI(playerPosition);
    }
  }

  // Take damage
  takeDamage(amount) {
    console.log(`${this.constructor.name} taking ${amount} damage. Health before: ${this.health}`);
    if (!this.isAlive) return 0;
    
    const actualDamage = Math.min(this.health, amount);
    this.health -= actualDamage;
    this.lastDamageTime = GAME_CONFIG.DAMAGE_FLASH_DURATION;
    
    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
    console.log(`Health after: ${this.health}`);
    return actualDamage;
  }

  // Apply freeze effect
  freeze(duration) {
    this.frozen = duration;
    this.originalSpeed = this.speed;
    this.speed = 0;
  }

  // Apply knockback
  knockback(fromX, fromY, force) {
    const dx = this.x - fromX;
    const dy = this.y - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      this.x += normalizedDx * force;
      this.y += normalizedDy * force;
    }
  }

  // Check if enemy should flash (damage indicator)
  shouldFlash() {
    return this.lastDamageTime > 0;
  }

  // Get enemy bounds for collision
  getBounds() {
    const halfSize = this.size / 2;
    return {
      left: this.x - halfSize,
      right: this.x + halfSize,
      top: this.y - halfSize,
      bottom: this.y + halfSize,
      centerX: this.x,
      centerY: this.y,
      radius: halfSize
    };
  }

  // Get loot drop
  getLoot() {
    const loot = {
      points: this.points,
      experience: Math.floor(this.points / 10),
      coins: Math.floor(this.points / 20) + Math.floor(Math.random() * 3)
    };
    
    // Boss drops more loot
    if (this.type === 'boss') {
      loot.coins *= 2;
      loot.experience *= 2;
    }
    
    return loot;
  }

  // Check if enemy is on screen (for optimization)
  isOnScreen() {
    const margin = 50;
    return this.x > -margin && 
           this.x < GAME_CONFIG.CANVAS_WIDTH + margin &&
           this.y > -margin && 
           this.y < GAME_CONFIG.CANVAS_HEIGHT + margin;
  }

  // Get state for serialization
  getState() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      health: this.health,
      maxHealth: this.maxHealth,
      speed: this.speed,
      damage: this.damage,
      frozen: this.frozen,
      isAlive: this.isAlive
    };
  }
}

// Factory function to create enemy from spawn point
export function createEnemy(wave) {
  // Filter enemy types based on current wave
  const availableTypes = Object.entries(ENEMY_TYPES).filter(
    ([_, type]) => wave >= type.minWave
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

  // Random spawn position from edges
  const side = Math.floor(Math.random() * 4);
  let x, y;
  
  switch(side) {
    case 0: // Top
      x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
      y = -30;
      break;
    case 1: // Right
      x = GAME_CONFIG.CANVAS_WIDTH + 30;
      y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
      break;
    case 2: // Bottom
      x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
      y = GAME_CONFIG.CANVAS_HEIGHT + 30;
      break;
    case 3: // Left
      x = -30;
      y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
      break;
  }

  return new Enemy(selectedType, { x, y }, wave);
}

export default Enemy;