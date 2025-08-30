import { useState, useEffect, useRef, useCallback } from 'react';
import { getInitialGameState, getInitialAbilities } from '../constants/gameConstants.js';
import { Player } from '../entities/Player.js'; // Assuming Player.js uses: export class Player
import { getGameLoop, resetGameLoop } from '../systems/GameLoop.js';
import { checkAchievements, resetAchievementProgress } from '../constants/achievements.js';

export function useGameState() {
  const [gameState, setGameState] = useState(getInitialGameState);
  const [abilities, setAbilities] = useState(getInitialAbilities); // Added abilities state here
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  const playerRef = useRef(null);
  const gameLoopRef = useRef(null); // This will be the GameLoop class instance
  const inputRef = useRef({ w: false, a: false, s: false, d: false });
  const mouseRef = useRef({ x: 400, y: 300, down: false });
  const achievementProgressRef = useRef(resetAchievementProgress());

  const cleanupRef = useRef({
    timers: new Set(),
    listeners: new Map()
  });

  // Initialize player entity AND GameLoop
  useEffect(() => {
    // Initialize Player
    if (!playerRef.current) {
      console.log("Initializing Player in useGameState useEffect...");
      playerRef.current = new Player(gameState.player); // gameState.player is from initial state
      // After initializing, we might want to ensure a re-render if UltimatePixelGame depends on it.
      // Often, the first game loop update or another state change will trigger this.
    }

    // Initialize GameLoop (moved here for better control)
    if (!gameLoopRef.current) {
        console.log("Initializing GameLoop in useGameState useEffect...");
        gameLoopRef.current = getGameLoop(); // Get or create the singleton
    }
    setIsLoading(false); // Player and GameLoop refs should be set now

    // Cleanup for the game loop instance when the component unmounts
    // Or when useGameState is no longer used.
    return () => {
        if (gameLoopRef.current && gameLoopRef.current.isRunning) {
            console.log("Stopping GameLoop from useGameState cleanup...");
            gameLoopRef.current.stop();
        }
        // gameLoopRef.current.destroy(); // If you have a destroy method to nullify instance
    };
  }, []); // Empty dependency array: runs once after initial render.

  // Update player entity's internal state when gameState.player changes from outside (e.g. loading saved game)
  useEffect(() => {
    if (playerRef.current && gameState.player) {
      // This is more for synchronizing if gameState.player is set externally,
      // not for changes originating from playerRef.current methods.
      const pState = gameState.player;
      playerRef.current.x = pState.x;
      playerRef.current.y = pState.y;
      playerRef.current.health = pState.health;
      playerRef.current.maxHealth = pState.maxHealth;
      playerRef.current.mana = pState.mana;
      playerRef.current.maxMana = pState.maxMana;
      playerRef.current.level = pState.level;
      playerRef.current.experience = pState.experience;
      playerRef.current.experienceToNext = pState.experienceToNext;
      playerRef.current.speed = pState.speed;
      playerRef.current.damage = pState.damage;
      playerRef.current.critChance = pState.critChance;
      playerRef.current.critMultiplier = pState.critMultiplier;
      playerRef.current.coins = pState.coins;
    }
  }, [gameState.player]); // Runs when gameState.player object reference changes

  // Safe timer/listener management (keep as is)
  const addTimer = useCallback((callback, delay) => { /* ... */ }, []);
  const addInterval = useCallback((callback, interval) => { /* ... */ }, []);
  const clearTimer = useCallback((timerId) => { /* ... */ }, []);
  const clearAllTimers = useCallback(() => { /* ... */ }, []);
  const addEventListener = useCallback((element, event, handler) => { /* ... */ }, []);
  const removeEventListener = useCallback((element, event, handler) => { /* ... */ }, []);
  const clearAllEventListeners = useCallback(() => { /* ... */ }, []);


  // Update game state WITH the player's current state from the Player object
  const syncPlayerState = useCallback(() => {
    if (playerRef.current) {
      setGameState(prev => {
        const currentPlayerState = playerRef.current.getState();
        // Only update if there's an actual change to prevent infinite loops
        if (JSON.stringify(prev.player) !== JSON.stringify(currentPlayerState)) {
          return { ...prev, player: currentPlayerState };
        }
        return prev;
      });
    }
  }, []); // Dependencies: setGameState, playerRef

  // Update abilities cooldowns - This should be handled by AbilityManager which calls setAbilities directly
  // const updateAbilitiesState = useCallback((deltaTime) => { ... }, [setAbilities]);
  // We will rely on the updateAbilitiesLogic from useAbilities hook to call AbilityManager.update


  const checkAndUnlockAchievements = useCallback((context = {}) => { /* ... */ }, [gameState, setGameState]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
    if (gameLoopRef.current) {
      gameLoopRef.current.pause();
    }
  }, [gameLoopRef]); // Removed setGameState from deps as it's stable

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
    if (gameLoopRef.current) {
      gameLoopRef.current.resume();
    }
  }, [gameLoopRef]); // Removed setGameState from deps

  const restartGame = useCallback(() => {
    setIsLoading(true);
    console.log("Restarting game...");

    if (gameLoopRef.current) {
      console.log("Stopping current game loop for restart...");
      gameLoopRef.current.stop(); // Stop it
      // gameLoopRef.current.reset(); // or reset it if it clears callbacks
    }
    
    clearAllTimers();
    clearAllEventListeners(); // Assuming these are correctly implemented

    const newInitialGameState = getInitialGameState();
    setGameState(newInitialGameState);
    setAbilities(getInitialAbilities());

    if (playerRef.current) {
      console.log("Resetting player entity...");
      playerRef.current.reset(newInitialGameState.player);
    } else {
      console.log("Re-initializing player entity for restart...");
      playerRef.current = new Player(newInitialGameState.player);
    }

    achievementProgressRef.current = resetAchievementProgress();
    inputRef.current = { w: false, a: false, s: false, d: false };
    mouseRef.current = { x: 400, y: 300, down: false };

    // Ensure we get a fresh loop instance that's not already running
    // gameLoopRef.current = resetGameLoop(); // This creates a new instance
    // Or, if getGameLoop is a true singleton that can be reset and restarted:
    if (gameLoopRef.current) {
        gameLoopRef.current.reset(); // Ensure it's ready for new init/start
    } else {
        gameLoopRef.current = getGameLoop();
    }


    // The game loop should be started by the component that uses it (e.g., GameCanvas)
    // once it has the update/render functions.
    console.log("Game state reset. Waiting for GameCanvas to start loop.");
    setIsLoading(false);
  }, [clearAllTimers, clearAllEventListeners, gameLoopRef]); // Added gameLoopRef

  // Cleanup on unmount of the component using this hook
  useEffect(() => {
    return () => {
      console.log("useGameState unmounting - cleaning up timers and listeners.");
      clearAllTimers();
      clearAllEventListeners();
      if (gameLoopRef.current) {
        console.log("Destroying GameLoop from useGameState unmount cleanup.");
        gameLoopRef.current.destroy(); // Ensure this method exists and cleans up the loop
        gameLoopRef.current = null; // Help with GC
      }
    };
  }, [clearAllTimers, clearAllEventListeners]);


  return {
    gameState,
    setGameState,
    abilities,         // Pass abilities state
    setAbilities,      // Pass abilities setter
    isLoading,
    playerRef,
    gameLoopRef,       // Pass the gameLoopRef
    inputRef,
    mouseRef,
    achievementProgressRef,
    addTimer,
    addInterval,
    clearTimer,
    syncPlayerState,
    // updateAbilities: updateAbilitiesState, // Renamed to avoid confusion with the one from useAbilities
    checkAndUnlockAchievements,
    pauseGame,
    resumeGame,
    restartGame
  };
}

