import { create } from 'zustand';
import { User, SkillLevel, Hand } from '../types';
import { websocketService } from '../services/websocketService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  authenticateUser: (email: string, password: string) => Promise<boolean>;
}

type AuthStore = AuthState & AuthActions;

// Predefined users
const predefinedUsers: User[] = [
  {
    id: 'user1',
    email: '2',
    firstName: 'Sol',
    lastName: 'Shats',
    city: 'New York',
    country: 'USA',
    skillLevel: SkillLevel.INTERMEDIATE,
    hand: Hand.RIGHT,
    isOnline: true,
    lastOnlineTime: new Date(),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'user2',
    email: '1',
    firstName: 'Vlad',
    lastName: 'Shetinin',
    city: 'New York',
    country: 'USA',
    skillLevel: SkillLevel.ADVANCED,
    hand: Hand.RIGHT,
    isOnline: true,
    lastOnlineTime: new Date(),
    createdAt: new Date('2024-01-01'),
  },
];

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => set({ token }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  login: (user, token) => set({
    user,
    token,
    isAuthenticated: true,
    isLoading: false,
  }),
  
  logout: () => {
    // Disconnect WebSocket before logout
    websocketService.disconnect();
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  
  updateUser: (updates) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },

  authenticateUser: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email and password
      const user = predefinedUsers.find(u => u.email === email);
      
      if (user && password === email) { // Password matches email for simplicity
        const token = `token_${user.id}_${Date.now()}`;
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Connect to WebSocket after successful authentication
        websocketService.connect(user.id, token);
        
        return true;
      } else {
        set({ isLoading: false });
        return false;
      }
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },
}));
