import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, GameFormat, SkillLevel, GameStatus } from '../types';

interface GameState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
}

interface GameActions {
  // CRUD operations
  addGame: (game: Omit<Game, 'id' | 'createdAt'>) => Promise<Game>;
  updateGame: (id: string, updates: Partial<Game>) => Promise<void>;
  deleteGame: (id: string, userId?: string) => Promise<void>;
  joinGame: (gameId: string, userId: string) => Promise<void>;
  leaveGame: (gameId: string, userId: string) => void;
  
  // Data loading
  loadGames: () => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility methods
  getGameById: (id: string) => Game | undefined;
  getGamesByUser: (userId: string) => Game[];
  getUpcomingGames: () => Game[];
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  isLoading: false,
  error: null,

  addGame: async (gameData) => {
    const newGame: Game = {
      ...gameData,
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID generation
      createdAt: new Date(),
    };
    
    set((state) => {
      // Check for duplicates
      const existingGame = state.games.find(game => 
        game.title === newGame.title && 
        game.createdBy === newGame.createdBy &&
        Math.abs(game.startTime.getTime() - newGame.startTime.getTime()) < 60000 // Within 1 minute
      );
      
      if (existingGame) {
        console.log('Duplicate game detected, returning existing game');
        return state; // Don't add duplicate
      }
      
      return {
        games: [newGame, ...state.games], // Add to beginning of list
      };
    });
    
    // Save to AsyncStorage
    try {
      const updatedGames = [newGame, ...get().games];
      await AsyncStorage.setItem('games', JSON.stringify(updatedGames));
    } catch (error) {
      console.error('Error saving game to AsyncStorage:', error);
    }
    
    return newGame; // Return the created game
  },

  updateGame: async (id, updates) => {
    set((state) => ({
      games: state.games.map((game) =>
        game.id === id ? { ...game, ...updates } : game
      ),
    }));
    
    // Save to AsyncStorage
    try {
      const updatedGames = get().games.map((game) =>
        game.id === id ? { ...game, ...updates } : game
      );
      await AsyncStorage.setItem('games', JSON.stringify(updatedGames));
    } catch (error) {
      console.error('Error updating game in AsyncStorage:', error);
    }
  },

  deleteGame: async (id, userId?: string) => {
    const game = get().games.find(g => g.id === id);
    
    // Check if user has permission to delete this game
    if (userId && game && game.createdBy !== userId) {
      throw new Error('You can only delete games that you created.');
    }
    
    set((state) => ({
      games: state.games.filter((game) => game.id !== id),
    }));
    
    // Save to AsyncStorage
    try {
      const updatedGames = get().games.filter((game) => game.id !== id);
      await AsyncStorage.setItem('games', JSON.stringify(updatedGames));
    } catch (error) {
      console.error('Error deleting game from AsyncStorage:', error);
    }
  },

  joinGame: async (gameId, userId) => {
    set((state) => ({
      games: state.games.map((game) => {
        if (game.id === gameId && game.currentPlayers < game.maxPlayers && !game.players.includes(userId)) {
          return {
            ...game,
            currentPlayers: game.currentPlayers + 1,
            players: [...game.players, userId],
          };
        }
        return game;
      }),
    }));
    
    // Save to AsyncStorage
    try {
      const updatedGames = get().games.map((game) => {
        if (game.id === gameId && game.currentPlayers < game.maxPlayers && !game.players.includes(userId)) {
          return {
            ...game,
            currentPlayers: game.currentPlayers + 1,
            players: [...game.players, userId],
          };
        }
        return game;
      });
      await AsyncStorage.setItem('games', JSON.stringify(updatedGames));
    } catch (error) {
      console.error('Error saving game to AsyncStorage:', error);
    }
  },

  leaveGame: (gameId, userId) => {
    set((state) => ({
      games: state.games.map((game) => {
        if (game.id === gameId) {
          return {
            ...game,
            currentPlayers: Math.max(0, game.currentPlayers - 1),
            players: game.players.filter((id) => id !== userId),
          };
        }
        return game;
      }),
    }));
  },

  loadGames: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Load from AsyncStorage
      const savedGames = await AsyncStorage.getItem('games');
      
      if (savedGames) {
        const parsedGames = JSON.parse(savedGames);
        // Convert date strings back to Date objects
        const gamesWithDates = parsedGames.map((game: any) => ({
          ...game,
          startTime: new Date(game.startTime),
          createdAt: new Date(game.createdAt),
        }));
        
        // Remove duplicates based on ID
        const uniqueGames = gamesWithDates.filter((game: Game, index: number, self: Game[]) => 
          index === self.findIndex(g => g.id === game.id)
        );
        
        set({ games: uniqueGames, isLoading: false });
      } else {
        // Load mock data if no saved games
        const mockGames: Game[] = [
          {
            id: '1',
            title: 'Morning Pickleball',
            description: 'Early morning doubles game at Central Park',
            format: GameFormat.DOUBLES,
            maxPlayers: 4,
            currentPlayers: 3,
            skillLevel: SkillLevel.INTERMEDIATE,
            location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
            startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            isPrivate: false,
            createdBy: 'user1',
            players: [],
            status: GameStatus.UPCOMING,
            createdAt: new Date(),
          },
          {
            id: '2',
            title: 'Weekend Tournament',
            description: 'Competitive singles tournament for advanced players',
            format: GameFormat.SINGLES,
            maxPlayers: 16,
            currentPlayers: 12,
            skillLevel: SkillLevel.ADVANCED,
            location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            isPrivate: false,
            createdBy: 'user2',
            players: [],
            status: GameStatus.UPCOMING,
            createdAt: new Date(),
          },
          {
            id: '3',
            title: 'Open Play Session',
            description: 'Casual open play for all skill levels',
            format: GameFormat.OPEN_PLAY,
            maxPlayers: 20,
            currentPlayers: 8,
            skillLevel: SkillLevel.BEGINNER,
            location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
            startTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
            isPrivate: false,
            createdBy: 'user3',
            players: [],
            status: GameStatus.UPCOMING,
            createdAt: new Date(),
          },
          {
            id: '4',
            title: 'Evening Doubles',
            description: 'Relaxed evening game under the lights',
            format: GameFormat.DOUBLES,
            maxPlayers: 4,
            currentPlayers: 2,
            skillLevel: SkillLevel.INTERMEDIATE,
            location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
            startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
            isPrivate: false,
            createdBy: 'user4',
            players: [],
            status: GameStatus.UPCOMING,
            createdAt: new Date(),
          },
        ];
        set({ games: mockGames, isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load games', 
        isLoading: false 
      });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),



  getGameById: (id) => {
    const { games } = get();
    return games.find((game) => game.id === id);
  },

  getGamesByUser: (userId) => {
    const { games } = get();
    return games.filter((game) => game.createdBy === userId);
  },

  getUpcomingGames: () => {
    const { games } = get();
    const now = new Date();
    return games
      .filter((game) => game.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  },
}));
