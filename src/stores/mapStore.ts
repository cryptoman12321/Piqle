import { create } from 'zustand';

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  address: string;
}

export interface Court {
  id: string;
  name: string;
  location: Location;
  type: 'indoor' | 'outdoor';
  surface: 'concrete' | 'asphalt' | 'wood' | 'turf';
  numberOfCourts: number;
  isAvailable: boolean;
  rating: number;
  price: number;
  amenities: string[];
  photos: string[];
  operatingHours: {
    open: string;
    close: string;
    daysOpen: string[];
  };
}

export interface GameEvent {
  id: string;
  title: string;
  type: 'pickup' | 'league' | 'tournament' | 'lesson';
  location: Location;
  court: Court;
  startTime: Date;
  endTime: Date;
  maxPlayers: number;
  currentPlayers: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  price: number;
  description: string;
  organizer: {
    id: string;
    name: string;
    photo: string;
    rating: number;
  };
  participants: Array<{
    id: string;
    name: string;
    photo: string;
    skillLevel: string;
  }>;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface MapState {
  // Map View
  currentLocation: Location | null;
  selectedCourt: Court | null;
  selectedEvent: GameEvent | null;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  
  // Data
  courts: Court[];
  gameEvents: GameEvent[];
  nearbyCourts: Court[];
  nearbyEvents: GameEvent[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  showCourtDetails: boolean;
  showEventDetails: boolean;
  filterType: 'all' | 'courts' | 'events';
  searchQuery: string;
}

interface MapActions {
  // Location Management
  setCurrentLocation: (location: Location) => void;
  updateMapRegion: (region: MapState['mapRegion']) => void;
  
  // Court Management
  setSelectedCourt: (court: Court | null) => void;
  addCourt: (court: Court) => void;
  updateCourt: (courtId: string, updates: Partial<Court>) => void;
  deleteCourt: (courtId: string) => void;
  toggleCourtAvailability: (courtId: string) => void;
  
  // Event Management
  setSelectedEvent: (event: GameEvent | null) => void;
  addGameEvent: (event: GameEvent) => void;
  updateGameEvent: (eventId: string, updates: Partial<GameEvent>) => void;
  deleteGameEvent: (eventId: string) => void;
  joinGameEvent: (eventId: string, playerId: string) => void;
  leaveGameEvent: (eventId: string, playerId: string) => void;
  
  // Search and Filter
  setSearchQuery: (query: string) => void;
  setFilterType: (type: MapState['filterType']) => void;
  searchCourts: (query: string) => void;
  searchEvents: (query: string) => void;
  
  // UI State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  toggleCourtDetails: (show: boolean) => void;
  toggleEventDetails: (show: boolean) => void;
  
  // Data Loading
  loadNearbyCourts: (latitude: number, longitude: number, radius: number) => Promise<void>;
  loadNearbyEvents: (latitude: number, longitude: number, radius: number) => Promise<void>;
  loadSampleData: () => void;
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
  // Initial State
  currentLocation: null,
  selectedCourt: null,
  selectedEvent: null,
  mapRegion: {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  
  courts: [],
  gameEvents: [],
  nearbyCourts: [],
  nearbyEvents: [],
  
  isLoading: false,
  error: null,
  showCourtDetails: false,
  showEventDetails: false,
  filterType: 'all',
  searchQuery: '',

  // Actions
  setCurrentLocation: (location) => {
    set({ 
      currentLocation: location,
      mapRegion: {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    });
  },

  updateMapRegion: (region) => set({ mapRegion: region }),

  setSelectedCourt: (court) => set({ selectedCourt: court }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),

  addCourt: (court) => {
    set((state) => ({
      courts: [court, ...state.courts],
      nearbyCourts: [court, ...state.nearbyCourts],
    }));
  },

  updateCourt: (courtId, updates) => {
    set((state) => ({
      courts: state.courts.map((court) =>
        court.id === courtId ? { ...court, ...updates } : court
      ),
      nearbyCourts: state.nearbyCourts.map((court) =>
        court.id === courtId ? { ...court, ...updates } : court
      ),
      selectedCourt: state.selectedCourt?.id === courtId
        ? { ...state.selectedCourt, ...updates }
        : state.selectedCourt,
    }));
  },

  deleteCourt: (courtId) => {
    set((state) => ({
      courts: state.courts.filter((court) => court.id !== courtId),
      nearbyCourts: state.nearbyCourts.filter((court) => court.id !== courtId),
      selectedCourt: state.selectedCourt?.id === courtId ? null : state.selectedCourt,
    }));
  },

  toggleCourtAvailability: (courtId) => {
    set((state) => ({
      courts: state.courts.map((court) =>
        court.id === courtId ? { ...court, isAvailable: !court.isAvailable } : court
      ),
      nearbyCourts: state.nearbyCourts.map((court) =>
        court.id === courtId ? { ...court, isAvailable: !court.isAvailable } : court
      ),
    }));
  },

  addGameEvent: (event) => {
    set((state) => ({
      gameEvents: [event, ...state.gameEvents],
      nearbyEvents: [event, ...state.nearbyEvents],
    }));
  },

  updateGameEvent: (eventId, updates) => {
    set((state) => ({
      gameEvents: state.gameEvents.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      ),
      nearbyEvents: state.nearbyEvents.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      ),
      selectedEvent: state.selectedEvent?.id === eventId
        ? { ...state.selectedEvent, ...updates }
        : state.selectedEvent,
    }));
  },

  deleteGameEvent: (eventId) => {
    set((state) => ({
      gameEvents: state.gameEvents.filter((event) => event.id !== eventId),
      nearbyEvents: state.nearbyEvents.filter((event) => event.id !== eventId),
      selectedEvent: state.selectedEvent?.id === eventId ? null : state.selectedEvent,
    }));
  },

  joinGameEvent: (eventId, playerId) => {
    set((state) => {
      const updatedEvent = state.gameEvents.find((event) => event.id === eventId);
      if (!updatedEvent) return state;

      const newEvent = {
        ...updatedEvent,
        currentPlayers: Math.min(updatedEvent.currentPlayers + 1, updatedEvent.maxPlayers),
        participants: [
          ...updatedEvent.participants,
          {
            id: playerId,
            name: 'Player',
            photo: '',
            skillLevel: 'intermediate',
          },
        ],
      };

      return {
        gameEvents: state.gameEvents.map((event) =>
          event.id === eventId ? newEvent : event
        ),
        nearbyEvents: state.nearbyEvents.map((event) =>
          event.id === eventId ? newEvent : event
        ),
      };
    });
  },

  leaveGameEvent: (eventId, playerId) => {
    set((state) => {
      const updatedEvent = state.gameEvents.find((event) => event.id === eventId);
      if (!updatedEvent) return state;

      const newEvent = {
        ...updatedEvent,
        currentPlayers: Math.max(updatedEvent.currentPlayers - 1, 0),
        participants: updatedEvent.participants.filter((p) => p.id !== playerId),
      };

      return {
        gameEvents: state.gameEvents.map((event) =>
          event.id === eventId ? newEvent : event
        ),
        nearbyEvents: state.nearbyEvents.map((event) =>
          event.id === eventId ? newEvent : event
        ),
      };
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterType: (type) => set({ filterType: type }),

  searchCourts: (query) => {
    const filtered = get().courts.filter((court) =>
      court.name.toLowerCase().includes(query.toLowerCase()) ||
      court.location.city.toLowerCase().includes(query.toLowerCase())
    );
    set({ nearbyCourts: filtered });
  },

  searchEvents: (query) => {
    const filtered = get().gameEvents.filter((event) =>
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.location.city.toLowerCase().includes(query.toLowerCase())
    );
    set({ nearbyEvents: filtered });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  toggleCourtDetails: (show) => set({ showCourtDetails: show }),
  toggleEventDetails: (show) => set({ showEventDetails: show }),

  loadNearbyCourts: async (latitude, longitude, radius) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Filter courts within radius (simplified)
      const nearby = get().courts.filter((court) => {
        const distance = Math.sqrt(
          Math.pow(court.location.latitude - latitude, 2) +
          Math.pow(court.location.longitude - longitude, 2)
        );
        return distance * 111000 <= radius; // Rough conversion to meters
      });
      
      set({ nearbyCourts: nearby });
    } catch (error) {
      set({ error: 'Failed to load nearby courts' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadNearbyEvents: async (latitude, longitude, radius) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Filter events within radius (simplified)
      const nearby = get().gameEvents.filter((event) => {
        const distance = Math.sqrt(
          Math.pow(event.location.latitude - latitude, 2) +
          Math.pow(event.location.longitude - longitude, 2)
        );
        return distance * 111000 <= radius; // Rough conversion to meters
      });
      
      set({ nearbyEvents: nearby });
    } catch (error) {
      set({ error: 'Failed to load nearby events' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadSampleData: () => {
    const sampleCourts: Court[] = [
      {
        id: '1',
        name: 'Central Park Pickleball Courts',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          address: '123 Central Park Dr, San Francisco, CA',
        },
        type: 'outdoor',
        surface: 'concrete',
        numberOfCourts: 4,
        isAvailable: true,
        rating: 4.5,
        price: 15,
        amenities: ['Parking', 'Restrooms', 'Water Fountains', 'Lighting'],
        photos: [],
        operatingHours: {
          open: '06:00',
          close: '22:00',
          daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
      },
      {
        id: '2',
        name: 'Downtown Sports Complex',
        location: {
          latitude: 37.7849,
          longitude: -122.4094,
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          address: '456 Sports Ave, San Francisco, CA',
        },
        type: 'indoor',
        surface: 'wood',
        numberOfCourts: 6,
        isAvailable: true,
        rating: 4.8,
        price: 25,
        amenities: ['Parking', 'Restrooms', 'Pro Shop', 'Café', 'Locker Rooms'],
        photos: [],
        operatingHours: {
          open: '05:00',
          close: '23:00',
          daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
      },
    ];

    const sampleEvents: GameEvent[] = [
      {
        id: '1',
        title: 'Weekend Pickup Games',
        type: 'pickup',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          address: '123 Central Park Dr, San Francisco, CA',
        },
        court: sampleCourts[0],
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 7200000), // 2 hours later
        maxPlayers: 16,
        currentPlayers: 8,
        skillLevel: 'all',
        price: 0,
        description: 'Casual pickup games for all skill levels. Come join the fun!',
        organizer: {
          id: '1',
          name: 'Mike Johnson',
          photo: '',
          rating: 4.7,
        },
        participants: [],
        status: 'upcoming',
      },
    ];

    set({ courts: sampleCourts, gameEvents: sampleEvents });
  },
}));
