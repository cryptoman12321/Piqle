import { create } from 'zustand';

export interface NotificationSettings {
  gameInvites: boolean;
  tournamentUpdates: boolean;
  friendRequests: boolean;
  achievementUnlocks: boolean;
  gameReminders: boolean;
  weeklyDigest: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  showOnlineStatus: boolean;
  showGameHistory: boolean;
  showAchievements: boolean;
  showFriendsList: boolean;
  allowFriendRequests: boolean;
  allowGameInvites: boolean;
  allowTournamentInvites: boolean;
  showLocation: boolean;
  showSkillLevel: boolean;
}

export interface GamePreferences {
  preferredGameFormat: 'SINGLES' | 'DOUBLES' | 'MIXED';
  preferredSkillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  preferredGameDuration: number; // in minutes
  preferredGameTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANY';
  preferredLocation: string;
  autoAcceptInvites: boolean;
  showSkillBasedMatching: boolean;
  allowSkillMismatch: boolean;
}

export interface AppSettings {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: 'EN' | 'ES' | 'FR' | 'DE' | 'RU';
  units: 'METRIC' | 'IMPERIAL';
  autoSave: boolean;
  dataSync: boolean;
  offlineMode: boolean;
  analytics: boolean;
  crashReporting: boolean;
  betaFeatures: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  colorBlindMode: boolean;
  hapticFeedback: boolean;
}

export interface SettingsState {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  gamePreferences: GamePreferences;
  app: AppSettings;
  accessibility: AccessibilitySettings;
  isLoading: boolean;
  error: string | null;
}

interface SettingsActions {
  // Notification settings
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  toggleNotification: (key: keyof NotificationSettings) => void;
  
  // Privacy settings
  updatePrivacySettings: (updates: Partial<PrivacySettings>) => void;
  updateProfileVisibility: (visibility: PrivacySettings['profileVisibility']) => void;
  
  // Game preferences
  updateGamePreferences: (updates: Partial<GamePreferences>) => void;
  updatePreferredFormat: (format: GamePreferences['preferredGameFormat']) => void;
  updatePreferredSkillLevel: (level: GamePreferences['preferredSkillLevel']) => void;
  
  // App settings
  updateAppSettings: (updates: Partial<AppSettings>) => void;
  updateTheme: (theme: AppSettings['theme']) => void;
  updateLanguage: (language: AppSettings['language']) => void;
  
  // Accessibility settings
  updateAccessibilitySettings: (updates: Partial<AccessibilitySettings>) => void;
  updateFontSize: (size: AccessibilitySettings['fontSize']) => void;
  
  // Data management
  resetToDefaults: () => void;
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<boolean>;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type SettingsStore = SettingsState & SettingsActions;

const defaultNotificationSettings: NotificationSettings = {
  gameInvites: true,
  tournamentUpdates: true,
  friendRequests: true,
  achievementUnlocks: true,
  gameReminders: true,
  weeklyDigest: false,
  pushNotifications: true,
  emailNotifications: false,
  smsNotifications: false,
};

const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'PUBLIC',
  showOnlineStatus: true,
  showGameHistory: true,
  showAchievements: true,
  showFriendsList: true,
  allowFriendRequests: true,
  allowGameInvites: true,
  allowTournamentInvites: true,
  showLocation: true,
  showSkillLevel: true,
};

const defaultGamePreferences: GamePreferences = {
  preferredGameFormat: 'DOUBLES',
  preferredSkillLevel: 'INTERMEDIATE',
  preferredGameDuration: 60,
  preferredGameTime: 'ANY',
  preferredLocation: '',
  autoAcceptInvites: false,
  showSkillBasedMatching: true,
  allowSkillMismatch: true,
};

const defaultAppSettings: AppSettings = {
  theme: 'SYSTEM',
  language: 'EN',
  units: 'IMPERIAL',
  autoSave: true,
  dataSync: true,
  offlineMode: false,
  analytics: true,
  crashReporting: true,
  betaFeatures: false,
};

const defaultAccessibilitySettings: AccessibilitySettings = {
  fontSize: 'MEDIUM',
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  colorBlindMode: false,
  hapticFeedback: true,
};

// Web-compatible storage using localStorage
const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: (key: string) => window.localStorage.getItem(key),
      setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
      removeItem: (key: string) => window.localStorage.removeItem(key),
    };
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

