import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tournament, TournamentFormat, SkillLevel, TournamentStatus, Prize } from '../types';

interface TournamentState {
  tournaments: Tournament[];
  isLoading: boolean;
  error: string | null;
}

interface TournamentActions {
  // CRUD operations
  addTournament: (tournament: Omit<Tournament, 'id' | 'createdAt'>) => Promise<Tournament>;
  updateTournament: (id: string, updates: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  registerForTournament: (tournamentId: string, userId: string) => void;
  unregisterFromTournament: (tournamentId: string, userId: string) => void;
  
  // Data loading
  loadTournaments: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility methods
  getTournamentById: (id: string) => Tournament | undefined;
  getTournamentsByUser: (userId: string) => Tournament[];
  getUpcomingTournaments: () => Tournament[];
  getTournamentsByStatus: (status: TournamentStatus) => Tournament[];
}

type TournamentStore = TournamentState & TournamentActions;

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: [],
  isLoading: false,
  error: null,

  addTournament: async (tournamentData) => {
    const newTournament: Tournament = {
      ...tournamentData,
      id: `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID generation
      createdAt: new Date(),
    };
    
    set((state) => {
      // Check for duplicates
      const existingTournament = state.tournaments.find(tournament => 
        tournament.name === newTournament.name && 
        tournament.createdBy === newTournament.createdBy &&
        Math.abs(tournament.startDate.getTime() - newTournament.startDate.getTime()) < 60000 // Within 1 minute
      );
      
      if (existingTournament) {
        console.log('Duplicate tournament detected, returning existing tournament');
        return state; // Don't add duplicate
      }
      
      console.log('Adding tournament to state');
      console.log('Current tournaments count:', state.tournaments.length);
      console.log('New tournament:', newTournament);
      return {
        tournaments: [newTournament, ...state.tournaments], // Add to beginning of list
      };
    });
    
    // Save to AsyncStorage
    try {
      const updatedTournaments = [newTournament, ...get().tournaments];
      console.log('Saving to AsyncStorage:', updatedTournaments.length, 'tournaments');
      await AsyncStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
      console.log('Tournament saved to AsyncStorage successfully');
    } catch (error) {
      console.error('Error saving tournament to AsyncStorage:', error);
    }
    
    return newTournament; // Return the created tournament
  },

  updateTournament: async (id, updates) => {
    set((state) => ({
      tournaments: state.tournaments.map((tournament) =>
        tournament.id === id ? { ...tournament, ...updates } : tournament
      ),
    }));
    
    // Save to AsyncStorage
    try {
      const updatedTournaments = get().tournaments.map((tournament) =>
        tournament.id === id ? { ...tournament, ...updates } : tournament
      );
      await AsyncStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    } catch (error) {
      console.error('Error updating tournament in AsyncStorage:', error);
    }
  },

  deleteTournament: async (id) => {
    set((state) => ({
      tournaments: state.tournaments.filter((tournament) => tournament.id !== id),
    }));
    
    // Save to AsyncStorage
    try {
      const updatedTournaments = get().tournaments.filter((tournament) => tournament.id !== id);
      await AsyncStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    } catch (error) {
      console.error('Error deleting tournament from AsyncStorage:', error);
    }
  },

  registerForTournament: (tournamentId, userId) => {
    set((state) => ({
      tournaments: state.tournaments.map((tournament) => {
        if (tournament.id === tournamentId && 
            tournament.currentParticipants < tournament.maxParticipants &&
            tournament.status === TournamentStatus.REGISTRATION_OPEN &&
            !tournament.players.includes(userId)) {
          return {
            ...tournament,
            currentParticipants: tournament.currentParticipants + 1,
            players: [...tournament.players, userId],
          };
        }
        return tournament;
      }),
    }));
  },

  unregisterFromTournament: (tournamentId, userId) => {
    set((state) => ({
      tournaments: state.tournaments.map((tournament) => {
        if (tournament.id === tournamentId) {
          return {
            ...tournament,
            currentParticipants: Math.max(0, tournament.currentParticipants - 1),
            players: tournament.players.filter((id) => id !== userId),
          };
        }
        return tournament;
      }),
    }));
  },

  loadTournaments: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Load from AsyncStorage
      const savedTournaments = await AsyncStorage.getItem('tournaments');
      console.log('loadTournaments: savedTournaments from AsyncStorage:', savedTournaments);
      
      if (savedTournaments) {
        const parsedTournaments = JSON.parse(savedTournaments);
        console.log('loadTournaments: parsed tournaments:', parsedTournaments);
        // Convert date strings back to Date objects
        const tournamentsWithDates = parsedTournaments.map((tournament: any) => ({
          ...tournament,
          startDate: new Date(tournament.startDate),
          endDate: new Date(tournament.endDate),
          registrationDeadline: new Date(tournament.registrationDeadline),
          createdAt: new Date(tournament.createdAt),
        }));
        
        // Remove duplicates based on ID
        const uniqueTournaments = tournamentsWithDates.filter((tournament: Tournament, index: number, self: Tournament[]) => 
          index === self.findIndex(t => t.id === tournament.id)
        );
        
        console.log('loadTournaments: setting tournaments to state:', uniqueTournaments);
        console.log('loadTournaments: tournaments count after setting state:', uniqueTournaments.length);
        set({ tournaments: uniqueTournaments, isLoading: false });
      } else {
        console.log('loadTournaments: no saved tournaments, loading mock data');
        // Load mock data if no saved tournaments (only for demo purposes)
        // In production, this would be removed
        const mockTournaments: Tournament[] = [];
        
        set({ tournaments: mockTournaments, isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load tournaments', 
        isLoading: false 
      });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  getTournamentById: (id) => {
    const { tournaments } = get();
    console.log('getTournamentById called with:', id);
    console.log('Available tournaments:', tournaments.map(t => ({ id: t.id, name: t.name, currentParticipants: t.currentParticipants, players: t.players.length })));
    const found = tournaments.find((tournament) => tournament.id === id);
    console.log('Found tournament:', found);
    return found;
  },

  getTournamentsByUser: (userId) => {
    const { tournaments } = get();
    return tournaments.filter((tournament) => tournament.createdBy === userId);
  },

  getUpcomingTournaments: () => {
    const { tournaments } = get();
    const now = new Date();
    return tournaments
      .filter((tournament) => tournament.startDate > now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  },

  getTournamentsByStatus: (status) => {
    const { tournaments } = get();
    return tournaments.filter((tournament) => tournament.status === status);
  },

  // Clear all tournaments (for demo purposes)
  clearAllTournaments: async () => {
    try {
      await AsyncStorage.removeItem('tournaments');
      set({ tournaments: [], isLoading: false });
      console.log('All tournaments cleared from AsyncStorage and state');
    } catch (error) {
      console.error('Failed to clear tournaments:', error);
    }
  },
}));
