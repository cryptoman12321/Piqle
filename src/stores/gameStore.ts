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
  deleteGame: (id: string) => Promise<void>;
  joinGame: (gameId: string, userId: string) => void;
  leaveGame: (gameId: string, userId: string) => void;
  
  // Data loading
  loadGames: () => Promise<void>;
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
      id: Date.now().toString(), // Simple ID generation for demo
      createdAt: new Date(),
    };
    
    set((state) => ({
      games: [newGame, ...state.games], // Add to beginning of list
    }));
    
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

  deleteGame: async (id) => {
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

  joinGame: (gameId, userId) => {
    set((state) => ({
      games: state.games.map((game) => {
        if (game.id === gameId && game.currentPlayers < game.maxPlayers) {
          return {
            ...game,
            currentPlayers: game.currentPlayers + 1,
            players: [...game.players, userId],
          };
        }
        return game;
      }),
    }));
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
        set({ games: gamesWithDates, isLoading: false });
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
