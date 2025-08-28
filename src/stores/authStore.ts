import { create } from 'zustand';
import { User } from '../types';

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
}

type AuthStore = AuthState & AuthActions;

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
  
  logout: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  }),
  
  updateUser: (updates) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },
}));
