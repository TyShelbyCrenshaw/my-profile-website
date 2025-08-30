// Achievement system configuration
// Each achievement has conditions, rewards, and tracking logic

export const ACHIEVEMENT_CATEGORIES = {
    COMBAT: 'combat',
    PROGRESSION: 'progression',
    SKILL: 'skill',
    COLLECTION: 'collection',
    SPECIAL: 'special'
  };
  
  export const achievementList = [
    // Combat achievements
    {
      id: 'first_kill',
      name: 'First Blood',
      description: 'Kill your first enemy',
      category: ACHIEVEMENT_CATEGORIES.COMBAT,
      icon: '🗡️',
      condition: (state) => state.enemiesKilled >= 1,
      reward: { coins: 50, experience: 100 },
      hidden: false
    },
    {
      id: 'slayer_10',
      name: 'Slayer',
      description: 'Kill 10 enemies',
      category: ACHIEVEMENT_CATEGORIES.COMBAT,
      icon: '⚔️',
      condition: (state) => state.enemiesKilled >= 10,
      reward: { coins: 75, experience: 150 },
      hidden: false
    },
    {
      id: 'slayer_50',
      name: 'Veteran Slayer',
      description: 'Kill 50 enemies',
      category: ACHIEVEMENT_CATEGORIES.COMBAT,
      icon: '🏆',
      condition: (state) => state.enemiesKilled >= 50,
      reward: { coins: 150, experience: 300 },
      hidden: false
    },
    {
      id: 'slayer_100',
      name: 'Master Slayer',
      description: 'Kill 100 enemies',
      category: ACHIEVEMENT_CATEGORIES.COMBAT,
      icon: '👑',
      condition: (state) => state.enemiesKilled >= 100,
      reward: { coins: 300, experience: 500 },
      hidden: false
    },
    {
      id: 'boss_slayer',
      name: 'Boss Slayer',
      description: 'Defeat your first boss enemy',
      category: ACHIEVEMENT_CATEGORIES.COMBAT,
      icon: '💀',
      condition: (state, context) => context?.bossKilled === true,
      reward: { coins: 200, experience: 400 },
      hidden: false
    },
  
    // Progression achievements
    {
      id: 'wave_5',
      name: 'Survivor',
      description: 'Reach wave 5',
      category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
      icon: '🌊',
      condition: (state) => state.wave >= 5,
      reward: { coins: 100, experience: 200 },
      hidden: false
    },
    {
      id: 'wave_10',
      name: 'Veteran',
      description: 'Reach wave 10',
      category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
      icon: '🎖️',
      condition: (state) => state.wave >= 10,
      reward: { coins: 200, experience: 400 },
      hidden: false
    },
    {
      id: 'wave_20',
      name: 'Elite',
      description: 'Reach wave 20',
      category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
      icon: '🏅',
      condition: (state) => state.wave >= 20,
      reward: { coins: 500, experience: 1000 },
      hidden: false
    },
    {
      id: 'level_5',
      name: 'Experienced',
      description: 'Reach level 5',
      category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
      icon: '📈',
      condition: (state) => state.player.level >= 5,
      reward: { coins: 100, experience: 0 }, // No XP reward for level achievement
      hidden: false
    },
    {
      id: 'level_10',
      name: 'Veteran Mage',
      description: 'Reach level 10',
      category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
      icon: '🧙',
      condition: (state) => state.player.level >= 10,
      reward: { coins: 250, experience: 0 },
      hidden: false
    },
  
    // Skill achievements
    {
      id: 'combo_10',
      name: 'Combo Master',
      description: 'Get a 10x combo',
      category: ACHIEVEMENT_CATEGORIES.SKILL,
      icon: '🔥',
      condition: (state) => state.combo >= 10,
      reward: { coins: 150, experience: 300 },
      hidden: false
    },
    {
      id: 'combo_20',
      name: 'Combo Legend',
      description: 'Get a 20x combo',
      category: ACHIEVEMENT_CATEGORIES.SKILL,
      icon: '💥',
      condition: (state) => state.combo >= 20,
      reward: { coins: 300, experience: 600 },
      hidden: true // Hidden until combo_10 is achieved
    },
    {
      id: 'perfectionist',
      name: 'Untouchable',
      description: 'Complete a wave without taking damage',
      category: ACHIEVEMENT_CATEGORIES.SKILL,
      icon: '🛡️',
      condition: (state, context) => context?.wavePerfect === true,
      reward: { coins: 200, experience: 400 },
      hidden: false
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Kill 20 enemies in 30 seconds',
      category: ACHIEVEMENT_CATEGORIES.SKILL,
      icon: '⚡',
      condition: (state, context) => context?.speedKills >= 20,
      reward: { coins: 250, experience: 500 },
      hidden: false
    },
    {
      id: 'survivor_pro',
      name: 'Survivor Pro',
      description: 'Survive for 10 minutes',
      category: ACHIEVEMENT_CATEGORIES.SKILL,
      icon: '⏰',
      condition: (state) => state.gameTime >= 600000, // 10 minutes in ms
      reward: { coins: 300, experience: 600 },
      hidden: false
    },
  
    // Collection achievements
    {
      id: 'rich',
      name: 'Wealthy Mage',
      description: 'Collect 500 coins',
      category: ACHIEVEMENT_CATEGORIES.COLLECTION,
      icon: '💰',
      condition: (state) => state.player.coins >= 500,
      reward: { coins: 100, experience: 200 },
      hidden: false
    },
    {
      id: 'rich_1000',
      name: 'Midas Touch',
      description: 'Collect 1000 coins',
      category: ACHIEVEMENT_CATEGORIES.COLLECTION,
      icon: '🏦',
      condition: (state) => state.player.coins >= 1000,
      reward: { coins: 200, experience: 400 },
      hidden: true
    },
    {
      id: 'shopaholic',
      name: 'Shopaholic',
      description: 'Purchase 5 items from the shop',
      category: ACHIEVEMENT_CATEGORIES.COLLECTION,
      icon: '🛒',
      condition: (state, context) => context?.purchasedItems?.length >= 5,
      reward: { coins: 150, experience: 300 },
      hidden: false
    },
  
    // Special achievements
    {
      id: 'full_health_level',
      name: 'Healthy Living',
      description: 'Level up while at full health',
      category: ACHIEVEMENT_CATEGORIES.SPECIAL,
      icon: '❤️',
      condition: (state, context) => context?.levelUpAtFullHealth === true,
      reward: { coins: 100, experience: 200 },
      hidden: true
    },
    {
      id: 'close_call',
      name: 'Close Call',
      description: 'Survive with less than 10 HP',
      category: ACHIEVEMENT_CATEGORIES.SPECIAL,
      icon: '😰',
      condition: (state) => state.player.health < 10 && state.player.health > 0,
      reward: { coins: 150, experience: 300 },
      hidden: true
    },
    {
      id: 'pacifist',
      name: 'Pacifist',
      description: 'Survive a wave without killing any enemies',
      category: ACHIEVEMENT_CATEGORIES.SPECIAL,
      icon: '☮️',
      condition: (state, context) => context?.pacifistWave === true,
      reward: { coins: 200, experience: 400 },
      hidden: true
    }
  ];
  
  // Track achievement progress
  export const achievementProgress = {
    speedKillsTimer: 0,
    speedKillsCount: 0,
    waveStartHealth: 100,
    waveEnemiesKilled: 0,
    waveDamageTaken: 0,
    purchasedItems: [],
    totalCoinsEarned: 0,
    totalExperienceEarned: 0
  };
  
  // Helper function to check all achievements
  export const checkAchievements = (gameState, setGameState, context = {}) => {
    const newAchievements = [];
    
    achievementList.forEach(achievement => {
      // Skip if already achieved
      if (gameState.achievements.includes(achievement.id)) {
        return;
      }
      
      // Skip if hidden and prerequisite not met
      if (achievement.hidden) {
        const prerequisitesMet = checkPrerequisites(achievement.id, gameState.achievements);
        if (!prerequisitesMet) {
          return;
        }
      }
      
      // Check if condition is met
      if (achievement.condition(gameState, context)) {
        newAchievements.push(achievement);
      }
    });
    
    // Apply rewards and update state
    if (newAchievements.length > 0) {
      setGameState(prev => {
        const newState = { ...prev };
        
        newAchievements.forEach(achievement => {
          // Add to achievements list
          newState.achievements.push(achievement.id);
          
          // Apply rewards
          if (achievement.reward.coins) {
            newState.player.coins += achievement.reward.coins;
          }
          if (achievement.reward.experience) {
            newState.player.experience += achievement.reward.experience;
          }
          
          // Add floating text for achievement
          newState.floatingTexts.push({
            x: 400,
            y: 200,
            text: `Achievement: ${achievement.name}!`,
            color: '#ffd700',
            life: 3000,
            maxLife: 3000,
            alpha: 1
          });
        });
        
        return newState;
      });
    }
    
    return newAchievements;
  };
  
  // Check if prerequisites for hidden achievements are met
  const checkPrerequisites = (achievementId, unlockedAchievements) => {
    switch (achievementId) {
      case 'combo_20':
        return unlockedAchievements.includes('combo_10');
      case 'rich_1000':
        return unlockedAchievements.includes('rich');
      default:
        return true;
    }
  };
  
  // Get achievement by ID
  export const getAchievementById = (achievementId) => {
    return achievementList.find(a => a.id === achievementId);
  };
  
  // Get all unlocked achievements
  export const getUnlockedAchievements = (achievementIds) => {
    return achievementList.filter(a => achievementIds.includes(a.id));
  };
  
  // Get achievement progress percentage
  export const getAchievementProgress = (gameState) => {
    const total = achievementList.length;
    const unlocked = gameState.achievements.length;
    return Math.floor((unlocked / total) * 100);
  };
  
  // Get achievements by category
  export const getAchievementsByCategory = (category) => {
    return achievementList.filter(a => a.category === category);
  };
  
  // Reset achievement progress (for new game)
  export const resetAchievementProgress = () => {
    return {
      speedKillsTimer: 0,
      speedKillsCount: 0,
      waveStartHealth: 100,
      waveEnemiesKilled: 0,
      waveDamageTaken: 0,
      purchasedItems: [],
      totalCoinsEarned: 0,
      totalExperienceEarned: 0
    };
  };
  
  export default achievementList;