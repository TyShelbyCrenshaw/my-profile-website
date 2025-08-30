// Ability casting and management system
import { ProjectileFactory } from '../entities/Projectile.js';
import { ParticleEffects } from '../entities/Particle.js';
import { COLORS, KEY_BINDINGS } from '../constants/gameConstants.js';

export class AbilityManager {
  constructor(abilities, setAbilities) {
    this.abilities = abilities;
    this.setAbilities = setAbilities;
    
    // Ability queue for combo system
    this.abilityQueue = [];
    this.comboWindow = 500; // milliseconds
    
    // Global cooldown
    this.globalCooldown = 0;
    this.globalCooldownMax = 200; // milliseconds
    
    // Ability callbacks
    this.callbacks = {
      onCast: null,
      onCooldownStart: null,
      onCooldownEnd: null,
      onManaInsufficient: null
    };
    
    // Ability upgrade tracking
    this.upgradeHistory = new Map();
  }

  // Register callbacks
  onCast(callback) {
    this.callbacks.onCast = callback;
  }

  onCooldownStart(callback) {
    this.callbacks.onCooldownStart = callback;
  }

  onCooldownEnd(callback) {
    this.callbacks.onCooldownEnd = callback;
  }

  onManaInsufficient(callback) {
    this.callbacks.onManaInsufficient = callback;
  }

  // Update ability cooldowns and durations
  update(deltaTime) {
    // Update global cooldown
    if (this.globalCooldown > 0) {
      this.globalCooldown = Math.max(0, this.globalCooldown - deltaTime);
    }
    
    // Update each ability
    let hasChanges = false;
    
    Object.keys(this.abilities).forEach(abilityName => {
      const ability = this.abilities[abilityName];
      
      // Update cooldown
      if (ability.cooldown > 0) {
        const wasOnCooldown = ability.cooldown > 0;
        ability.cooldown = Math.max(0, ability.cooldown - deltaTime);
        
        if (wasOnCooldown && ability.cooldown === 0) {
          // Cooldown just ended
          if (this.callbacks.onCooldownEnd) {
            this.callbacks.onCooldownEnd(abilityName);
          }
          hasChanges = true;
        }
      }
      
      // Update duration (for buff abilities)
      if (ability.duration !== undefined && ability.duration > 0) {
        ability.duration = Math.max(0, ability.duration - deltaTime);
        hasChanges = true;
      }
    });
    
    // Update ability combo queue
    this.updateComboQueue(deltaTime);
    
    return hasChanges;
  }

  // Update combo queue
  updateComboQueue(deltaTime) {
    this.abilityQueue = this.abilityQueue.filter(entry => {
      entry.time += deltaTime;
      return entry.time < this.comboWindow;
    });
  }

  // Check if ability can be cast
  canCast(abilityName, player) {
    const ability = this.abilities[abilityName];
    if (!ability) return false;
    
    // Check if unlocked (for abilities that need to be purchased)
    if (ability.unlocked === false) {
      return false;
    }
    
    // Check cooldown
    if (ability.cooldown > 0 || this.globalCooldown > 0) {
      return false;
    }
    
    // Check mana
    if (player.mana < ability.manaCost) {
      if (this.callbacks.onManaInsufficient) {
        this.callbacks.onManaInsufficient(abilityName, ability.manaCost, player.mana);
      }
      return false;
    }
    
    // Check if player is alive
    if (!player.isAlive()) {
      return false;
    }
    
    return true;
  }

  // Cast an ability
  cast(abilityName, player, target, gameState) {
    if (!this.canCast(abilityName, player)) {
      return null;
    }
    
    const ability = this.abilities[abilityName];
    let result = null;
    
    // Deduct mana
    player.useMana(ability.manaCost);
    
    // Add to combo queue
    this.abilityQueue.push({ ability: abilityName, time: 0 });
    
    // Cast the specific ability
    switch (abilityName) {
      case 'fireball':
        result = this.castFireball(ability, player, target, gameState);
        break;
        
      case 'heal':
        result = this.castHeal(ability, player, gameState);
        break;
        
      case 'shield':
        result = this.castShield(ability, player, gameState);
        break;
        
      case 'lightning':
        result = this.castLightning(ability, player, gameState);
        break;
        
      case 'meteor':
        result = this.castMeteor(ability, player, target, gameState);
        break;
        
      case 'freeze':
        result = this.castFreeze(ability, player, gameState);
        break;
        
      default:
        break;
    }
    
    // Start cooldown
    this.startCooldown(abilityName);
    
    // Trigger cast callback
    if (this.callbacks.onCast) {
      this.callbacks.onCast(abilityName, result);
    }
    
    return result;
  }

