import React, { useState, useEffect, useRef } from 'react';
import './PixelSprite.css'; // Ensure this includes your sprite sheet references

const PixelSprite = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [spritePos, setSpritePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 }); // Center initially
  const [state, setState] = useState('idle'); // idle, walkLeft, walkRight, jump, attack
  const [frame, setFrame] = useState(0); // Track current frame
  const [particles, setParticles] = useState([]); // Limit to 20 particles max
  const spriteRef = useRef(null);

  // Throttle mouse move events for better performance
  useEffect(() => {
    let lastUpdate = 0;
    const handleMouseMove = (e) => {
      const now = performance.now();
      if (now - lastUpdate > 16) { // Update ~60 times per second
        setMousePos({ x: e.clientX, y: e.clientY });
        lastUpdate = now;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle keyboard events (Spacebar for jump)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        setState('jump');
        setTimeout(() => setState('idle'), 800); // Extend jump duration to 0.8s for 8 frames
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Handle mouse click (left click for attack)
  const handleClick = (e) => {
    if (e.button === 0) { // Left mouse button
      setState('attack');
      setTimeout(() => setState('idle'), 500); // Attack lasts 0.5s
    }
  };

  // Use requestAnimationFrame for smooth animations and frame cycling
  useEffect(() => {
    let animationFrameId;
    const MAX_PARTICLES = 20; // Limit particle count

    const update = (timestamp) => {
      // Animate frames (cycle based on state)
      const frameTime = 100; // Time per frame in ms
      if (timestamp % frameTime < 16) { // Sync with animation frame
        const maxFrames = state === 'jump' ? 8 : 4; // 8 frames for jump, 4 for others
        setFrame((prev) => (prev + 1) % maxFrames); // Cycle through 0 to maxFrames-1
      }

      setSpritePos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        const speed = 0.1; // Slightly faster for responsiveness
        const newX = prev.x + dx * speed;
        const newY = prev.y + dy * speed;

        // Determine walking direction (only if not jumping or attacking)
        if (state === 'idle' || state === 'walkLeft' || state === 'walkRight') {
          if (Math.abs(dx) > 5) {
            setState(dx > 0 ? 'walkRight' : 'walkLeft');
          } else {
            setState('idle');
          }
        }

        // Add particle (less frequent to reduce load)
        if (particles.length < MAX_PARTICLES && Math.random() > 0.9) {
          setParticles((prev) => [
            ...prev.slice(-MAX_PARTICLES + 1), // Keep only the last MAX_PARTICLES
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
  }, [mousePos, state]);

  return (
    <div className="sprite-container" onClick={handleClick}>
      {/* Sprite with frame-based animation */}
      <div
        ref={spriteRef}
        className={`sprite ${state}`}
        data-frame={frame} // Use data attribute for frame-specific styling
        style={{
          transform: `translate(${spritePos.x - 15}px, ${spritePos.y - 15}px)`, // Center 30x30 sprite
          willChange: 'transform', // Hint for hardware acceleration
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
            willChange: 'transform, opacity', // Hint for hardware acceleration
          }}
        />
      ))}
    </div>
  );
};

export default PixelSprite;