export class GameLoop {
    constructor() {
      this.animationFrameId = null;
      this.lastTime = 0;
      this.deltaTime = 0;
      this.isRunning = false;
      this.isPaused = false; // Added isPaused state
  
      // Callbacks
      this.updateCallback = null;
      this.renderCallback = null;
  
      // Performance tracking
      this.fps = 60;
      this.frameCount = 0;
      this.fpsUpdateTimer = 0;
  
      // Timers that need cleanup
      this.activeTimers = new Set();
  
      // Bound methods to maintain context
      this.loop = this.loop.bind(this);
    }
  
    // Initialize the game loop with callbacks
    init(updateCallback, renderCallback) {
      this.updateCallback = updateCallback;
      this.renderCallback = renderCallback;
    }
  
    // Start the game loop
    start() {
      if (this.isRunning) {
        console.warn('GameLoop: Already running');
        return;
      }
  
      this.isRunning = true;
      this.isPaused = false; // Ensure not paused on start
      this.lastTime = performance.now();
      this.frameCount = 0;
      this.fpsUpdateTimer = 0;
  
      // Start the loop
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  
    // Stop the game loop
    stop() {
      if (!this.isRunning) {
        return;
      }
  
      this.isRunning = false;
  
      // Cancel animation frame
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
  
      // Clear all active timers
      this.clearAllTimers();
    }
  
    // Pause the game loop (keeps it running but doesn't update)
    pause() {
      this.isPaused = true;
    }
  
    // Resume the game loop
    resume() {
      if (this.isRunning && this.isPaused) { // Only resume if running and was paused
          this.isPaused = false;
          this.lastTime = performance.now(); // Reset time to avoid huge deltaTime
      }
    }
  
    // Main loop function
    loop(currentTime) {
      if (!this.isRunning) {
        return;
      }
  
      // Request next frame immediately
      this.animationFrameId = requestAnimationFrame(this.loop);
  
      // Calculate delta time (capped to prevent huge jumps)
      this.deltaTime = Math.min(currentTime - this.lastTime, 100); // Cap at 100ms (10 FPS)
      this.lastTime = currentTime;
  
      // Update FPS counter
      this.updateFPS(this.deltaTime);
  
      // Only update game state if not paused
      if (!this.isPaused && this.updateCallback) {
        this.updateCallback(this.deltaTime);
      }
  
      // Always render (even when paused to show pause screen, or just the static scene)
      if (this.renderCallback) {
        this.renderCallback(this.deltaTime); // Pass deltaTime in case render needs it
      }
    }
  
    // Update FPS counter
    updateFPS(deltaTime) {
      this.frameCount++;
      this.fpsUpdateTimer += deltaTime;
  
      // Update FPS every second
      if (this.fpsUpdateTimer >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / this.fpsUpdateTimer);
        this.frameCount = 0;
        this.fpsUpdateTimer = 0;
      }
    }
  
    // Get current FPS
    getFPS() {
      return this.fps;
    }
  
    // Add a timer that will be cleaned up
    addTimer(callback, delay, ...args) {
      const timerId = setTimeout(() => {
        this.activeTimers.delete(timerId);
        // Only execute callback if loop is still considered active or not explicitly stopped for this timer
        if (this.isRunning) {
          callback(...args);
        }
      }, delay);
  
      this.activeTimers.add(timerId);
      return timerId;
    }
  
    // Add an interval that will be cleaned up
    addInterval(callback, interval, ...args) {
      const intervalId = setInterval(() => {
        if (this.isRunning && !this.isPaused) { // Typically intervals respect pause
          callback(...args);
        }
      }, interval);
  
      this.activeTimers.add(intervalId);
      return intervalId;
    }
  
    // Remove a specific timer
    removeTimer(timerId) {
      if (this.activeTimers.has(timerId)) {
        clearTimeout(timerId); // Works for both setTimeout and setInterval
        clearInterval(timerId);
        this.activeTimers.delete(timerId);
      }
    }
  
    // Clear all active timers
    clearAllTimers() {
      this.activeTimers.forEach(timerId => {
        clearTimeout(timerId);
        clearInterval(timerId);
      });
      this.activeTimers.clear();
    }
  
    // Reset the game loop (for restarting)
    reset() {
      this.stop(); // Ensures cleanup
      this.deltaTime = 0;
      this.lastTime = 0;
      this.fps = 60; // Reset to default
      this.frameCount = 0;
      this.fpsUpdateTimer = 0;
      this.isPaused = false;
      // Callbacks should be re-initialized by the caller via init()
      this.updateCallback = null;
      this.renderCallback = null;
    }
  
    // Cleanup and destroy
    destroy() {
      this.stop();
      this.updateCallback = null;
      this.renderCallback = null;
    }
  }
  
  // Singleton instance
  let gameLoopInstance = null;
  
  // Factory function to get or create game loop instance
  export function getGameLoop() {
    if (!gameLoopInstance) {
      gameLoopInstance = new GameLoop();
    }
    return gameLoopInstance;
  }
  
  // Reset the singleton (for game restart)
  export function resetGameLoop() {
    if (gameLoopInstance) {
      gameLoopInstance.destroy(); // Properly clean up the old instance
    }
    gameLoopInstance = new GameLoop(); // Create a new one
    return gameLoopInstance;
  }
  
  // Helper class for managing game phases (if you decide to use it later)
  // For now, it's not directly used by the GameLoop itself.
  export class GamePhaseManager {
    // ... (keep the GamePhaseManager class as is)
    constructor() {
      this.phases = new Map();
      this.currentPhase = null;
      this.transitions = new Map();
    }
  
    // Register a game phase
    registerPhase(name, phase) {
      this.phases.set(name, phase);
    }
  
    // Register a transition between phases
    registerTransition(from, to, condition) {
      if (!this.transitions.has(from)) {
        this.transitions.set(from, []);
      }
      this.transitions.get(from).push({ to, condition });
    }
  
    // Set the current phase
    setPhase(name) {
      if (this.currentPhase && this.phases.get(this.currentPhase)?.onExit) {
        this.phases.get(this.currentPhase).onExit();
      }
  
      this.currentPhase = name;
  
      if (this.phases.get(name)?.onEnter) {
        this.phases.get(name).onEnter();
      }
    }
  
    // Update the current phase
    update(deltaTime, gameState) {
      if (!this.currentPhase) return;
  
      const phase = this.phases.get(this.currentPhase);
      if (phase?.update) {
        phase.update(deltaTime, gameState);
      }
  
      // Check for transitions
      const transitions = this.transitions.get(this.currentPhase);
      if (transitions) {
        for (const transition of transitions) {
          if (transition.condition(gameState)) {
            this.setPhase(transition.to);
            break;
          }
        }
      }
    }
  
    // Render the current phase
    render(ctx, gameState) {
      if (!this.currentPhase) return;
  
      const phase = this.phases.get(this.currentPhase);
      if (phase?.render) {
        phase.render(ctx, gameState);
      }
    }
  
    // Reset all phases
    reset() {
      if (this.currentPhase && this.phases.get(this.currentPhase)?.onExit) {
        this.phases.get(this.currentPhase).onExit();
      }
      this.currentPhase = null;
    }
  }
  
  
  export default GameLoop; // Export the class itself as default if needed elsewhere