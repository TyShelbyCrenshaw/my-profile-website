import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PixelSprite.css';
import PixelEnemy from './PixelEnemy';

const PixelSprite = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [spritePos, setSpritePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [enemyPositions, setEnemyPositions] = useState({});
  
  // Combined animation state
  const [animation, setAnimation] = useState({
    type: 'idle',
    frame: 0,
    isPlaying: false
  });
  
  // Jump offset and health
  const [jumpOffset, setJumpOffset] = useState(0);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  
  // Track enemies
  const [enemies, setEnemies] = useState([]);
  
  // Last hit time to implement immunity period
  const lastHitTimeRef = useRef(0);
  
  const [particles, setParticles] = useState([]);
  const spriteRef = useRef(null);
  
  // Animation timer refs
  const animationTimerRef = useRef(null);
  
  // Enemy spawn timer
  const enemySpawnTimerRef = useRef(null);

  const isImmuneRef = useRef(false);
  
  // Game state
  const [gameActive, setGameActive] = useState(true);
  
  // Death animation state
  const [isDying, setIsDying] = useState(false);
  
  // Restart game function
  const handleRestart = useCallback(() => {
    // Reset player state
    setHealth(100);
    setScore(0);
    
    // Clear all enemies
    setEnemies([]);
    setEnemyPositions({});
    
    // Reset player position to center
    setSpritePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
    // Reset animation state
    setAnimation({
      type: 'idle',
      frame: 0,
      isPlaying: false
    });
    
    // Reset jump offset
    setJumpOffset(0);
    
    // Clear particles
    setParticles([]);
    
    // Reset immunity
    isImmuneRef.current = false;
    
    // Reset death state
    setIsDying(false);
    
    // Set game as active
    setGameActive(true);
    
    // Restart enemy spawning
    if (enemySpawnTimerRef.current) {
      clearTimeout(enemySpawnTimerRef.current);
    }
    enemySpawnTimerRef.current = setTimeout(() => {
      spawnEnemy();
    }, 2000);
  }, []);
  
  // Throttle mouse move events
  useEffect(() => {
    let lastUpdate = 0;
    const handleMouseMove = (e) => {
      // Only process mouse movements when game is active
      if (!gameActive || isDying) return;
      
      const now = performance.now();
      if (now - lastUpdate > 16) {
        setMousePos({ x: e.clientX, y: e.clientY });
        lastUpdate = now;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gameActive, isDying]);

  // Handle keyboard events (Space for jump)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameActive || isDying) return;
      
      if (e.code === 'Space' && !animation.isPlaying) {
        e.preventDefault();
        playJumpAnimation();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [animation.isPlaying, gameActive, isDying]);

  // Handle global click for attack
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!gameActive || isDying) return;
      
      if (e.button === 0 && !animation.isPlaying) {
        playAnimation('attack', 4, 125);
      }
    };
    
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [animation.isPlaying, gameActive, isDying]);

  // Spawn enemies periodically
  const spawnEnemy = useCallback(() => {
    if (!gameActive) return;
    
    // Add a new enemy with unique ID
    setEnemies(prev => [
      ...prev, 
      { id: Date.now() }
    ]);
    
    // Schedule next spawn (random interval between 3-8 seconds)
    const nextSpawnTime = 3000 + Math.random() * 5000;
    enemySpawnTimerRef.current = setTimeout(spawnEnemy, nextSpawnTime);
  }, [gameActive]);
  
  useEffect(() => {
    // Initial spawn
    enemySpawnTimerRef.current = setTimeout(spawnEnemy, 2000);
    
    return () => clearTimeout(enemySpawnTimerRef.current);
  }, [spawnEnemy]);

  // Clean up any lingering timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(animationTimerRef.current);
      clearTimeout(enemySpawnTimerRef.current);
    };
  }, []);

  // Play the death animation
  const playDeathAnimation = () => {
    setIsDying(true);
    clearTimeout(animationTimerRef.current);
    
    setAnimation({
      type: 'die',
      frame: 0,
      isPlaying: true
    });
    
    const frameCount = 7; // 0-6 frames
    const frameDuration = 150; // milliseconds per frame
    let currentFrame = 0;
    
    const advanceFrame = () => {
      currentFrame++;
      
      if (currentFrame >= frameCount) {
        // End of animation - game over
        setAnimation({
          type: 'die',
          frame: 6, // Keep on last frame
          isPlaying: false
        });
        
        setGameActive(false);
        return;
      }
      
      // Update with the new frame number
      setAnimation(prev => ({
        ...prev,
        frame: currentFrame
      }));
      
      // Schedule next frame
      animationTimerRef.current = setTimeout(advanceFrame, frameDuration);
    };
    
    // Start the animation sequence
    animationTimerRef.current = setTimeout(advanceFrame, frameDuration);
  };

  const handlePlayerHit = () => {
    if (isImmuneRef.current || isDying) {
      return;
    }
    
    isImmuneRef.current = true;
    lastHitTimeRef.current = Date.now();
    
    setHealth(prev => {
      const newHealth = Math.max(0, prev - 50);
      
      // If health reaches zero, trigger death animation
      if (newHealth <= 0 && !isDying) {
        playDeathAnimation();
      }
      
      return newHealth;
    });
    
    setTimeout(() => {
      isImmuneRef.current = false;
    }, 1000);
  };
  
  const handleEnemyDefeated = (enemyId) => {
    setEnemies(prev => prev.filter(enemy => enemy.id !== enemyId));
    
    setEnemyPositions(prev => {
      const newPositions = {...prev};
      delete newPositions[enemyId];
      return newPositions;
    });
    
    setScore(prev => prev + 100);
  };

  // Special jump animation with vertical motion
  const playJumpAnimation = () => {
    clearTimeout(animationTimerRef.current);
    
    setAnimation({
      type: 'jump',
      frame: 0,
      isPlaying: true
    });
    
    // Jump parameters
    const frameCount = 8;
    const frameDuration = 100;
    let currentFrame = 0;
    
    // Jump height curve (parabola)
    const jumpHeights = [0, -15, -25, -30, -30, -25, -15, 0];
    
    const advanceJumpFrame = () => {
      currentFrame++;
      
      if (currentFrame >= frameCount) {
        // End of animation
        setAnimation({
          type: 'idle',
          frame: 0,
          isPlaying: false
        });
        setJumpOffset(0); // Reset jump height
        return;
      }
      
      // Update jump height
      setJumpOffset(jumpHeights[currentFrame]);
      
      // Update animation frame
      setAnimation(prev => ({
        ...prev,
        frame: currentFrame
      }));
      
      // Schedule next frame
      animationTimerRef.current = setTimeout(advanceJumpFrame, frameDuration);
    };
    
    // Start the animation sequence
    animationTimerRef.current = setTimeout(advanceJumpFrame, frameDuration);
  };
  
  // Standard animation player for non-jump animations
  const playAnimation = (type, frameCount, frameDuration) => {
    clearTimeout(animationTimerRef.current);
    
    setAnimation({
      type,
      frame: 0,
      isPlaying: true
    });
    
    let currentFrame = 0;
    
    const advanceFrame = () => {
      currentFrame++;
      
      if (currentFrame >= frameCount) {
        // End of animation
        setAnimation({
          type: 'idle',
          frame: 0,
          isPlaying: false
        });
        return;
      }
      
      // Update with the new frame number
      setAnimation(prev => ({
        ...prev,
        frame: currentFrame
      }));
      
      // Schedule next frame
      animationTimerRef.current = setTimeout(advanceFrame, frameDuration);
    };
    
    // Start the animation sequence
    animationTimerRef.current = setTimeout(advanceFrame, frameDuration);
  };
  
  // Cycle idle/walk animations
  useEffect(() => {
    if (!animation.isPlaying && gameActive && !isDying) {
      const cycleDuration = 125; // ms per frame
      
      const cycleIdleWalkFrames = () => {
        setAnimation(prev => ({
          ...prev,
          frame: (prev.frame + 1) % 4 // Cycle 0-3 for idle/walk
        }));
      };
      
      const timerId = setInterval(cycleIdleWalkFrames, cycleDuration);
      return () => clearInterval(timerId);
    }
  }, [animation.isPlaying, gameActive, isDying]);

  // Movement and state detection
  useEffect(() => {
    if (!gameActive || isDying) return;
    
    let animationFrameId;
    const MAX_PARTICLES = 20;

    const update = () => {
      setSpritePos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        const speed = 0.1;
        const newX = prev.x + dx * speed;
        const newY = prev.y + dy * speed;

        // Only update movement-based states when not in a special animation
        if (!animation.isPlaying) {
          if (Math.abs(dx) > 5) {
            setAnimation(prev => ({
              ...prev,
              type: dx > 0 ? 'walkRight' : 'walkLeft'
            }));
          } else {
            setAnimation(prev => ({
              ...prev,
              type: 'idle'
            }));
          }
        }

        // Add particle
        if (particles.length < MAX_PARTICLES && Math.random() > 0.9) {
          setParticles((prev) => [
            ...prev.slice(-MAX_PARTICLES + 1),
            { x: newX, y: newY, life: 1 },
          ]);
        }

        return { x: newX, y: newY };
      });

      // Update particles
      setParticles((prev) =>
        prev.map((p) => ({ ...p, life: p.life - 0.05 })).filter((p) => p.life > 0)
      );

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos, particles.length, animation.isPlaying, gameActive, isDying]);

  const reportEnemyPosition = (enemyId, position) => {
    setEnemyPositions(prev => ({
      ...prev,
      [enemyId]: position
    }));
  };

  // Centralized collision detection
  useEffect(() => {
    if (!gameActive || isImmuneRef.current || isDying) return;
    
    Object.entries(enemyPositions).forEach(([enemyId, enemyPos]) => {
      const dx = spritePos.x - enemyPos.x;
      const dy = spritePos.y - enemyPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 20 && !isImmuneRef.current) {
        isImmuneRef.current = true;
        setHealth(prev => {
          const newHealth = Math.max(0, prev - 50);
          if (newHealth <= 0 && !isDying) {
            playDeathAnimation();
          }
          return newHealth;
        });
        
        setTimeout(() => {
          isImmuneRef.current = false;
        }, 1000);
      }
    });
  }, [enemyPositions, spritePos, gameActive, isDying]);

  // Handle Game Over button clicks separately
  const handleGameOverClick = (e) => {
    e.stopPropagation(); // Prevent the click from reaching elements beneath
  };

  return (
    <div className="sprite-container">
      {/* UI Elements */}
      <div className="game-ui mt-5">
        <div className="health-bar">
          <div className="health-bar-inner" style={{ width: `${health}%` }} />
        </div>
        <div className="score">Score: {score}</div>
      </div>

      {enemies.map(enemy => (
        <PixelEnemy 
          key={enemy.id}
          id={enemy.id}
          playerPos={{
            x: spritePos.x,
            y: spritePos.y + jumpOffset,
            isAttacking: animation.type === 'attack'
          }}
          reportPosition={reportEnemyPosition}
          onDefeated={handleEnemyDefeated}
        />
      ))}
      
      {/* Sprite with frame-based animation */}
      <div
        ref={spriteRef}
        className={`sprite ${animation.type}`}
        data-frame={animation.frame}
        style={{
          transform: `translate(${spritePos.x - 15}px, ${spritePos.y - 30 + jumpOffset}px)`,
          willChange: 'transform',
        }}
      />
      
      {/* Particle Trail */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            transform: `translate(${p.x - 2}px, ${p.y - 2}px)`,
            opacity: p.life,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Game Over message */}
      {!gameActive && (
        <div 
          className="game-over"
          onClick={handleGameOverClick}
        >
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <button onClick={handleRestart}>
            Restart
          </button>
        </div>
      )}

    </div>
  );
};

export default PixelSprite;