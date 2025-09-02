import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileViewProps {
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    country: string;
    skillLevel: string;
  };
  theme: any;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profileData, theme }) => {
  const styles = createStyles(theme);

  return (
    <>
      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color={theme.colors.primary} />
            <Text style={styles.infoValue}>
              {profileData.firstName} {profileData.lastName}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={theme.colors.primary} />
            <Text style={styles.infoValue}>{profileData.email}</Text>
          </View>
        </View>
        
        {profileData.city && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={theme.colors.primary} />
              <Text style={styles.infoValue}>
                {profileData.city}{profileData.country ? `, ${profileData.country}` : ''}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Game Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Preferences</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="trophy" size={20} color={theme.colors.primary} />
            <Text style={styles.infoValue}>{profileData.skillLevel}</Text>
          </View>
        </View>
      </View>
    </>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
});

export default ProfileView;
