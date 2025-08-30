// src/game/hooks/useAbilities.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { getInitialAbilities } from '../constants/gameConstants';
import AbilityManager from '../abilities/AbilityManager'; // We'll need to make sure AbilityManager is correctly imported

export const useAbilities = (currentAbilities, setAbilitiesDirectly, playerRef, currentGameState, setGameStateDirectly) => {
  // Note: currentAbilities and setAbilitiesDirectly are passed from useGameState
  // This hook will primarily manage the AbilityManager instance and provide casting functions.

  const abilityManagerRef = useRef(null);

  // Initialize or update AbilityManager instance
  useEffect(() => {
    if (!abilityManagerRef.current) {
      // Pass the setAbilitiesDirectly function from useGameState to AbilityManager
      abilityManagerRef.current = new AbilityManager(currentAbilities, setAbilitiesDirectly);
    } else {
      // If AbilityManager needs to update its internal abilities state when 'currentAbilities' prop changes
      abilityManagerRef.current.abilities = currentAbilities;
      // Also update the setter if it changes, though unlikely for a top-level setter
      abilityManagerRef.current.setAbilities = setAbilitiesDirectly;
    }
  }, [currentAbilities, setAbilitiesDirectly]);

  const update = useCallback((deltaTime) => {
    if (abilityManagerRef.current) {
      const changed = abilityManagerRef.current.update(deltaTime);
      // If AbilityManager's update method directly mutates its 'abilities'
      // and we want to reflect that change in the React state managed by useGameState,
      // we might need to trigger setAbilitiesDirectly here if 'changed' is true.
      // However, AbilityManager is already constructed with setAbilitiesDirectly,
      // so it should be calling it internally when cooldowns change.
      // This 'changed' flag from AbilityManager.update might be redundant if it already calls setAbilitiesDirectly.
    }
  }, []); // Dependencies might be needed if AbilityManager interaction changes

  const cast = useCallback((abilityName, target) => {
    if (playerRef.current && abilityManagerRef.current && currentGameState && setGameStateDirectly) {
      // Ensure playerRef.current.useMana and other methods exist and are callable
      // Ensure currentGameState.enemies exists
      const castResult = abilityManagerRef.current.cast(
        abilityName,
        playerRef.current, // The Player class instance
        target,
        currentGameState // The whole gameState for context if needed by abilities
      );

      if (castResult) {
        // Player mana should have been handled by AbilityManager.cast calling player.useMana
        // The AbilityManager's cast method itself should trigger setAbilities for cooldowns.

        // Now, handle side effects of the cast like adding projectiles, particles to the main gameState
        setGameStateDirectly(prevGameState => {
          const newState = { ...prevGameState };
          if (castResult.projectile) {
            newState.projectiles = [...(newState.projectiles || []), castResult.projectile];
          }
          if (castResult.particles && castResult.particles.length > 0) {
            newState.particles = [...(newState.particles || []), ...castResult.particles];
          }
          if (castResult.floatingText) {
            newState.floatingTexts = [...(newState.floatingTexts || []), castResult.floatingText];
          }
          // Handle other potential castResult properties (e.g., buffs to player, delayed effects)
          // For example, if a shield is cast, abilityManager.cast might directly modify ability.duration,
          // and then AbilityManager.update would trigger setAbilities.
          return newState;
        });
      }
      // Return the result in case the caller needs to know if casting was successful or had specific outcomes
      return castResult;
    }
    return null; // Indicate casting failed or prerequisites not met
  }, [playerRef, currentGameState, setGameStateDirectly]); // Add abilityManagerRef.current to dependencies if its methods are redefined

  // Return the manager instance and its methods
  // The `abilities` state itself is managed by `useGameState` and passed into this hook.
  // This hook provides the *logic* to interact with those abilities.
  return {
    updateAbilities: update,
    castAbility: cast,
    abilityManager: abilityManagerRef.current, // Expose the manager instance if needed directly
  };
};