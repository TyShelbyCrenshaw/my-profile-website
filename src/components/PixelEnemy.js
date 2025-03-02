import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PixelEnemy.css';

// Use React.memo without a comparison function so enemies always update
const PixelEnemy = ({ playerPos, reportPosition, onDefeated, id }) => {
  // Enemy state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Animation state
  const [direction, setDirection] = useState('down');
  const [animFrame, setAnimFrame] = useState(0);
  
  // Death animation state
  const [isDying, setIsDying] = useState(false);
  
  // Ref to track if defeat has been triggered to prevent multiple calls
  const isBeingDefeatedRef = useRef(false);
  const animationFrameIdRef = useRef(null);
  const deathAnimationTimerRef = useRef(null);
  const speedRef = useRef(2); // pixels per frame
  
  // Set initial random position
  useEffect(() => {
    // Start at a random edge of the screen
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;
    
    switch(side) {
      case 0: // top
        x = Math.random() * window.innerWidth;
        y = -30;
        setDirection('down');
        break;
      case 1: // right
        x = window.innerWidth + 30;
        y = Math.random() * window.innerHeight;
        setDirection('left');
        break;
      case 2: // bottom
        x = Math.random() * window.innerWidth;
        y = window.innerHeight + 30;
        setDirection('up');
        break;
      case 3: // left
        x = -30;
        y = Math.random() * window.innerHeight;
        setDirection('right');
        break;
      default:
        x = 0;
        y = 0;
        setDirection('down');
    }
    
    setPosition({ x, y });
    setIsInitialized(true);
  }, []);
  
  // Handle animation frames for walking
  useEffect(() => {
    if (!isActive || !isInitialized || isDying) return;
    
    const animationInterval = setInterval(() => {
      setAnimFrame(prev => (prev + 1) % 4);
    }, 150); // Animation frame rate
    
    return () => clearInterval(animationInterval);
  }, [isActive, isInitialized, isDying]);
  
  // Play death animation
  const playDeathAnimation = useCallback(() => {
    setIsDying(true);
    
    // Start death animation
    setAnimFrame(0);
    
    const advanceDeathFrame = (frame) => {
      if (frame >= 4) {
        // Animation complete, notify parent component
        if (typeof onDefeated === 'function') {
          onDefeated(id);
        }
        return;
      }
      
      setAnimFrame(frame);
      
      // Schedule next frame
      deathAnimationTimerRef.current = setTimeout(() => {
        advanceDeathFrame(frame + 1);
      }, 150); // 150ms per frame
    };
    
    // Start the death animation
    advanceDeathFrame(0);
  }, [id, onDefeated]);
  
  // Check for player attack with useCallback for better performance
  const checkForDefeat = useCallback((distance) => {
    const attackRange = 50;
    if (distance < attackRange && playerPos.isAttacking && !isBeingDefeatedRef.current) {
      isBeingDefeatedRef.current = true;
      
      // Cancel movement animation frame
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      // Play death animation
      playDeathAnimation();
    }
  }, [playerPos.isAttacking, playDeathAnimation]);
  
  // Simplified direct movement approach
  useEffect(() => {
    if (!isActive || !isInitialized || isDying) return;
    
    const moveEnemy = () => {
      // Calculate direction to player
      const dx = playerPos.x - position.x;
      const dy = playerPos.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 1) { // Only move if we're not already at the target
        // Update movement direction based on angle to player
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // Determine direction based on angle
        // Convert angle to 4-direction system
        if (angle >= -45 && angle < 45) {
          setDirection('right');
        } else if (angle >= 45 && angle < 135) {
          setDirection('down');
        } else if (angle >= -135 && angle < -45) {
          setDirection('up');
        } else {
          setDirection('left');
        }
        
        // Calculate new position with speed adjustment
        const speedFactor = Math.min(speedRef.current, distance) / distance;
        const newX = position.x + dx * speedFactor;
        const newY = position.y + dy * speedFactor;
        
        // Update position
        setPosition({ x: newX, y: newY });
        
        // Report position to parent for centralized collision detection
        reportPosition(id, { x: newX, y: newY });
        
        // Check for player attack
        checkForDefeat(distance);
      }
      
      // Continue animation if still active
      if (isActive && !isDying) {
        animationFrameIdRef.current = requestAnimationFrame(moveEnemy);
      }
    };
    
    // Start the animation loop
    animationFrameIdRef.current = requestAnimationFrame(moveEnemy);
    
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isActive, isInitialized, isDying, playerPos, id, reportPosition, checkForDefeat, position]);
  
  // Clean up any lingering timers on unmount
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (deathAnimationTimerRef.current) {
        clearTimeout(deathAnimationTimerRef.current);
      }
    };
  }, []);
  
  // Skip rendering if not active
  if (!isActive) {
    return null;
  }
  
  return (
    <div 
      className={`enemy ${isDying ? 'death' : 'walk'} ${!isDying ? direction : ''}`}
      data-frame={animFrame}
      style={{
        transform: `translate(${position.x - 15}px, ${position.y - 30}px)`
      }}
    />
  );
};

export default React.memo(PixelEnemy);