// src/game/entities/Projectile.js
import { GAME_CONFIG } from "../constants/gameConstants"; // If needed for bounds, etc.

export class Projectile {
  constructor(x, y, vx, vy, damage, color, life, type = 'default', size = 6) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.color = color;
    this.life = life; // in milliseconds
    this.type = type; // e.g., 'fireball', 'meteor_impact'
    this.size = size;
    this.isActive = true;
    this.id = Date.now() + Math.random();
    this.explosionRadius = (type === 'meteor') ? 80 : 0; // Example specific property
  }

  update(deltaTime) {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= deltaTime;

    // Basic boundary check
    if (this.life <= 0 ||
        this.x < -this.size || this.x > GAME_CONFIG.CANVAS_WIDTH + this.size ||
        this.y < -this.size || this.y > GAME_CONFIG.CANVAS_HEIGHT + this.size) {
      this.isActive = false;
    }
  }

  // Check hit with an enemy (simple circle collision)
  checkHit(enemy) {
    if (!this.isActive || !enemy || !enemy.isAlive) return false; // Added !enemy check
    const dx = this.x - enemy.x;
    const dy = this.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const enemyRadius = enemy.size ? enemy.size / 2 : 10; // Default if enemy.size undefined
    const hit = distance < enemyRadius + this.size;

    if (hit && this.type !== 'meteor') { // Meteor impact (area damage) might not deactivate projectile itself
        this.isActive = false; // Standard projectiles disappear on hit
    }
    return hit;
  }

  getVisualProperties() {
    return {
      x: this.x,
      y: this.y,
      size: this.size,
      color: this.color,
      alpha: Math.max(0, this.life / 2000), // Example: base max life for alpha calculation
      rotation: Math.atan2(this.vy, this.vx),
      glowIntensity: 10,
      trail: this.type === 'fireball'
    };
  }
}

export const ProjectileFactory = {
  createFireball: (startX, startY, targetX, targetY, damage, projectileSpeed = 12, color = '#ff4400', life = 2000) => {
    const dx = targetX - startX;
    const dy = targetY - startY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) distance = 1; // Avoid division by zero if target is same as start

    return new Projectile(
      startX, startY,
      (dx / distance) * projectileSpeed,
      (dy / distance) * projectileSpeed,
      damage, color, life, 'fireball'
    );
  },
  createMeteorImpact: (targetX, targetY, damage, color = '#ff4400', life = 100) => {
    // This projectile represents the impact itself, for area damage check
    return new Projectile(
        targetX, targetY,
        0,0, // No velocity, it's an instant impact effect
        damage, color, life,
        'meteor', 80 // Meteor impact radius as size for collision check
    );
  },
  createLightning: (startX, startY, targetEnemy, damage, color = '#FFFF00', life = 300, speed = 30) => {
    // Lightning strikes quickly towards the target
    const dx = targetEnemy.x - startX;
    const dy = targetEnemy.y - startY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) distance = 1; // Avoid division by zero

    // We might want a different visual or behavior for lightning
    // For now, a fast projectile. Could also be an "instant" effect where no projectile object is needed,
    // and damage is applied directly in AbilityManager.
    return new Projectile(
      startX, startY,
      (dx / distance) * speed, // Very fast
      (dy / distance) * speed,
      damage, color, life, // Short life
      'lightning', 4 // Smaller size for lightning bolt visual
    );
  }
};