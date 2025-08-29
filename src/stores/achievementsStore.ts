import { create } from 'zustand';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'GAMES' | 'TOURNAMENTS' | 'SOCIAL' | 'SKILL' | 'SPECIAL';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  requirements: string[];
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  totalPoints: number;
  averageScore: number;
  winRate: number;
  longestWinStreak: number;
  currentWinStreak: number;
  friendsCount: number;
  totalPlayTime: number; // in minutes
  skillLevel: string;
  rank: string;
}

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  achievements: Achievement[];
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
}

interface AchievementsState {
  achievements: Achievement[];
  userStats: UserStats;
  isLoading: boolean;
  error: string | null;
}

interface AchievementsActions {
  // Achievement management
  unlockAchievement: (achievementId: string) => void;
  updateProgress: (achievementId: string, progress: number) => void;
  getAchievementById: (id: string) => Achievement | undefined;
  getAchievementsByCategory: (category: string) => Achievement[];
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  
  // Stats management
  updateStats: (updates: Partial<UserStats>) => void;
  incrementStat: (statKey: 'gamesPlayed' | 'gamesWon' | 'gamesLost' | 'tournamentsPlayed' | 'tournamentsWon' | 'totalPoints' | 'longestWinStreak' | 'currentWinStreak' | 'friendsCount' | 'totalPlayTime', value?: number) => void;
  getStats: () => UserStats;
  
