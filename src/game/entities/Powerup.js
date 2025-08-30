// Powerup entity class
import { POWERUP_TYPES, VISUAL_CONFIG, GAME_CONFIG } from '../constants/gameConstants.js';

export class Powerup {
  constructor(type, position) {
    const powerupData = POWERUP_TYPES[type] || POWERUP_TYPES.health;
    
    // Position
    this.x = position.x;
    this.y = position.y;
    
    // Type and properties
    this.type = type;
    this.color = powerupData.color;
    this.effect = powerupData.effect;
    this.value = powerupData.value;
    this.duration = powerupData.duration;
    this.icon = powerupData.icon;
    this.description = powerupData.description;
    
    // Visual properties
    this.size = VISUAL_CONFIG.POWERUP_BASE_SIZE;
    this.pulsePhase = Math.random() * Math.PI * 2; // Random start phase for pulse
    this.bobPhase = Math.random() * Math.PI * 2; // Random start phase for bobbing
    this.rotation = 0;
    this.glowIntensity = 0;
    
    // State
    this.isActive = true;
    this.lifetime = 10000; // 10 seconds before disappearing
    this.fadeStartTime = 8000; // Start fading after 8 seconds
    
    // Physics (optional floating movement)
    this.vx = 0;
    this.vy = 0;
    this.targetX = this.x;
    this.targetY = this.y;
    
    // Attraction to player
    this.attractionRadius = 100;
    this.attractionSpeed = 3;
    this.isAttracted = false;
    
    // Unique ID
    this.id = `powerup_${type}_${Date.now()}_${Math.random()}`;
  }

  // Update powerup state
  update(deltaTime, playerPosition) {
    if (!this.isActive) return;
    
    // Update lifetime
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.isActive = false;
      return;
    }
    
    // Update visual effects
    this.updateVisualEffects(deltaTime);
    
    // Check attraction to player
    if (playerPosition) {
      this.updateAttraction(playerPosition, deltaTime);
    }
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Apply friction
    this.vx *= 0.95;
    this.vy *= 0.95;
  }

  // Update visual effects
  updateVisualEffects(deltaTime) {
    const time = Date.now() * 0.001; // Convert to seconds
    
    // Pulse effect
    this.pulsePhase = time * VISUAL_CONFIG.POWERUP_PULSE_SPEED;
    
    // Bobbing effect
    this.bobPhase = time * 2;
    
    // Rotation
    this.rotation += deltaTime * 0.001;
    
    // Glow intensity based on lifetime
    if (this.lifetime < this.fadeStartTime) {
      this.glowIntensity = Math.sin(time * 10) * 0.5 + 0.5; // Fast pulsing when about to disappear
    } else {
      this.glowIntensity = Math.sin(time * 3) * 0.3 + 0.7; // Gentle pulsing
    }
  }

  // Update attraction to player
  updateAttraction(playerPosition, deltaTime) {
    const dx = playerPosition.x - this.x;
    const dy = playerPosition.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Start attraction when player is close
    if (distance < this.attractionRadius) {
      this.isAttracted = true;
    }
    
    // Once attracted, move toward player
    if (this.isAttracted && distance > 5) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      // Accelerate toward player
      const speed = this.attractionSpeed * (1 - distance / this.attractionRadius);
      this.vx += normalizedDx * speed;
      this.vy += normalizedDy * speed;
      
      // Limit max velocity
      const maxSpeed = 8;
      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (currentSpeed > maxSpeed) {
        this.vx = (this.vx / currentSpeed) * maxSpeed;
        this.vy = (this.vy / currentSpeed) * maxSpeed;
      }
    }
  }

  // Get visual properties for rendering
  getVisualProperties() {
    // Calculate pulse size
    const pulse = Math.sin(this.pulsePhase) * VISUAL_CONFIG.POWERUP_PULSE_AMPLITUDE + 1;
    const size = this.size * pulse;
    
    // Calculate bob offset
    const bobOffset = Math.sin(this.bobPhase) * 3;
    
    // Calculate alpha based on lifetime
    let alpha = 1;
    if (this.lifetime < 2000) {
      alpha = this.lifetime / 2000;
    }
    
    return {
      x: this.x,
      y: this.y + bobOffset,
      size,
      color: this.color,
      rotation: this.rotation,
      alpha,
      glowIntensity: this.glowIntensity * 10,
      isFlashing: this.lifetime < this.fadeStartTime
    };
  }

  // Check if powerup can be collected
  canCollect(playerPosition) {
    if (!this.isActive) return false;
    
    const dx = playerPosition.x - this.x;
    const dy = playerPosition.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const collectionRadius = 25; // Slightly larger than visual size
    return distance < collectionRadius;
  }

  // Get collection effect data
  getCollectionEffect() {
    return {
      type: this.effect,
      value: this.value,
      duration: this.duration,
      color: this.color,
      icon: this.icon,
      description: this.description
    };
  }

  // Apply effect to player
  applyEffect(player, tempEffectsRef) {
    switch (this.effect) {
      case 'heal':
        return {
          type: 'heal',
          amount: player.heal(this.value),
          message: `+${this.value} HP`
        };
        
      case 'mana':
        return {
          type: 'mana',
          amount: player.restoreMana(this.value),
          message: `+${this.value} MP`
        };
        
      case 'experience':
        player.addExperience(this.value);
        return {
          type: 'experience',
          amount: this.value,
          message: `+${this.value} XP`
        };
        
      case 'tempSpeed':
        player.applyTempEffect('speed', this.value, this.duration);
        return {
          type: 'buff',
          effect: 'speed',
          message: 'SPEED UP!'
        };
        
      case 'tempDamage':
        player.applyTempEffect('damage', this.value, this.duration);
        return {
          type: 'buff',
          effect: 'damage',
          message: 'DAMAGE UP!'
        };
        
      default:
        return {
          type: 'unknown',
          message: 'Collected!'
        };
    }
  }

  // Get bounds for collision
  getBounds() {
    return {
      centerX: this.x,
      centerY: this.y,
      radius: 15
    };
  }

  // Get state for serialization
  getState() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      lifetime: this.lifetime,
      isActive: this.isActive
    };
  }
}