  // Start ability cooldown
  startCooldown(abilityName) {
    const ability = this.abilities[abilityName];
    ability.cooldown = ability.maxCooldown;
    
    // Start global cooldown
    this.globalCooldown = this.globalCooldownMax;
    
    if (this.callbacks.onCooldownStart) {
      this.callbacks.onCooldownStart(abilityName, ability.maxCooldown);
    }
  }

  // Individual ability implementations
  castFireball(ability, player, target, gameState) {
    const projectile = ProjectileFactory.createFireball(
      player.x,
      player.y,
      target.x,
      target.y,
      ability.damage * player.tempEffects.damageMultiplier
    );
    
    return {
      type: 'projectile',
      projectile,
      particles: ParticleEffects.magicCast(player.x, player.y, COLORS.FIREBALL)
    };
  }

  castHeal(ability, player, gameState) {
    const healAmount = player.heal(ability.healAmount);
    
    return {
      type: 'instant',
      effect: 'heal',
      amount: healAmount,
      particles: ParticleEffects.heal(player.x, player.y),
      floatingText: {
        x: player.x,
        y: player.y - 20,
        text: `+${healAmount}`,
        color: COLORS.HEAL_TEXT,
        duration: 1000
      }
    };
  }

  castShield(ability, player, gameState) {
    // Activate shield
    ability.duration = ability.maxDuration;
    
    return {
      type: 'buff',
      effect: 'shield',
      duration: ability.maxDuration,
      particles: ParticleEffects.magicCast(player.x, player.y, COLORS.SHIELD + '1)')
    };
  }

  castLightning(ability, player, gameState) {
    // Find closest enemy
    let closestEnemy = null;
    let closestDistance = Infinity;
    
    gameState.enemies.forEach(enemy => {
      if (!enemy.isAlive) return;
      
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < ability.range && distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });
    
    if (!closestEnemy) {
      // Refund mana if no target
      player.restoreMana(ability.manaCost);
      ability.cooldown = 0; // Reset cooldown
      this.setAbilities({...this.abilities});
      return null;
    }
    
    const projectile = ProjectileFactory.createLightning(
      player.x,
      player.y,
      closestEnemy,
      ability.damage * player.tempEffects.damageMultiplier,
      ability.chainCount || 0
    );
    
    return {
      type: 'projectile',
      projectile,
      target: closestEnemy,
      particles: ParticleEffects.magicCast(player.x, player.y, COLORS.LIGHTNING)
    };
  }

  castMeteor(ability, player, target, gameState) {
    // Create delayed meteor impact
    const meteorData = {
      targetX: target.x,
      targetY: target.y,
      damage: ability.damage * player.tempEffects.damageMultiplier,
      delay: ability.warningDuration
    };
    
    return {
      type: 'delayed',
      effect: 'meteor',
      data: meteorData,
      warningParticles: ParticleEffects.magicCast(target.x, target.y, COLORS.METEOR),
      floatingText: {
        x: target.x,
        y: target.y - 50,
        text: 'INCOMING!',
        color: COLORS.METEOR,
        duration: 1500
      }
    };
  }

  castFreeze(ability, player, gameState) {
    // Freeze all enemies
    const frozenEnemies = [];
    
    gameState.enemies.forEach(enemy => {
      if (enemy.isAlive) {
        enemy.freeze(ability.duration);
        frozenEnemies.push(enemy);
      }
    });
    
    return {
      type: 'instant',
      effect: 'freeze',
      targets: frozenEnemies,
      particles: ParticleEffects.explosion(player.x, player.y, COLORS.FREEZE, 1.5),
      floatingText: {
        x: player.x,
        y: player.y - 30,
        text: 'TIME FREEZE!',
        color: COLORS.FREEZE,
        duration: 2000
      }
    };
  }

