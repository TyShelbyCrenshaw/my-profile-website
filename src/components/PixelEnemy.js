import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PixelEnemy.css';

// Use React.memo without a comparison function so enemies always update
const PixelEnemy = ({ playerPos, reportPosition, onDefeated, id }) => {
  // Enemy state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref to track if defeat has been triggered to prevent multiple calls
  const isBeingDefeatedRef = useRef(false);
  const animationFrameIdRef = useRef(null);
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
        break;
      case 1: // right
        x = window.innerWidth + 30;
        y = Math.random() * window.innerHeight;
        break;
      case 2: // bottom
        x = Math.random() * window.innerWidth;
        y = window.innerHeight + 30;
        break;
      case 3: // left
        x = -30;
        y = Math.random() * window.innerHeight;
        break;
      default:
        x = 0;
        y = 0;
    }
    
    setPosition({ x, y });
    setIsInitialized(true);
  }, []);
  
  // Check for player attack with useCallback for better performance
  const checkForDefeat = useCallback((distance) => {
    const attackRange = 50;
    if (distance < attackRange && playerPos.isAttacking && !isBeingDefeatedRef.current) {
      isBeingDefeatedRef.current = true;
      setIsActive(false);
      
      if (typeof onDefeated === 'function') {
        onDefeated(id);
      }
    }
  }, [playerPos.isAttacking, onDefeated, id]);
  
  // Simplified direct movement approach
  useEffect(() => {
    if (!isActive || !isInitialized) return;
    
    const moveEnemy = () => {
      // Calculate direction to player
      const dx = playerPos.x - position.x;
      const dy = playerPos.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 1) { // Only move if we're not already at the target
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
      if (isActive) {
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
  }, [isActive, isInitialized, playerPos, id, reportPosition, checkForDefeat]);
  
  // Skip rendering if not active
  if (!isActive) {
    return null;
  }
  
  return (
    <div 
      className="enemy"
      style={{
        position: 'absolute',
        width: '30px',
        height: '30px',
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        transform: `translate(${position.x - 15}px, ${position.y - 15}px)`,
        zIndex: 998
      }}
    />
  );
};

export default PixelEnemy;