  // Data loading
  loadAchievements: () => Promise<void>;
  loadUserStats: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type AchievementsStore = AchievementsState & AchievementsActions;

export const useAchievementsStore = create<AchievementsStore>((set, get) => ({
  achievements: [],
  userStats: {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    totalPoints: 0,
    averageScore: 0,
    winRate: 0,
    longestWinStreak: 0,
    currentWinStreak: 0,
    friendsCount: 0,
    totalPlayTime: 0,
    skillLevel: 'BEGINNER',
    rank: 'BRONZE',
  },
  isLoading: false,
  error: null,

  unlockAchievement: (achievementId) => {
    set((state) => ({
      achievements: state.achievements.map((achievement) => {
        if (achievement.id === achievementId && !achievement.isUnlocked) {
          return {
            ...achievement,
            isUnlocked: true,
            unlockedAt: new Date(),
            progress: achievement.maxProgress,
          };
        }
        return achievement;
      }),
    }));
  },

  updateProgress: (achievementId, progress) => {
    set((state) => ({
      achievements: state.achievements.map((achievement) => {
        if (achievement.id === achievementId) {
          const newProgress = Math.min(progress, achievement.maxProgress);
          const shouldUnlock = newProgress >= achievement.maxProgress && !achievement.isUnlocked;
          
          return {
            ...achievement,
            progress: newProgress,
            isUnlocked: shouldUnlock,
            unlockedAt: shouldUnlock ? new Date() : achievement.unlockedAt,
          };
        }
        return achievement;
      }),
    }));
  },

  getAchievementById: (id) => {
    const { achievements } = get();
    return achievements.find((achievement) => achievement.id === id);
  },

  getAchievementsByCategory: (category) => {
    const { achievements } = get();
    return achievements.filter((achievement) => achievement.category === category);
  },

  getUnlockedAchievements: () => {
    const { achievements } = get();
    return achievements.filter((achievement) => achievement.isUnlocked);
  },

  getLockedAchievements: () => {
    const { achievements } = get();
    return achievements.filter((achievement) => !achievement.isUnlocked);
  },

  updateStats: (updates) => {
    set((state) => ({
      userStats: { ...state.userStats, ...updates },
    }));
  },

  incrementStat: (statKey, value = 1) => {
    set((state) => {
      const currentValue = state.userStats[statKey];
      if (typeof currentValue === 'number') {
        const newStats = { ...state.userStats };
        newStats[statKey] = currentValue + value;
        
        // Update win rate when games are played
        if (statKey === 'gamesPlayed' || statKey === 'gamesWon') {
          newStats.winRate = newStats.gamesPlayed > 0 
            ? Math.round((newStats.gamesWon / newStats.gamesPlayed) * 100) 
            : 0;
        }
        
        // Update average score
        if (statKey === 'totalPoints' && newStats.gamesPlayed > 0) {
          newStats.averageScore = Math.round(newStats.totalPoints / newStats.gamesPlayed);
        }
        
        return { userStats: newStats };
      }
      return state;
    });
  },

  getStats: () => {
    const { userStats } = get();
    return userStats;
  },

  loadAchievements: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock achievements data - in real app this would come from API
      const mockAchievements: Achievement[] = [
        // Games achievements
        {
          id: 'first-game',
          name: 'First Steps',
          description: 'Play your first pickleball game',
          icon: 'game-controller',
          category: 'GAMES',
          rarity: 'COMMON',
          points: 10,
          isUnlocked: true,
          unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          progress: 1,
          maxProgress: 1,
          requirements: ['Play 1 game'],
        },
        {
          id: 'game-master',
          name: 'Game Master',
          description: 'Play 50 games',
          icon: 'trophy',
          category: 'GAMES',
          rarity: 'RARE',
          points: 50,
          isUnlocked: false,
          progress: 12,
          maxProgress: 50,
          requirements: ['Play 50 games'],
        },
        {
          id: 'winner',
          name: 'Winner',
          description: 'Win your first game',
          icon: 'star',
          category: 'GAMES',
          rarity: 'COMMON',
          points: 20,
          isUnlocked: true,
          unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          progress: 1,
          maxProgress: 1,
          requirements: ['Win 1 game'],
        },
        {
          id: 'winning-streak',
          name: 'Hot Streak',
          description: 'Win 5 games in a row',
          icon: 'flame',
          category: 'GAMES',
          rarity: 'EPIC',
          points: 100,
          isUnlocked: false,
          progress: 2,
          maxProgress: 5,
          requirements: ['Win 5 consecutive games'],
        },
        
        // Tournament achievements
        {
          id: 'tournament-debut',
          name: 'Tournament Debut',
          description: 'Participate in your first tournament',
          icon: 'medal',
          category: 'TOURNAMENTS',
          rarity: 'COMMON',
          points: 25,
          isUnlocked: false,
          progress: 0,
          maxProgress: 1,
          requirements: ['Join 1 tournament'],
        },
        {
          id: 'tournament-champion',
          name: 'Tournament Champion',
          description: 'Win a tournament',
          icon: 'crown',
          category: 'TOURNAMENTS',
          rarity: 'LEGENDARY',
          points: 500,
          isUnlocked: false,
          progress: 0,
          maxProgress: 1,
          requirements: ['Win 1 tournament'],
        },
        
        // Social achievements
        {
          id: 'social-butterfly',
          name: 'Social Butterfly',
          description: 'Make 10 friends',
          icon: 'people',
          category: 'SOCIAL',
          rarity: 'RARE',
          points: 75,
          isUnlocked: false,
          progress: 3,
          maxProgress: 10,
          requirements: ['Add 10 friends'],
        },
        {
          id: 'team-player',
          name: 'Team Player',
          description: 'Play 20 doubles games',
          icon: 'handshake',
          category: 'SOCIAL',
          rarity: 'EPIC',
          points: 150,
          isUnlocked: false,
          progress: 8,
          maxProgress: 20,
          requirements: ['Play 20 doubles games'],
        },
        
        // Skill achievements
        {
          id: 'skill-improver',
          name: 'Skill Improver',
          description: 'Reach Intermediate skill level',
          icon: 'trending-up',
          category: 'SKILL',
          rarity: 'RARE',
          points: 100,
          isUnlocked: false,
          progress: 0,
          maxProgress: 1,
          requirements: ['Reach Intermediate skill level'],
        },
        {
          id: 'expert-player',
          name: 'Expert Player',
          description: 'Reach Expert skill level',
          icon: 'diamond',
          category: 'SKILL',
          rarity: 'LEGENDARY',
          points: 1000,
          isUnlocked: false,
          progress: 0,
          maxProgress: 1,
          requirements: ['Reach Expert skill level'],
        },
        
        // Special achievements
        {
          id: 'early-adopter',
          name: 'Early Adopter',
          description: 'Join the app in its first month',
          icon: 'rocket',
          category: 'SPECIAL',
          rarity: 'EPIC',
          points: 200,
          isUnlocked: true,
          unlockedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          progress: 1,
          maxProgress: 1,
          requirements: ['Join app in first month'],
        },
        {
          id: 'weekend-warrior',
          name: 'Weekend Warrior',
          description: 'Play games on 5 consecutive weekends',
          icon: 'calendar',
          category: 'SPECIAL',
          rarity: 'RARE',
          points: 125,
          isUnlocked: false,
          progress: 2,
          maxProgress: 5,
          requirements: ['Play on 5 consecutive weekends'],
        },
      ];
      
      set({ achievements: mockAchievements, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load achievements', 
        isLoading: false 
      });
    }
  },

  loadUserStats: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock user stats - in real app this would come from API
      const mockStats: UserStats = {
        gamesPlayed: 12,
        gamesWon: 8,
        gamesLost: 4,
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        totalPoints: 156,
        averageScore: 13,
        winRate: 67,
        longestWinStreak: 3,
        currentWinStreak: 1,
        friendsCount: 3,
        totalPlayTime: 480, // 8 hours
        skillLevel: 'BEGINNER',
        rank: 'BRONZE',
      };
      
      set({ userStats: mockStats, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load user stats', 
        isLoading: false 
      });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