export function useGameInput(inputRef, mouseRef, canvasRef) {
  const handleKeyDown = useCallback((e) => {
    switch(e.key.toLowerCase()) {
      case 'w': inputRef.current.w = true; break;
      case 'a': inputRef.current.a = true; break;
      case 's': inputRef.current.s = true; break;
      case 'd': inputRef.current.d = true; break;
    }
  }, [inputRef]);

  const handleKeyUp = useCallback((e) => {
    switch(e.key.toLowerCase()) {
      case 'w': inputRef.current.w = false; break;
      case 'a': inputRef.current.a = false; break;
      case 's': inputRef.current.s = false; break;
      case 'd': inputRef.current.d = false; break;
    }
  }, [inputRef]);

  const handleMouseMove = useCallback((e) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }
  }, [mouseRef, canvasRef]);

  const handleMouseDown = useCallback((e) => {
    mouseRef.current.down = true;
  }, [mouseRef]);

  const handleMouseUp = useCallback((e) => {
    mouseRef.current.down = false;
  }, [mouseRef]);

  // Setup and cleanup
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousemove', handleMouseMove);
      canvasRef.current.addEventListener('mousedown', handleMouseDown);
      canvasRef.current.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
        canvasRef.current.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handleMouseDown, handleMouseUp, canvasRef]);
}