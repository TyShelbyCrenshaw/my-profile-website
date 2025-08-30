// Particle effects system for visual feedback
import { VISUAL_CONFIG, COLORS } from '../constants/gameConstants.js';

export class Particle {
  constructor(config) {
    // Position and movement
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx || (Math.random() - 0.5) * 6;
    this.vy = config.vy || (Math.random() - 0.5) * 6 - 2;
    
    // Visual properties
    this.color = config.color || '#ffffff';
    this.size = config.size || 3;
    this.shape = config.shape || 'circle'; // 'circle', 'square', 'star', 'spark'
    
    // Lifetime
    this.life = config.life || 1 + Math.random();
    this.maxLife = this.life;
    
    // Physics properties
    this.gravity = config.gravity !== undefined ? config.gravity : VISUAL_CONFIG.PARTICLE_GRAVITY;
    this.friction = config.friction !== undefined ? config.friction : VISUAL_CONFIG.PARTICLE_AIR_RESISTANCE;
    this.bounce = config.bounce || 0;
    this.spin = config.spin || 0;
    this.angle = config.angle || 0;
    
    // Special effects
    this.glow = config.glow || false;
    this.trail = config.trail || false;
    this.fadeOut = config.fadeOut !== undefined ? config.fadeOut : true;
    this.shrink = config.shrink || false;
    this.colorShift = config.colorShift || null; // { targetColor, speed }
    
    // State
    this.isActive = true;
    this.alpha = 1;
    
    // Trail history for special effects
    if (this.trail) {
      this.trailPositions = [];
      this.maxTrailLength = 5;
    }
  }

  // Update particle physics and state
  update(deltaTime) {
    if (!this.isActive) return;
    
    const dt = deltaTime / 1000; // Convert to seconds
    
    // Update lifetime
    this.life -= dt;
    if (this.life <= 0) {
      this.isActive = false;
      return;
    }
    
    // Apply physics
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.vy *= this.friction;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Update rotation
    if (this.spin !== 0) {
      this.angle += this.spin * dt;
    }
    
    // Update trail
    if (this.trail) {
      this.updateTrail();
    }
    
    // Visual effects
    if (this.fadeOut) {
      this.alpha = this.life / this.maxLife;
    }
    
    if (this.shrink) {
      this.size = this.size * (this.life / this.maxLife);
    }
    
    if (this.colorShift) {
      this.updateColorShift(dt);
    }
    
    // Bounce off bottom (optional)
    if (this.bounce > 0 && this.y > 580) {
      this.y = 580;
      this.vy *= -this.bounce;
    }
  }

  // Update trail positions
  updateTrail() {
    this.trailPositions.push({ x: this.x, y: this.y, alpha: this.alpha });
    
    if (this.trailPositions.length > this.maxTrailLength) {
      this.trailPositions.shift();
    }
    
    // Fade trail
    this.trailPositions.forEach((pos, index) => {
      pos.alpha = (index / this.trailPositions.length) * this.alpha;
    });
  }

  // Update color shift effect
  updateColorShift(dt) {
    // Simple color interpolation (could be improved)
    // This is a placeholder - real color interpolation would be more complex
    this.color = this.colorShift.targetColor;
  }

  // Render the particle
  render(ctx) {
    if (!this.isActive || this.alpha <= 0) return;
    
    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    // Draw trail first
    if (this.trail && this.trailPositions.length > 0) {
      this.renderTrail(ctx);
    }
    
    // Apply glow effect
    if (this.glow) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.size * 2;
    }
    
    // Transform for rotation
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    
    // Draw particle shape
    ctx.fillStyle = this.color;
    
    switch (this.shape) {
      case 'circle':
        this.renderCircle(ctx);
        break;
      case 'square':
        this.renderSquare(ctx);
        break;
      case 'star':
        this.renderStar(ctx);
        break;
      case 'spark':
        this.renderSpark(ctx);
        break;
      default:
        this.renderCircle(ctx);
    }
    
