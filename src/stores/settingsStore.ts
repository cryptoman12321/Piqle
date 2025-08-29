import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      notifications: defaultNotificationSettings,
      privacy: defaultPrivacySettings,
      gamePreferences: defaultGamePreferences,
      app: defaultAppSettings,
      accessibility: defaultAccessibilitySettings,
      isLoading: false,
      error: null,

      updateNotificationSettings: (updates) => {
        set((state) => ({
          notifications: { ...state.notifications, ...updates },
        }));
      },

      toggleNotification: (key) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: !state.notifications[key],
          },
        }));
      },

      updatePrivacySettings: (updates) => {
        set((state) => ({
          privacy: { ...state.privacy, ...updates },
        }));
      },

      updateProfileVisibility: (visibility) => {
        set((state) => ({
          privacy: { ...state.privacy, profileVisibility: visibility },
        }));
      },

      updateGamePreferences: (updates) => {
        set((state) => ({
          gamePreferences: { ...state.gamePreferences, ...updates },
        }));
      },

      updatePreferredFormat: (format) => {
        set((state) => ({
          gamePreferences: { ...state.gamePreferences, preferredGameFormat: format },
        }));
      },

      updatePreferredSkillLevel: (level) => {
        set((state) => ({
          gamePreferences: { ...state.gamePreferences, preferredSkillLevel: level },
        }));
      },

      updateAppSettings: (updates) => {
        set((state) => ({
          app: { ...state.app, ...updates },
        }));
      },

      updateTheme: (theme) => {
        set((state) => ({
          app: { ...state.app, theme },
        }));
      },

      updateLanguage: (language) => {
        set((state) => ({
          app: { ...state.app, language },
        }));
      },

      updateAccessibilitySettings: (updates) => {
        set((state) => ({
          accessibility: { ...state.accessibility, ...updates },
        }));
      },

      updateFontSize: (size) => {
        set((state) => ({
          accessibility: { ...state.accessibility, fontSize: size },
        }));
      },

      resetToDefaults: () => {
        set({
          notifications: defaultNotificationSettings,
          privacy: defaultPrivacySettings,
          gamePreferences: defaultGamePreferences,
          app: defaultAppSettings,
          accessibility: defaultAccessibilitySettings,
        });
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

          set({
            notifications: { ...defaultNotificationSettings, ...settingsData.notifications },
            privacy: { ...defaultPrivacySettings, ...settingsData.privacy },
            gamePreferences: { ...defaultGamePreferences, ...settingsData.gamePreferences },
            app: { ...defaultAppSettings, ...settingsData.app },
            accessibility: { ...defaultAccessibilitySettings, ...settingsData.accessibility },
          });

          return true;
        } catch (error) {
          set({ error: 'Failed to import settings: Invalid format' });
          return false;
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'piqle-settings',
      storage: Platform.OS === 'web' ? undefined : createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        privacy: state.privacy,
        gamePreferences: state.gamePreferences,
        app: state.app,
        accessibility: state.accessibility,
      }),
    }
  )
);