// Factory function to create random powerup
export function createRandomPowerup(position) {
  const types = Object.keys(POWERUP_TYPES);
  const weights = {
    health: 0.3,
    mana: 0.25,
    experience: 0.25,
    speed: 0.1,
    damage: 0.1
  };
  
  // Weighted random selection
  let random = Math.random();
  let selectedType = 'health';
  
  for (const type of types) {
    random -= weights[type] || 0.2;
    if (random <= 0) {
      selectedType = type;
      break;
    }
  }
  
  return new Powerup(selectedType, position);
}

// Spawn powerup at random position
export function spawnPowerupRandom() {
  const margin = 50;
  const position = {
    x: margin + Math.random() * (GAME_CONFIG.CANVAS_WIDTH - margin * 2),
    y: margin + Math.random() * (GAME_CONFIG.CANVAS_HEIGHT - margin * 2)
  };
  
  return createRandomPowerup(position);
}

// Spawn powerup from defeated enemy
export function spawnPowerupFromEnemy(enemy) {
  // Chance to spawn powerup based on enemy type
  const dropChances = {
    slime: 0.1,
    orc: 0.15,
    golem: 0.2,
    demon: 0.25,
    boss: 0.5
  };
  
  const dropChance = dropChances[enemy.type] || 0.1;
  
  if (Math.random() < dropChance) {
    return createRandomPowerup({ x: enemy.x, y: enemy.y });
  }
  
  return null;
}

// Powerup manager class
export class PowerupManager {
  constructor() {
    this.powerups = [];
    this.spawnTimer = 0;
    this.spawnInterval = 15000; // Spawn every 15 seconds
    this.maxPowerups = 5;
  }

  // Update all powerups
  update(deltaTime, playerPosition) {
    // Update existing powerups
    this.powerups = this.powerups.filter(powerup => {
      powerup.update(deltaTime, playerPosition);
      return powerup.isActive;
    });
    
    // Update spawn timer
    this.spawnTimer += deltaTime;
    
    // Spawn new powerup if needed
    if (this.spawnTimer >= this.spawnInterval && this.powerups.length < this.maxPowerups) {
      this.spawnTimer = 0;
      this.spawnPowerup();
    }
  }

  // Spawn a new powerup
  spawnPowerup() {
    const powerup = spawnPowerupRandom();
    this.powerups.push(powerup);
  }

  // Add powerup from external source (like enemy death)
  addPowerup(powerup) {
    if (powerup && this.powerups.length < this.maxPowerups * 2) {
      this.powerups.push(powerup);
    }
  }

  // Check collection with player
  checkCollection(playerPosition, player, tempEffectsRef) {
    const collected = [];
    
    this.powerups = this.powerups.filter(powerup => {
      if (powerup.canCollect(playerPosition)) {
        const effect = powerup.applyEffect(player, tempEffectsRef);
        collected.push({
          powerup,
          effect,
          position: { x: powerup.x, y: powerup.y }
        });
        return false; // Remove from array
      }
      return true; // Keep in array
    });
    
    return collected;
  }

  // Render all powerups
  render(ctx) {
    this.powerups.forEach(powerup => {
      const visual = powerup.getVisualProperties();
      
      ctx.save();
      ctx.globalAlpha = visual.alpha;
      
      // Draw glow
      if (visual.glowIntensity > 0) {
        ctx.shadowColor = visual.color;
        ctx.shadowBlur = visual.glowIntensity;
      }
      
      // Draw powerup
      ctx.fillStyle = visual.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      
      ctx.translate(visual.x, visual.y);
      ctx.rotate(visual.rotation);
      
      // Draw shape
      ctx.beginPath();
      ctx.arc(0, 0, visual.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw icon (simplified)
      ctx.fillStyle = '#ffffff';
      ctx.font = `${visual.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(powerup.icon, 0, 0);
      
      ctx.restore();
    });
  }

  // Clear all powerups
  clear() {
    this.powerups = [];
    this.spawnTimer = 0;
  }

  // Get powerup count
  getCount() {
    return this.powerups.length;
  }
}

export default Powerup;