    ctx.restore();
  }

  // Render shapes
  renderCircle(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  renderSquare(ctx) {
    const halfSize = this.size / 2;
    ctx.fillRect(-halfSize, -halfSize, this.size, this.size);
  }

  renderStar(ctx) {
    const spikes = 5;
    const outerRadius = this.size;
    const innerRadius = this.size / 2;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  renderSpark(ctx) {
    // Elongated particle to show motion
    const length = this.size * 3;
    const width = this.size / 2;
    
    ctx.beginPath();
    ctx.ellipse(0, 0, length, width, Math.atan2(this.vy, this.vx), 0, Math.PI * 2);
    ctx.fill();
  }

  renderTrail(ctx) {
    this.trailPositions.forEach((pos, index) => {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = pos.alpha;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.size * (index / this.trailPositions.length), 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// Particle system manager
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.emitters = new Map();
  }

  // Add a single particle
  addParticle(particle) {
    this.particles.push(particle);
  }

  // Create multiple particles at once
  createParticles(x, y, color, count = 8, options = {}) {
    for (let i = 0; i < count; i++) {
      const particle = new Particle({
        x,
        y,
        color,
        ...options,
        // Add some randomness
        vx: options.vx || (Math.random() - 0.5) * 6,
        vy: options.vy || (Math.random() - 0.5) * 6 - 2,
        life: options.life || 1 + Math.random()
      });
      
      this.particles.push(particle);
    }
  }

  // Create an emitter for continuous particles
  createEmitter(id, config) {
    const emitter = {
      id,
      x: config.x,
      y: config.y,
      rate: config.rate || 10, // particles per second
      particleConfig: config.particleConfig || {},
      active: true,
      accumulator: 0
    };
    
    this.emitters.set(id, emitter);
    return emitter;
  }

  // Update all particles and emitters
  update(deltaTime) {
    // Update existing particles
    this.particles = this.particles.filter(particle => {
      particle.update(deltaTime);
      return particle.isActive;
    });
    
    // Update emitters
    this.emitters.forEach(emitter => {
      if (!emitter.active) return;
      
      emitter.accumulator += deltaTime;
      const particlesToEmit = Math.floor(emitter.accumulator / (1000 / emitter.rate));
      
      if (particlesToEmit > 0) {
        emitter.accumulator -= particlesToEmit * (1000 / emitter.rate);
        
        for (let i = 0; i < particlesToEmit; i++) {
          this.addParticle(new Particle({
            x: emitter.x,
            y: emitter.y,
            ...emitter.particleConfig
          }));
        }
      }
    });
  }

  // Render all particles
  render(ctx) {
    this.particles.forEach(particle => {
      particle.render(ctx);
    });
  }

  // Remove an emitter
  removeEmitter(id) {
    this.emitters.delete(id);
  }

  // Clear all particles
  clear() {
    this.particles = [];
    this.emitters.clear();
  }

  // Get particle count
  getCount() {
    return this.particles.length;
  }
}

// Preset particle effects
export const ParticleEffects = {
  // Explosion effect
  explosion(x, y, color = '#ff4400', intensity = 1) {
    const particles = [];
    const count = Math.floor(20 * intensity);
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 3 + Math.random() * 5 * intensity;
      
      particles.push(new Particle({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 3,
        life: 0.5 + Math.random() * 0.5,
        glow: true,
        gravity: 0,
        friction: 0.95
      }));
    }
    
    return particles;
  },

  // Hit effect
  hit(x, y, color = '#ffffff') {
    const particles = [];
    
    for (let i = 0; i < 6; i++) {
      particles.push(new Particle({
        x, y,
        color,
        size: 2 + Math.random() * 2,
        shape: 'spark',
        life: 0.3 + Math.random() * 0.3
      }));
    }
    
    return particles;
  },

  // Heal effect
  heal(x, y) {
    const particles = [];
    
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      
      particles.push(new Particle({
        x, y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2 - 3,
        color: '#00ff00',
        size: 3,
        shape: 'star',
        life: 1,
        glow: true,
        gravity: -0.1, // Float up
        fadeOut: true
      }));
    }
    
    return particles;
  },

  // Level up effect
  levelUp(x, y) {
    const particles = [];
    const colors = ['#ffff00', '#ffd700', '#ffaa00'];
    
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particles.push(new Particle({
        x, y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4,
        color,
        size: 4,
        shape: 'star',
        life: 1.5,
        glow: true,
        spin: 0.2,
        trail: true
      }));
    }
    
    return particles;
  },

  // Magic cast effect
  magicCast(x, y, color = '#0099ff') {
    const particles = [];
    
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 10;
      
      particles.push(new Particle({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: -Math.cos(angle) * 2,
        vy: -Math.sin(angle) * 2,
        color,
        size: 2,
        life: 0.5,
        glow: true,
        trail: true
      }));
    }
    
    return particles;
  },

  // Coin collect effect
  coinCollect(x, y) {
    const particles = [];
    
    for (let i = 0; i < 8; i++) {
      particles.push(new Particle({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4 - 2,
        color: '#ffd700',
        size: 3,
        shape: 'square',
        life: 0.8,
        glow: true,
        gravity: 0.3,
        bounce: 0.5
      }));
    }
    
    return particles;
  }
};

export default Particle;