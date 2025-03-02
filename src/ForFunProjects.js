import React from 'react';
import PixelSprite from './components/PixelSprite';

const ForFunProjects = () => {
  return (
    <div className="container mt-5" style={{ width: "100%", minHeight: "100%", overflow: "hidden" }}>
      <h1 className="text-accent mb-4">For Fun Projects</h1>
      <div className="p-3 bg-tertiary shadow">
        <div className="bg-secondary m-3 p-5 shadow">
          <h3 className="text-accent mb-4">Interactive Pixelated Adventure Sprite</h3>
          <p className="text-secondary mb-4">
            Move your mouse to guide a pixel art character around the screen! Press space to make it jump, left click to attack, and watch it leave a trail of pixel dust.
          </p>
          <div className="sprite-wrapper" style={{ position: "relative", height: "0", overflow: "visible" }}>
            <PixelSprite />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForFunProjects;