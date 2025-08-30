// Collision detection and resolution system
import { GAME_CONFIG } from '../constants/gameConstants.js';

export class CollisionSystem {
  constructor() {
    // Collision event callbacks
    this.callbacks = {
      playerEnemy: null,
      projectileEnemy: null,
      playerPowerup: null,
      explosionEnemy: null,
      enemyEnemy: null
    };
    
    // Spatial grid for optimization (optional)
    this.useGrid = true;
    this.gridSize = 100;
    this.grid = new Map();
  }

  // Register collision callbacks
  onPlayerEnemyCollision(callback) {
    this.callbacks.playerEnemy = callback;
  }

  onProjectileEnemyCollision(callback) {
    this.callbacks.projectileEnemy = callback;
  }

  onPlayerPowerupCollision(callback) {
    this.callbacks.playerPowerup = callback;
  }

  onExplosionEnemyCollision(callback) {
    this.callbacks.explosionEnemy = callback;
  }

  onEnemyEnemyCollision(callback) {
    this.callbacks.enemyEnemy = callback;
  }

  // Main collision check method
  checkCollisions(gameState, player, abilities) { // gameState is the full React gameState
    // No need for internal collisions object, just call callbacks directly
    // if (this.useGrid) { this.updateGrid(gameState, player); } // Grid can be complex, skip for now

    // Player vs Enemies
    if (this.callbacks.playerEnemy) {
      const playerBounds = this.getPlayerBounds(player);
      const hasShield = abilities.shield && abilities.shield.duration > 0;
      (gameState.enemies || []).forEach(enemy => {
        if (!enemy.isAlive) return;
        const enemyBounds = enemy.getBounds();
        if (this.checkCircleCollision(playerBounds, enemyBounds)) {
          this.callbacks.playerEnemy({ player, enemy, hasShield });
        }
      });
    }

    // Projectiles vs Enemies
    if (this.callbacks.projectileEnemy) {
      (gameState.projectiles || []).forEach(projectile => {
        if (!projectile.isActive) return;
        (gameState.enemies || []).forEach(enemy => {
          if (!enemy.isAlive) return;
          if (projectile.checkHit(enemy)) { // projectile.checkHit also marks itself inactive
            this.callbacks.projectileEnemy({ projectile, enemy });
          }
        });
      });
    }

    // Player vs Powerups
    if (this.callbacks.playerPowerup) {
        const playerBounds = this.getPlayerBounds(player);
        (gameState.powerups || []).forEach((powerup, index) => { // Index might not be needed if using ID
            if (!powerup.isActive) return;
            const powerupBounds = powerup.getBounds ? powerup.getBounds() : this.getPowerupBounds(powerup); // Use powerup's own getBounds if available
            if (this.checkCircleCollision(playerBounds, powerupBounds)) {
                this.callbacks.playerPowerup({ player, powerup });
            }
        });
    }

    // Explosions vs Enemies
    if (this.callbacks.explosionEnemy) {
        (gameState.explosions || []).forEach(explosion => {
            (gameState.enemies || []).forEach(enemy => {
                if (!enemy.isAlive) return;
                const dx = enemy.x - explosion.x;
                const dy = enemy.y - explosion.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < explosion.radius) {
                    const damagePercent = Math.max(0, 1 - (distance / explosion.radius));
                    this.callbacks.explosionEnemy({ explosion, enemy, distance, damagePercent });
                }
            });
        });
    }
    // No return needed as callbacks modify state via setGameState
  }

  // ... (checkCircleCollision, getPlayerBounds, getPowerupBounds as before)
  // Make sure getPowerupBounds is defined if Powerup class doesn't have its own getBounds
  getPowerupBounds(powerup) { // Add this if not present
    return {
      centerX: powerup.x,
      centerY: powerup.y,
      radius: powerup.size ? powerup.size / 2 : 15 // or a fixed collection radius
    };
  }

  // Check collisions between player and enemies
  checkPlayerEnemyCollisions(player, enemies, abilities, collisions) {
    const playerBounds = this.getPlayerBounds(player);
    
    // Check shield protection
    const hasShield = abilities.shield && abilities.shield.duration > 0;
    
    enemies.forEach(enemy => {
      if (!enemy.isAlive) return;
      
      const enemyBounds = enemy.getBounds();
      
      if (this.checkCircleCollision(playerBounds, enemyBounds)) {
        collisions.playerEnemy.push({
          player,
          enemy,
          hasShield
        });
      }
    });
  }

  // Check collisions between projectiles and enemies
  checkProjectileEnemyCollisions(projectiles, enemies, collisions) {
    projectiles.forEach(projectile => {
      if (!projectile.isActive) return;
      
      enemies.forEach(enemy => {
        if (!enemy.isAlive) return;
        
        if (projectile.checkHit(enemy)) {
          collisions.projectileEnemy.push({
            projectile,
            enemy,
            damage: projectile.damage
          });
        }
      });
    });
  }

  // Check collisions between player and powerups
  checkPlayerPowerupCollisions(player, powerups, collisions) {
    const playerBounds = this.getPlayerBounds(player);
    
    powerups.forEach((powerup, index) => {
      const powerupBounds = this.getPowerupBounds(powerup);
      
      if (this.checkCircleCollision(playerBounds, powerupBounds)) {
        collisions.playerPowerup.push({
          player,
          powerup,
          index
        });
      }
    });
  }

  // Check collisions between explosions and enemies
  checkExplosionEnemyCollisions(explosions, enemies, collisions) {
    explosions.forEach(explosion => {
      enemies.forEach(enemy => {
        if (!enemy.isAlive) return;
        
        const dx = enemy.x - explosion.x;
        const dy = enemy.y - explosion.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < explosion.radius) {
          const damagePercent = 1 - (distance / explosion.radius);
          collisions.explosionEnemy.push({
            explosion,
            enemy,
            distance,
            damagePercent
          });
        }
      });
    });
  }

  // Check enemy vs enemy collisions (for separation)
  checkEnemyEnemyCollisions(enemies, collisions) {
    for (let i = 0; i < enemies.length; i++) {
      const enemy1 = enemies[i];
      if (!enemy1.isAlive) continue;
      
      for (let j = i + 1; j < enemies.length; j++) {
        const enemy2 = enemies[j];
        if (!enemy2.isAlive) continue;
        
        const bounds1 = enemy1.getBounds();
        const bounds2 = enemy2.getBounds();
        
        if (this.checkCircleCollision(bounds1, bounds2)) {
          collisions.enemyEnemy.push({
            enemy1,
            enemy2
          });
        }
      }
    }
  }

  // Execute collision callbacks
  executeCallbacks(collisions, gameState) {
    // Player-Enemy collisions
    if (this.callbacks.playerEnemy && collisions.playerEnemy.length > 0) {
      collisions.playerEnemy.forEach(collision => {
        this.callbacks.playerEnemy(collision, gameState);
      });
    }

    // Projectile-Enemy collisions
    if (this.callbacks.projectileEnemy && collisions.projectileEnemy.length > 0) {
      collisions.projectileEnemy.forEach(collision => {
        this.callbacks.projectileEnemy(collision, gameState);
      });
    }

    // Player-Powerup collisions
    if (this.callbacks.playerPowerup && collisions.playerPowerup.length > 0) {
      collisions.playerPowerup.forEach(collision => {
        this.callbacks.playerPowerup(collision, gameState);
      });
    }

    // Explosion-Enemy collisions
    if (this.callbacks.explosionEnemy && collisions.explosionEnemy.length > 0) {
      collisions.explosionEnemy.forEach(collision => {
        this.callbacks.explosionEnemy(collision, gameState);
      });
    }

    // Enemy-Enemy collisions
    if (this.callbacks.enemyEnemy && collisions.enemyEnemy.length > 0) {
      collisions.enemyEnemy.forEach(collision => {
        this.callbacks.enemyEnemy(collision, gameState);
      });
    }
  }

  // Circle collision check
  checkCircleCollision(bounds1, bounds2) {
    const dx = bounds1.centerX - bounds2.centerX;
    const dy = bounds1.centerY - bounds2.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = bounds1.radius + bounds2.radius;
    
    return distance < minDistance;
  }

  // AABB collision check (for rectangular objects)
  checkAABBCollision(bounds1, bounds2) {
    return bounds1.left < bounds2.right &&
           bounds1.right > bounds2.left &&
           bounds1.top < bounds2.bottom &&
           bounds1.bottom > bounds2.top;
  }

  // Get player bounds
  getPlayerBounds(player) {
    const halfSize = GAME_CONFIG.PLAYER_SIZE / 2;
    return {
      left: player.x - halfSize,
      right: player.x + halfSize,
      top: player.y - halfSize,
      bottom: player.y + halfSize,
      centerX: player.x,
      centerY: player.y,
      radius: halfSize
    };
  }

  // Get powerup bounds
  getPowerupBounds(powerup) {
    return {
      centerX: powerup.x,
      centerY: powerup.y,
      radius: 15
    };
  }

  // Update spatial grid for optimization
  updateGrid(gameState, player) {
    this.grid.clear();
    
    // Add player to grid
    this.addToGrid('player', player, player.x, player.y);
    
    // Add enemies to grid
    gameState.enemies.forEach(enemy => {
      if (enemy.isAlive) {
        this.addToGrid('enemy', enemy, enemy.x, enemy.y);
      }
    });
    
    // Add projectiles to grid
    gameState.projectiles.forEach(projectile => {
      if (projectile.isActive) {
        this.addToGrid('projectile', projectile, projectile.x, projectile.y);
      }
    });
    
    // Add powerups to grid
    gameState.powerups.forEach(powerup => {
      this.addToGrid('powerup', powerup, powerup.x, powerup.y);
    });
  }

  // Add entity to spatial grid
  addToGrid(type, entity, x, y) {
    const gridX = Math.floor(x / this.gridSize);
    const gridY = Math.floor(y / this.gridSize);
    const key = `${gridX},${gridY}`;
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    
    this.grid.get(key).push({ type, entity });
  }

  // Get nearby entities from grid
  getNearbyEntities(x, y, radius) {
    const entities = [];
    const gridRadius = Math.ceil(radius / this.gridSize);
    const centerGridX = Math.floor(x / this.gridSize);
    const centerGridY = Math.floor(y / this.gridSize);
    
    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        const key = `${centerGridX + dx},${centerGridY + dy}`;
        const cellEntities = this.grid.get(key);
        
        if (cellEntities) {
          entities.push(...cellEntities);
        }
      }
    }
    
    return entities;
  }

  // Helper method to resolve collision overlap
  static resolveOverlap(entity1, entity2, separationForce = 1) {
    const dx = entity1.x - entity2.x;
    const dy = entity1.y - entity2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      // Entities are at exact same position, push in random direction
      const angle = Math.random() * Math.PI * 2;
      entity1.x += Math.cos(angle) * separationForce;
      entity1.y += Math.sin(angle) * separationForce;
    } else {
      // Push entities apart
      const normalX = dx / distance;
      const normalY = dy / distance;
      
      entity1.x += normalX * separationForce * 0.5;
      entity1.y += normalY * separationForce * 0.5;
      entity2.x -= normalX * separationForce * 0.5;
      entity2.y -= normalY * separationForce * 0.5;
    }
  }

  // Calculate knockback vector
  static calculateKnockback(fromX, fromY, toX, toY, force) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      return { x: 0, y: 0 };
    }
    
    return {
      x: (dx / distance) * force,
      y: (dy / distance) * force
    };
  }

  // Check if point is in circle
  static pointInCircle(px, py, cx, cy, radius) {
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  // Check if line intersects circle
  static lineIntersectsCircle(x1, y1, x2, y2, cx, cy, radius) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - cx;
    const fy = y1 - cy;
    
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - radius * radius;
    
    const discriminant = b * b - 4 * a * c;
    return discriminant >= 0;
  }
}

// Singleton instance
let collisionSystemInstance = null;

export function getCollisionSystem() {
  if (!collisionSystemInstance) {
    collisionSystemInstance = new CollisionSystem();
  }
  return collisionSystemInstance;
}

export function resetCollisionSystem() {
  collisionSystemInstance = new CollisionSystem();
  return collisionSystemInstance;
}

export default CollisionSystem;