  // Get ability by key binding
  getAbilityByKey(key) {
    switch (key.toLowerCase()) {
      case KEY_BINDINGS.HEAL:
        return 'heal';
      case KEY_BINDINGS.LIGHTNING:
        return 'lightning';
      case KEY_BINDINGS.SHIELD:
        return 'shield';
      default:
        return null;
    }
  }

  // Get cooldown percentage (0-1)
  getCooldownPercent(abilityName) {
    const ability = this.abilities[abilityName];
    if (!ability || ability.cooldown === 0) return 0;
    
    return ability.cooldown / ability.maxCooldown;
  }

  // Check if ability is on cooldown
  isOnCooldown(abilityName) {
    const ability = this.abilities[abilityName];
    return ability && ability.cooldown > 0;
  }

  // Check if ability is active (for buffs)
  isActive(abilityName) {
    const ability = this.abilities[abilityName];
    return ability && ability.duration !== undefined && ability.duration > 0;
  }

  // Get remaining duration for buff abilities
  getRemainingDuration(abilityName) {
    const ability = this.abilities[abilityName];
    if (!ability || ability.duration === undefined) return 0;
    
    return ability.duration;
  }

  // Upgrade an ability
  upgradeAbility(abilityName, upgrades) {
    const ability = this.abilities[abilityName];
    if (!ability) return false;
    
    // Track upgrade history
    if (!this.upgradeHistory.has(abilityName)) {
      this.upgradeHistory.set(abilityName, []);
    }
    
    const history = this.upgradeHistory.get(abilityName);
    
    // Apply upgrades
    Object.entries(upgrades).forEach(([key, value]) => {
      if (key === 'cooldownReduction') {
        ability.maxCooldown = Math.max(100, ability.maxCooldown - value);
      } else if (key === 'level') {
        ability.level = (ability.level || 1) + value;
      } else {
        ability[key] = (ability[key] || 0) + value;
      }
      
      history.push({ key, value, timestamp: Date.now() });
    });
    
    return true;
  }

  // Reset all cooldowns
  resetCooldowns() {
    Object.values(this.abilities).forEach(ability => {
      ability.cooldown = 0;
      if (ability.duration !== undefined) {
        ability.duration = 0;
      }
    });
    
    this.globalCooldown = 0;
  }

  // Get ability stats for UI
  getAbilityStats(abilityName) {
    const ability = this.abilities[abilityName];
    if (!ability) return null;
    
    return {
      name: abilityName,
      level: ability.level || 1,
      damage: ability.damage || 0,
      healAmount: ability.healAmount || 0,
      manaCost: ability.manaCost,
      cooldown: ability.maxCooldown / 1000, // Convert to seconds
      range: ability.range || 0,
      unlocked: ability.unlocked !== false,
      description: this.getAbilityDescription(abilityName)
    };
  }

  // Get ability description
  getAbilityDescription(abilityName) {
    const descriptions = {
      fireball: 'Launch a fiery projectile at target location',
      heal: 'Restore health instantly',
      shield: 'Create a protective barrier that blocks all damage',
      lightning: 'Strike the nearest enemy with lightning',
      meteor: 'Call down a devastating meteor strike',
      freeze: 'Freeze all enemies in place temporarily'
    };
    
    return descriptions[abilityName] || 'Unknown ability';
  }

  // Get combo string
  getComboString() {
    if (this.abilityQueue.length === 0) return '';
    
    return this.abilityQueue
      .map(entry => entry.ability.charAt(0).toUpperCase())
      .join('-');
  }

  // Check for special combos
  checkCombo() {
    const comboString = this.getComboString();
    
    // Define special combos
    const combos = {
      'F-F-L': { name: 'Lightning Storm', bonus: 1.5 },
      'S-H-S': { name: 'Divine Protection', bonus: 2.0 },
      'L-F-M': { name: 'Elemental Fury', bonus: 1.8 }
    };
    
    return combos[comboString] || null;
  }
}

// Singleton instance
let abilityManagerInstance = null;

export function createAbilityManager(abilities, setAbilities) {
  abilityManagerInstance = new AbilityManager(abilities, setAbilities);
  return abilityManagerInstance;
}

export function getAbilityManager() {
  return abilityManagerInstance;
}

export default AbilityManager;