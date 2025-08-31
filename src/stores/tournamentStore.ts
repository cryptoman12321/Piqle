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
      id: Date.now().toString(), // Simple ID generation for demo
      createdAt: new Date(),
    };
    
    set((state) => ({
      tournaments: [newTournament, ...state.tournaments], // Add to beginning of list
    }));
    
    // Save to AsyncStorage
    try {
      const updatedTournaments = [newTournament, ...get().tournaments];
      await AsyncStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
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
      
      if (savedTournaments) {
        const parsedTournaments = JSON.parse(savedTournaments);
        // Convert date strings back to Date objects
        const tournamentsWithDates = parsedTournaments.map((tournament: any) => ({
          ...tournament,
          startDate: new Date(tournament.startDate),
          endDate: new Date(tournament.endDate),
          registrationDeadline: new Date(tournament.registrationDeadline),
          createdAt: new Date(tournament.createdAt),
        }));
        set({ tournaments: tournamentsWithDates, isLoading: false });
      } else {
        // Load mock data if no saved tournaments
        const mockTournaments: Tournament[] = [
          {
            id: '1',
            name: 'Summer Championship 2024',
            description: 'Annual summer tournament with prizes for all divisions',
            format: TournamentFormat.DOUBLES_KNOCKOUT,
            clubId: 'club1',
            location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
            registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            maxParticipants: 32,
            currentParticipants: 24,
            players: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12', 'user13', 'user14', 'user15', 'user16', 'user17', 'user18', 'user19', 'user20', 'user21', 'user22', 'user23', 'user24'],
            skillLevel: SkillLevel.INTERMEDIATE,
            entryFee: 50,
            prizes: [
              { place: 1, amount: 1000, description: 'Championship Trophy' },
              { place: 2, amount: 500, description: 'Runner-up Medal' },
              { place: 3, amount: 250, description: 'Bronze Medal' }
            ],
            brackets: [],
            status: TournamentStatus.REGISTRATION_OPEN,
            isDUPR: true,
            createdBy: 'user1',
            createdAt: new Date(),
          },
          {
            id: '2',
            name: 'MiLP Pro Series',
            description: 'Professional tournament following Major League Pickleball format',
            format: TournamentFormat.MILP,
            clubId: 'club2',
            location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
            startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
            registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            maxParticipants: 16,
            currentParticipants: 16,
            players: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12', 'user13', 'user14', 'user15', 'user16'],
            skillLevel: SkillLevel.PROFESSIONAL,
            entryFee: 200,
            prizes: [
              { place: 1, amount: 5000, description: 'Championship Ring' },
              { place: 2, amount: 2500, description: 'Runner-up Prize' }
            ],
            brackets: [],
            status: TournamentStatus.REGISTRATION_CLOSED,
            isDUPR: true,
            createdBy: 'user2',
            createdAt: new Date(),
          },
          {
            id: '3',
            name: 'Beginner Friendly Round Robin',
            description: 'Perfect for new players to learn tournament play',
            format: TournamentFormat.DOUBLES_ROUND_ROBIN,
            clubId: 'club3',
            location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
            startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            maxParticipants: 20,
            currentParticipants: 12,
            players: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12'],
            skillLevel: SkillLevel.BEGINNER,
            entryFee: 0,
            prizes: [
              { place: 1, amount: 0, description: 'Participation Certificate' }
            ],
            brackets: [],
            status: TournamentStatus.REGISTRATION_OPEN,
            isDUPR: false,
            createdBy: 'user3',
            createdAt: new Date(),
          },
          {
            id: '4',
            name: 'Ladder League Season 2',
            description: 'Ongoing ladder competition - join anytime!',
            format: TournamentFormat.LADDER_LEAGUE,
            clubId: 'club4',
            location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            registrationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            maxParticipants: 100,
            currentParticipants: 67,
            players: Array.from({ length: 67 }, (_, i) => `user${i + 1}`),
            skillLevel: SkillLevel.ADVANCED,
            entryFee: 25,
            prizes: [
              { place: 1, amount: 500, description: 'Season Champion' },
              { place: 2, amount: 250, description: 'Season Runner-up' },
              { place: 3, amount: 100, description: 'Season Bronze' }
            ],
            brackets: [],
            status: TournamentStatus.IN_PROGRESS,
            isDUPR: true,
            createdBy: 'user4',
            createdAt: new Date(),
          },
        ];
        
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
    return tournaments.find((tournament) => tournament.id === id);
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
}));
