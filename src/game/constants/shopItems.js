// Shop items configuration
// Each item has a unique ID, name, description, price, and type
// Types: 'permanent' (player stat upgrades), 'ability' (ability upgrades), 'unlock' (new abilities)

export const SHOP_ITEM_TYPES = {
    PERMANENT: 'permanent',
    ABILITY: 'ability',
    UNLOCK: 'unlock'
  };
  
  export const shopItems = [
    // Permanent upgrades (Player stats)
    {
      id: 'health_upgrade',
      name: 'Health Boost',
      description: '+20 Max Health',
      price: 100,
      type: SHOP_ITEM_TYPES.PERMANENT,
      icon: '❤️',
      effect: {
        stat: 'maxHealth',
        value: 20,
        alsoHeal: true // Fully heal when purchasing
      }
    },
    {
      id: 'mana_upgrade',
      name: 'Mana Boost',
      description: '+15 Max Mana',
      price: 80,
      type: SHOP_ITEM_TYPES.PERMANENT,
      icon: '💙',
      effect: {
        stat: 'maxMana',
        value: 15,
        alsoRestore: true // Fully restore mana when purchasing
      }
    },
    {
      id: 'speed_upgrade',
      name: 'Speed Boost',
      description: '+0.5 Movement Speed',
      price: 120,
      type: SHOP_ITEM_TYPES.PERMANENT,
      icon: '🏃',
      effect: {
        stat: 'speed',
        value: 0.5
      }
    },
    {
      id: 'crit_upgrade',
      name: 'Critical Strike',
      description: '+5% Crit Chance',
      price: 150,
      type: SHOP_ITEM_TYPES.PERMANENT,
      icon: '⚔️',
      effect: {
        stat: 'critChance',
        value: 0.05
      }
    },
    {
      id: 'damage_upgrade',
      name: 'Damage Boost',
      description: '+10 Base Damage',
      price: 140,
      type: SHOP_ITEM_TYPES.PERMANENT,
      icon: '💪',
      effect: {
        stat: 'damage',
        value: 10
      }
    },
  
    // Ability upgrades
    {
      id: 'fireball_upgrade',
      name: 'Fireball Mastery',
      description: '+10 Damage, -200ms Cooldown',
      price: 200,
      type: SHOP_ITEM_TYPES.ABILITY,
      icon: '🔥',
      abilityId: 'fireball',
      effect: {
        damage: 10,
        cooldownReduction: 200 // milliseconds
      }
    },
    {
      id: 'heal_upgrade',
      name: 'Healing Mastery',
      description: '+15 Healing, -500ms Cooldown',
      price: 180,
      type: SHOP_ITEM_TYPES.ABILITY,
      icon: '✨',
      abilityId: 'heal',
      effect: {
        healAmount: 15,
        cooldownReduction: 500
      }
    },
    {
      id: 'lightning_upgrade',
      name: 'Lightning Mastery',
      description: '+20 Damage, Chain 2 Enemies',
      price: 250,
      type: SHOP_ITEM_TYPES.ABILITY,
      icon: '⚡',
      abilityId: 'lightning',
      effect: {
        damage: 20,
        chainCount: 2 // New feature: hit multiple enemies
      }
    },
    {
      id: 'shield_upgrade',
      name: 'Shield Mastery',
      description: '+1s Duration, -1s Cooldown',
      price: 220,
      type: SHOP_ITEM_TYPES.ABILITY,
      icon: '🛡️',
      abilityId: 'shield',
      effect: {
        durationIncrease: 1000, // milliseconds
        cooldownReduction: 1000
      }
    },
  
    // Unlock new abilities
    {
      id: 'meteor_unlock',
      name: 'Meteor Spell',
      description: 'Unlock devastating area spell',
      price: 300,
      type: SHOP_ITEM_TYPES.UNLOCK,
      icon: '☄️',
      abilityId: 'meteor',
      requiresLevel: 3
    },
    {
      id: 'freeze_unlock',
      name: 'Time Freeze',
      description: 'Unlock ability to freeze all enemies',
      price: 350,
      type: SHOP_ITEM_TYPES.UNLOCK,
      icon: '❄️',
      abilityId: 'freeze',
      requiresLevel: 5
    }
  ];
  
  // Helper function to get shop item by ID
  export const getShopItemById = (itemId) => {
    return shopItems.find(item => item.id === itemId);
  };
  
  // Helper function to check if player can afford item
  export const canAffordItem = (playerCoins, itemPrice) => {
    return playerCoins >= itemPrice;
  };
  
  // Helper function to check if player meets level requirement
  export const meetsLevelRequirement = (playerLevel, item) => {
    return !item.requiresLevel || playerLevel >= item.requiresLevel;
  };
  
  // Helper function to check if item is already purchased (for unlocks)
  export const isItemPurchased = (itemId, purchasedItems) => {
    return purchasedItems.includes(itemId);
  };
  
  // Get all available items for a player
  export const getAvailableItems = (playerLevel, playerCoins, purchasedItems) => {
    return shopItems.filter(item => {
      // Skip if already purchased (for unlocks)
      if (item.type === SHOP_ITEM_TYPES.UNLOCK && isItemPurchased(item.id, purchasedItems)) {
        return false;
      }
      
      // Check level requirement
      if (!meetsLevelRequirement(playerLevel, item)) {
        return false;
      }
      
      return true;
    });
  };
  
  // Apply shop item effect to game state
  export const applyShopItemEffect = (item, gameState, setGameState, abilities, setAbilities) => {
    switch (item.type) {
      case SHOP_ITEM_TYPES.PERMANENT:
        // Apply permanent stat upgrade
        setGameState(prev => {
          const newState = { ...prev };
          const effect = item.effect;
          
          // Apply the stat change
          newState.player[effect.stat] += effect.value;
          
          // Handle special cases
          if (effect.alsoHeal) {
            newState.player.health = newState.player.maxHealth;
          }
          if (effect.alsoRestore) {
            newState.player.mana = newState.player.maxMana;
          }
          
          return newState;
        });
        break;
        
      case SHOP_ITEM_TYPES.ABILITY:
        // Apply ability upgrade
        setAbilities(prev => {
          const newAbilities = { ...prev };
          const ability = newAbilities[item.abilityId];
          const effect = item.effect;
          
          if (effect.damage) {
            ability.damage += effect.damage;
          }
          if (effect.healAmount) {
            ability.healAmount += effect.healAmount;
          }
          if (effect.cooldownReduction) {
            ability.maxCooldown = Math.max(100, ability.maxCooldown - effect.cooldownReduction);
          }
          if (effect.durationIncrease) {
            ability.maxDuration += effect.durationIncrease;
          }
          if (effect.chainCount) {
            ability.chainCount = (ability.chainCount || 0) + effect.chainCount;
          }
          
          ability.level += 1;
          
          return newAbilities;
        });
        break;
        
      case SHOP_ITEM_TYPES.UNLOCK:
        // Unlock new ability
        setAbilities(prev => {
          const newAbilities = { ...prev };
          const ability = newAbilities[item.abilityId];
          
          if (ability) {
            ability.unlocked = true;
          }
          
          return newAbilities;
        });
        break;
    }
  };
  
  export default shopItems;