// Load settings from storage
const loadSettingsFromStorage = () => {
  try {
    const storage = getStorage();
    const stored = storage.getItem('piqle-settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load settings from storage:', error);
  }
  return null;
};

// Save settings to storage
const saveSettingsToStorage = (settings: any) => {
  try {
    const storage = getStorage();
    storage.setItem('piqle-settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to storage:', error);
  }
};

export const useSettingsStore = create<SettingsStore>((set, get) => {
  // Initialize with stored settings or defaults
  const storedSettings = loadSettingsFromStorage();
  const initialState = {
    notifications: storedSettings?.notifications || defaultNotificationSettings,
    privacy: storedSettings?.privacy || defaultPrivacySettings,
    gamePreferences: storedSettings?.gamePreferences || defaultGamePreferences,
    app: storedSettings?.app || defaultAppSettings,
    accessibility: storedSettings?.accessibility || defaultAccessibilitySettings,
    isLoading: false,
    error: null,
  };

  return {
    ...initialState,

    updateNotificationSettings: (updates) => {
      set((state) => {
        const newState = { ...state, notifications: { ...state.notifications, ...updates } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    toggleNotification: (key) => {
      set((state) => {
        const newState = {
          ...state,
          notifications: {
            ...state.notifications,
            [key]: !state.notifications[key],
          },
        };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    updatePrivacySettings: (updates) => {
      set((state) => {
        const newState = { ...state, privacy: { ...state.privacy, ...updates } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    updateProfileVisibility: (visibility) => {
      set((state) => {
        const newState = { ...state, privacy: { ...state.privacy, profileVisibility: visibility } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    updateGamePreferences: (updates) => {
      set((state) => {
        const newState = { ...state, gamePreferences: { ...state.gamePreferences, ...updates } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    updatePreferredFormat: (format) => {
      set((state) => {
        const newState = { ...state, gamePreferences: { ...state.gamePreferences, preferredGameFormat: format } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    updatePreferredSkillLevel: (level) => {
      set((state) => {
        const newState = { ...state, gamePreferences: { ...state.gamePreferences, preferredSkillLevel: level } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    updateAppSettings: (updates) => {
      set((state) => {
        const newState = { ...state, app: { ...state.app, ...updates } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    updateTheme: (theme) => {
      set((state) => {
        const newState = { ...state, app: { ...state.app, theme } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    updateLanguage: (language) => {
      set((state) => {
        const newState = { ...state, app: { ...state.app, language } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    updateAccessibilitySettings: (updates) => {
      set((state) => {
        const newState = { ...state, accessibility: { ...state.accessibility, ...updates } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    updateFontSize: (size) => {
      set((state) => {
        const newState = { ...state, accessibility: { ...state.accessibility, fontSize: size } };
        saveSettingsToStorage(newState);
        return newState;
      });
    },

    resetToDefaults: () => {
      const newState = {
        notifications: defaultNotificationSettings,
        privacy: defaultPrivacySettings,
        gamePreferences: defaultGamePreferences,
        app: defaultAppSettings,
        accessibility: defaultAccessibilitySettings,
        isLoading: false,
        error: null,
      };
      saveSettingsToStorage(newState);
      set(newState);
    },

    exportSettings: async () => {
      const { notifications, privacy, gamePreferences, app, accessibility } = get();
      const settingsData = {
        notifications,
        privacy,
        gamePreferences,
        app,
        accessibility,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };
      return JSON.stringify(settingsData, null, 2);
    },

    importSettings: async (settingsJson: string) => {
      try {
        const settingsData = JSON.parse(settingsJson);
        
        // Validate the imported data structure
        if (!settingsData.notifications || !settingsData.privacy || 
            !settingsData.gamePreferences || !settingsData.app || !settingsData.accessibility) {
          throw new Error('Invalid settings format');
        }

        const newState = {
          notifications: { ...defaultNotificationSettings, ...settingsData.notifications },
          privacy: { ...defaultPrivacySettings, ...settingsData.privacy },
          gamePreferences: { ...defaultGamePreferences, ...settingsData.gamePreferences },
          app: { ...defaultAppSettings, ...settingsData.app },
          accessibility: { ...defaultAccessibilitySettings, ...settingsData.accessibility },
          isLoading: false,
          error: null,
        };

        saveSettingsToStorage(newState);
        set(newState);
        return true;
      } catch (error) {
        set({ error: 'Failed to import settings: Invalid format' });
        return false;
      }
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
  };
});
