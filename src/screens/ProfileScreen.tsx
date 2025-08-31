import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useAchievementsStore } from '../stores/achievementsStore';
import { SkillLevel } from '../types';
import RatingChart from '../components/RatingChart';

const ProfileScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user, updateUser } = useAuthStore();
  const { achievements, userStats } = useAchievementsStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    country: '',
    skillLevel: SkillLevel.INTERMEDIATE,
    photo: '',
  });

  const styles = createStyles(theme);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        city: user.city || '',
        country: user.country || '',
        skillLevel: user.skillLevel || SkillLevel.INTERMEDIATE,
        photo: user.photo || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in store
      updateUser({
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        city: profileData.city.trim(),
        country: profileData.country.trim(),
        skillLevel: profileData.skillLevel,
        photo: profileData.photo,
      });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        city: user.city || '',
        country: user.country || '',
        skillLevel: user.skillLevel || SkillLevel.INTERMEDIATE,
        photo: user.photo || '',
      });
    }
    setIsEditing(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileData(prev => ({ ...prev, photo: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileData(prev => ({ ...prev, photo: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose how you want to update your profile photo',
      [
        { 
          text: '📷 Take Photo', 
          onPress: takePhoto,
          style: 'default'
        },
        { 
          text: '🖼️ Choose from Library', 
          onPress: pickImage,
          style: 'default'
        },
        { 
          text: '❌ Cancel', 
          style: 'cancel' 
        },
      ]
    );
  };

  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.BEGINNER: return theme.colors.success;
      case SkillLevel.INTERMEDIATE: return theme.colors.warning;
      case SkillLevel.ADVANCED: return theme.colors.info;
      case SkillLevel.EXPERT: return theme.colors.primary;
      case SkillLevel.PROFESSIONAL: return theme.colors.secondary;
      default: return theme.colors.textSecondary;
    }
  };



  const getAchievementColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return theme.colors.textSecondary;
      case 'RARE': return theme.colors.info;
      case 'EPIC': return theme.colors.primary;
      case 'LEGENDARY': return theme.colors.secondary;
      default: return theme.colors.textSecondary;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-circle" size={64} color={theme.colors.error} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>User Not Found</Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Please log in to view your profile.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.headerTitle}>Profile</Text>
              <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Profile Picture Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={isEditing ? showImagePickerOptions : undefined}
            disabled={!isEditing}
            activeOpacity={isEditing ? 0.7 : 1}
          >
            {profileData.photo ? (
              <Image source={{ uri: profileData.photo }} style={styles.profilePhoto} />
            ) : (
              <View style={[styles.profilePhoto, styles.photoPlaceholder]}>
                <Ionicons name="person" size={48} color={theme.colors.textSecondary} />
              </View>
            )}
            {isEditing && (
              <View style={styles.photoEditOverlay}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
          
          {isEditing && (
            <View style={styles.photoActions}>
              <TouchableOpacity 
                style={styles.photoActionButton}
                onPress={showImagePickerOptions}
              >
                <Ionicons name="camera" size={16} color={theme.colors.primary} />
                <Text style={styles.photoActionText}>Change Photo</Text>
              </TouchableOpacity>
              
              {profileData.photo && (
                <TouchableOpacity 
                  style={[styles.photoActionButton, styles.removePhotoButton]}
                  onPress={() => {
                    Alert.alert(
                      'Remove Photo',
                      'Are you sure you want to remove your profile photo?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => setProfileData(prev => ({ ...prev, photo: '' })),
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash" size={16} color={theme.colors.error} />
                  <Text style={[styles.photoActionText, { color: theme.colors.error }]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {!isEditing && profileData.photo && (
            <TouchableOpacity 
              style={styles.editPhotoHint}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.editPhotoHintText}>Tap Edit Profile to change photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Form */}
        <View style={styles.form}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={profileData.firstName}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
                  placeholder="Enter first name"
                  placeholderTextColor={theme.colors.textSecondary}
                  editable={isEditing}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={profileData.lastName}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
                  placeholder="Enter last name"
                  placeholderTextColor={theme.colors.textSecondary}
                  editable={isEditing}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={profileData.email}
                editable={false}
                placeholderTextColor={theme.colors.textSecondary}
              />
              <Text style={styles.helpText}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={profileData.city}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, city: text }))}
                  placeholder="Enter city"
                  placeholderTextColor={theme.colors.textSecondary}
                  editable={isEditing}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={[styles.input, !isEditing && styles.inputDisabled]}
                  value={profileData.country}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, country: text }))}
                  placeholder="Enter country"
                  placeholderTextColor={theme.colors.textSecondary}
                  editable={isEditing}
                />
              </View>
            </View>
          </View>

          {/* Game Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Preferences</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skill Level</Text>
              <View style={styles.pickerContainer}>
                {Object.values(SkillLevel).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.skillLevelChip,
                      profileData.skillLevel === level && { backgroundColor: getSkillLevelColor(level) }
                    ]}
                    onPress={() => isEditing && setProfileData(prev => ({ ...prev, skillLevel: level }))}
                    disabled={!isEditing}
                  >
                    <Text style={[
                      styles.skillLevelText,
                      profileData.skillLevel === level && { color: 'white' }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>

          {/* Match History & Rating Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match History & Rating Progress</Text>
            
            {/* Dynamic Rating Chart */}
            <RatingChart 
              data={[]} 
              currentRating={4.25} 
            />

            {/* Recent Matches */}
            <View style={styles.matchesSection}>
              <Text style={styles.matchesSubtitle}>Recent Matches</Text>
              <View style={styles.matchItem}>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchType}>Doubles</Text>
                  <Text style={styles.matchResult}>W 11-8, 11-6</Text>
                </View>
                <View style={styles.matchDetails}>
                  <Text style={styles.matchDate}>2 days ago</Text>
                  <Text style={styles.matchRating}>+0.08</Text>
                </View>
              </View>
              
              <View style={styles.matchItem}>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchType}>Singles</Text>
                  <Text style={styles.matchResult}>L 9-11, 11-9, 8-11</Text>
                </View>
                <View style={styles.matchDetails}>
                  <Text style={styles.matchDate}>1 week ago</Text>
                  <Text style={styles.matchRating}>-0.12</Text>
                </View>
              </View>
              
              <View style={styles.matchItem}>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchType}>Doubles</Text>
                  <Text style={styles.matchResult}>W 11-7, 11-4</Text>
                </View>
                <View style={styles.matchDetails}>
                  <Text style={styles.matchDate}>2 weeks ago</Text>
                  <Text style={styles.matchRating}>+0.10</Text>
                </View>
              </View>
            </View>

            {/* View All Matches Button */}
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllButtonText}>View All Matches</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Account Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.infoLabel}>Member since</Text>
              <Text style={styles.infoValue}>
                {user.createdAt.toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.infoLabel}>Last online</Text>
              <Text style={styles.infoValue}>
                {user.lastOnlineTime ? user.lastOnlineTime.toLocaleDateString() : 'Never'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons 
                name={user.isOnline ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={user.isOnline ? theme.colors.success : theme.colors.textSecondary} 
              />
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: user.isOnline ? theme.colors.success : theme.colors.textSecondary }]}>
                {user.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* Achievements Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements & Stats</Text>
            
            {/* Stats Overview */}
            <View style={styles.statsOverview}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userStats.totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{achievements.filter(a => a.isUnlocked).length}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userStats.gamesPlayed}</Text>
                <Text style={styles.statLabel}>Games Played</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userStats.winRate}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
            </View>

            {/* Recent Achievements */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recent Achievements</Text>
              <View style={styles.achievementsList}>
                {achievements
                  .filter(a => a.isUnlocked)
                  .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
                  .slice(0, 3)
                  .map((achievement) => (
                    <View key={achievement.id} style={styles.achievementItem}>
                      <View style={[styles.achievementIcon, { backgroundColor: getAchievementColor(achievement.rarity) }]}>
                        <Ionicons name={achievement.icon as any} size={20} color="white" />
                      </View>
                      <View style={styles.achievementInfo}>
                        <Text style={styles.achievementName}>{achievement.name}</Text>
                        <Text style={styles.achievementDescription}>{achievement.description}</Text>
                        <Text style={styles.achievementDate}>
                          {achievement.unlockedAt?.toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.achievementPoints}>
                        <Text style={styles.pointsText}>+{achievement.points}</Text>
                      </View>
                    </View>
                  ))}
              </View>
              
              {achievements.filter(a => a.isUnlocked).length === 0 && (
                <View style={styles.noAchievements}>
                  <Ionicons name="trophy-outline" size={48} color={theme.colors.textSecondary} />
                  <Text style={styles.noAchievementsText}>No achievements yet</Text>
                  <Text style={styles.noAchievementsSubtext}>Start playing to unlock achievements!</Text>
                </View>
              )}
            </View>
          </View>

          {/* Friends Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friends</Text>
            
            <View style={styles.friendsOverview}>
              <View style={styles.friendStatCard}>
                <Text style={styles.friendStatNumber}>12</Text>
                <Text style={styles.friendStatLabel}>Total Friends</Text>
              </View>
              <View style={styles.friendStatCard}>
                <Text style={styles.friendStatNumber}>8</Text>
                <Text style={styles.friendStatLabel}>Online Now</Text>
              </View>
              <View style={styles.friendStatCard}>
                <Text style={styles.friendStatNumber}>5</Text>
                <Text style={styles.friendStatLabel}>Recent Activity</Text>
              </View>
            </View>

            {/* Friends List Preview */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recent Friends</Text>
              <View style={styles.friendsList}>
                {[
                  { name: 'John Smith', status: 'Online', lastActivity: '2 min ago' },
                  { name: 'Sarah Johnson', status: 'Offline', lastActivity: '1 hour ago' },
                  { name: 'Mike Davis', status: 'Online', lastActivity: '5 min ago' },
                ].map((friend, index) => (
                  <View key={`profile-friend-${index}`} style={styles.friendItem}>
                    <View style={styles.friendAvatar}>
                      <Ionicons name="person" size={20} color={theme.colors.textSecondary} />
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendStatus}>
                        {friend.status} • {friend.lastActivity}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.friendActionButton}>
                      <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity style={styles.viewAllFriendsButton}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.viewAllFriendsButtonGradient}
                >
                  <Text style={styles.viewAllFriendsButtonText}>View All Friends</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.saveButtonText}>Saving...</Text>
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="white" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: Platform.OS === 'android' ? 40 : 0,
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
  photoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  photoEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  photoActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  photoActionText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  removePhotoButton: {
    borderColor: theme.colors.error,
  },
  editPhotoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    gap: 6,
    marginTop: theme.spacing.sm,
  },
  editPhotoHintText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  form: {
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  inputDisabled: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textSecondary,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  skillLevelChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skillLevelText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: theme.colors.success,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Achievement styles
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  achievementsList: {
    gap: theme.spacing.sm,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  achievementPoints: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.success,
  },
  noAchievements: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  noAchievementsText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noAchievementsSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  // Friends styles
  friendsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  friendStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  friendStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  friendStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  friendsList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  friendActionButton: {
    padding: theme.spacing.sm,
  },
  viewAllFriendsButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  viewAllFriendsButtonGradient: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  viewAllFriendsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  matchesSection: {
    marginBottom: theme.spacing.lg,
  },
  matchesSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  matchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
  },
  matchInfo: {
    flex: 1,
  },
  matchType: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  matchResult: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  matchDetails: {
    alignItems: 'flex-end',
  },
  matchDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  matchRating: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

export default ProfileScreen;
