import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore, ThemeMode } from '../stores/themeStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';

const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useThemeStore();
  const { user, logout } = useAuthStore();
  const {
    notifications,
    privacy,
    gamePreferences,
    app,
    accessibility,
    updateNotificationSettings,
    updatePrivacySettings,
    updateGamePreferences,
    updateAppSettings,
    updateAccessibilitySettings,
    resetToDefaults,
    exportSettings,
    importSettings,
  } = useSettingsStore();

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const styles = createStyles(theme);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all your settings to default values. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetToDefaults },
      ]
    );
  };

  const handleExportSettings = async () => {
    try {
      const settingsJson = await exportSettings();
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([settingsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'piqle-settings.json';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For mobile, use Share API
        await Share.share({
          message: settingsJson,
          title: 'Piqle Settings Export',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export settings');
    }
  };

  const handleImportSettings = () => {
    Alert.alert(
      'Import Settings',
      'This feature requires you to paste your settings JSON. Please copy your settings and paste them in the next dialog.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {
          // In a real app, you'd show a text input or file picker
          Alert.alert('Info', 'Settings import will be implemented in the next version');
        }},
      ]
    );
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const renderSectionHeader = (title: string, icon: string, section: string) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
      activeOpacity={0.7}
    >
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name={icon as any} size={24} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Ionicons
        name={activeSection === section ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );

  const renderSwitch = (
    value: boolean,
    onValueChange: (value: boolean) => void,
    label: string,
    description?: string
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={value ? theme.colors.surface : theme.colors.textSecondary}
      />
    </View>
  );

  const renderOptionSelector = (
    value: string,
    options: { label: string; value: string }[],
    onSelect: (value: string) => void,
    label: string,
    description?: string
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.optionSelector}
        onPress={() => {
          Alert.alert(
            label,
            'Select an option:',
            options.map(option => ({
              text: option.label,
              onPress: () => onSelect(option.value),
            }))
          );
        }}
      >
        <Text style={styles.optionValue}>
          {options.find(opt => opt.value === value)?.label || value}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>
                Customize your Piqle experience
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          {renderSectionHeader('Notifications', 'notifications', 'notifications')}
          {activeSection === 'notifications' && (
            <View style={styles.sectionContent}>
              {renderSwitch(
                notifications.gameInvites,
                (value) => updateNotificationSettings({ gameInvites: value }),
                'Game Invites',
                'Get notified when someone invites you to play'
              )}
              {renderSwitch(
                notifications.tournamentUpdates,
                (value) => updateNotificationSettings({ tournamentUpdates: value }),
                'Tournament Updates',
                'Receive updates about tournaments you\'re registered for'
              )}
              {renderSwitch(
                notifications.friendRequests,
                (value) => updateNotificationSettings({ friendRequests: value }),
                'Friend Requests',
                'Get notified when someone sends you a friend request'
              )}
              {renderSwitch(
                notifications.achievementUnlocks,
                (value) => updateNotificationSettings({ achievementUnlocks: value }),
                'Achievement Unlocks',
                'Celebrate when you unlock new achievements'
              )}
              {renderSwitch(
                notifications.gameReminders,
                (value) => updateNotificationSettings({ gameReminders: value }),
                'Game Reminders',
                'Get reminded about upcoming games'
              )}
              {renderSwitch(
                notifications.weeklyDigest,
                (value) => updateNotificationSettings({ weeklyDigest: value }),
                'Weekly Digest',
                'Receive a weekly summary of your activity'
              )}
              {renderSwitch(
                notifications.pushNotifications,
                (value) => updateNotificationSettings({ pushNotifications: value }),
                'Push Notifications',
                'Enable push notifications on your device'
              )}
            </View>
          )}
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          {renderSectionHeader('Privacy & Security', 'shield-checkmark', 'privacy')}
          {activeSection === 'privacy' && (
            <View style={styles.sectionContent}>
              {renderOptionSelector(
                privacy.profileVisibility,
                [
                  { label: 'Public', value: 'PUBLIC' },
                  { label: 'Friends Only', value: 'FRIENDS_ONLY' },
                  { label: 'Private', value: 'PRIVATE' },
                ],
                (value) => updatePrivacySettings({ profileVisibility: value as any }),
                'Profile Visibility',
                'Control who can see your profile'
              )}
              {renderSwitch(
                privacy.showOnlineStatus,
                (value) => updatePrivacySettings({ showOnlineStatus: value }),
                'Show Online Status',
                'Let others see when you\'re online'
              )}
              {renderSwitch(
                privacy.showGameHistory,
                (value) => updatePrivacySettings({ showGameHistory: value }),
                'Show Game History',
                'Display your game history to others'
              )}
              {renderSwitch(
                privacy.showAchievements,
                (value) => updatePrivacySettings({ showAchievements: value }),
                'Show Achievements',
                'Display your achievements to others'
              )}
              {renderSwitch(
                privacy.allowFriendRequests,
                (value) => updatePrivacySettings({ allowFriendRequests: value }),
                'Allow Friend Requests',
                'Let others send you friend requests'
              )}
              {renderSwitch(
                privacy.showLocation,
                (value) => updatePrivacySettings({ showLocation: value }),
                'Show Location',
                'Display your city/location to others'
              )}
            </View>
          )}
        </View>

        {/* Game Preferences Section */}
        <View style={styles.section}>
          {renderSectionHeader('Game Preferences', 'game-controller', 'gamePreferences')}
          {activeSection === 'gamePreferences' && (
            <View style={styles.sectionContent}>
              {renderOptionSelector(
                gamePreferences.preferredGameFormat,
                [
                  { label: 'Singles', value: 'SINGLES' },
                  { label: 'Doubles', value: 'DOUBLES' },
                  { label: 'Mixed', value: 'MIXED' },
                ],
                (value) => updateGamePreferences({ preferredGameFormat: value as any }),
                'Preferred Game Format',
                'Your preferred way to play'
              )}
              {renderOptionSelector(
                gamePreferences.preferredSkillLevel,
                [
                  { label: 'Beginner', value: 'BEGINNER' },
                  { label: 'Intermediate', value: 'INTERMEDIATE' },
                  { label: 'Advanced', value: 'ADVANCED' },
                  { label: 'Expert', value: 'EXPERT' },
                ],
                (value) => updateGamePreferences({ preferredSkillLevel: value as any }),
                'Preferred Skill Level',
                'Your preferred skill level for games'
              )}
              {renderSwitch(
                gamePreferences.autoAcceptInvites,
                (value) => updateGamePreferences({ autoAcceptInvites: value }),
                'Auto-Accept Invites',
                'Automatically accept game invitations from friends'
              )}
              {renderSwitch(
                gamePreferences.showSkillBasedMatching,
                (value) => updateGamePreferences({ showSkillBasedMatching: value }),
                'Skill-Based Matching',
                'Show games that match your skill level'
              )}
            </View>
          )}
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          {renderSectionHeader('App Settings', 'settings', 'appSettings')}
          {activeSection === 'appSettings' && (
            <View style={styles.sectionContent}>
              {renderOptionSelector(
                themeMode,
                [
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                  { label: 'System', value: 'system' },
                ],
                (value) => setThemeMode(value as ThemeMode),
                'Theme',
                'Choose your preferred app theme'
              )}
              {renderOptionSelector(
                app.language,
                [
                  { label: 'English', value: 'EN' },
                  { label: 'Español', value: 'ES' },
                  { label: 'Français', value: 'FR' },
                  { label: 'Deutsch', value: 'DE' },
                  { label: 'Русский', value: 'RU' },
                ],
                (value) => updateAppSettings({ language: value as any }),
                'Language',
                'Choose your preferred language'
              )}
              {renderOptionSelector(
                app.units,
                [
                  { label: 'Imperial (ft, mi)', value: 'IMPERIAL' },
                  { label: 'Metric (m, km)', value: 'METRIC' },
                ],
                (value) => updateAppSettings({ units: value as any }),
                'Units',
                'Choose your preferred measurement units'
              )}
              {renderSwitch(
                app.autoSave,
                (value) => updateAppSettings({ autoSave: value }),
                'Auto Save',
                'Automatically save your changes'
              )}
              {renderSwitch(
                app.dataSync,
                (value) => updateAppSettings({ dataSync: value }),
                'Data Sync',
                'Sync your data across devices'
              )}
              {renderSwitch(
                app.analytics,
                (value) => updateAppSettings({ analytics: value }),
                'Analytics',
                'Help improve Piqle with anonymous usage data'
              )}
            </View>
          )}
        </View>

        {/* Accessibility Section */}
        <View style={styles.section}>
          {renderSectionHeader('Accessibility', 'accessibility', 'accessibility')}
          {activeSection === 'accessibility' && (
            <View style={styles.sectionContent}>
              {renderOptionSelector(
                accessibility.fontSize,
                [
                  { label: 'Small', value: 'SMALL' },
                  { label: 'Medium', value: 'MEDIUM' },
                  { label: 'Large', value: 'LARGE' },
                  { label: 'Extra Large', value: 'EXTRA_LARGE' },
                ],
                (value) => updateAccessibilitySettings({ fontSize: value as any }),
                'Font Size',
                'Adjust text size for better readability'
              )}
              {renderSwitch(
                accessibility.highContrast,
                (value) => updateAccessibilitySettings({ highContrast: value }),
                'High Contrast',
                'Increase contrast for better visibility'
              )}
              {renderSwitch(
                accessibility.reduceMotion,
                (value) => updateAccessibilitySettings({ reduceMotion: value }),
                'Reduce Motion',
                'Reduce animations and motion effects'
              )}
              {renderSwitch(
                accessibility.hapticFeedback,
                (value) => updateAccessibilitySettings({ hapticFeedback: value }),
                'Haptic Feedback',
                'Enable vibration feedback for interactions'
              )}
            </View>
          )}
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          {renderSectionHeader('Data Management', 'cloud-upload', 'dataManagement')}
          {activeSection === 'dataManagement' && (
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.actionButton} onPress={handleExportSettings}>
                <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Export Settings</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleImportSettings}>
                <Ionicons name="cloud-upload-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Import Settings</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleResetSettings}>
                <Ionicons name="refresh-outline" size={20} color={theme.colors.error} />
                <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                  Reset to Defaults
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="person-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Account</Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>About Piqle</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                Logout
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Piqle v0.0.9</Text>
          <Text style={styles.versionSubtext}>Built with ❤️ for pickleball players</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerGradient: {
    padding: theme.spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    gap: 4,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  section: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  sectionContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  optionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  versionSection: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default SettingsScreen;
