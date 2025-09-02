import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SkillLevel } from '../types';

interface ProfileEditProps {
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    country: string;
    skillLevel: SkillLevel;
  };
  setProfileData: (updater: (prev: any) => any) => void;
  theme: any;
  getSkillLevelColor: (level: SkillLevel) => string;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ 
  profileData, 
  setProfileData, 
  theme, 
  getSkillLevelColor 
}) => {
  const styles = createStyles(theme);

  return (
    <>
      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={profileData.firstName}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
              placeholder="Enter first name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={profileData.lastName}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
              placeholder="Enter last name"
              placeholderTextColor={theme.colors.textSecondary}
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
              style={styles.input}
              value={profileData.city}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, city: text }))}
              placeholder="Enter city"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={profileData.country}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, country: text }))}
              placeholder="Enter country"
              placeholderTextColor={theme.colors.textSecondary}
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
                onPress={() => setProfileData(prev => ({ ...prev, skillLevel: level }))}
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
  inputRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputDisabled: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textSecondary,
  },
  helpText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  skillLevelText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
});

export default ProfileEdit;
