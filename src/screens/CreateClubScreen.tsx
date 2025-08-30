import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useClubsStore } from '../stores/clubsStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';

const CreateClubScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { createClub } = useClubsStore();
  const navigation = useNavigation<any>();
  
  const [clubData, setClubData] = useState({
    name: '',
    description: '',
    category: 'PICKLEBALL' as const,
    skillLevel: 'ALL_LEVELS' as const,
    membershipType: 'FREE' as const,
    membershipFee: '',
    maxMembers: '50',
    location: {
      city: '',
      state: '',
      address: '',
    },
    contactEmail: '',
    contactPhone: '',
  });

  const styles = createStyles(theme);

  const categories = ['PICKLEBALL', 'TENNIS', 'MULTI_SPORT', 'SOCIAL', 'COMPETITIVE'];
  const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'];
  const membershipTypes = ['FREE', 'PAID', 'INVITATION_ONLY'];

  const updateClubData = (field: string, value: any) => {
    setClubData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLocationData = (field: string, value: string) => {
    setClubData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    return (
      clubData.name.trim() !== '' &&
      clubData.description.trim() !== '' &&
      clubData.location.city.trim() !== '' &&
      clubData.location.state.trim() !== ''
    );
  };

  const handleCreateClub = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Name, Description, City, State).');
      return;
    }

    try {
      const newClub = {
        id: Date.now().toString(),
        name: clubData.name.trim(),
        description: clubData.description.trim(),
        category: clubData.category,
        skillLevel: clubData.skillLevel,
        membershipType: clubData.membershipType,
        membershipFee: clubData.membershipType === 'PAID' ? parseFloat(clubData.membershipFee) : 0,
        maxMembers: parseInt(clubData.maxMembers) || 50,
        location: {
          city: clubData.location.city.trim(),
          state: clubData.location.state.trim(),
          address: clubData.location.address.trim(),
        },
        contactEmail: clubData.contactEmail.trim(),
        contactPhone: clubData.contactPhone.trim(),
        memberCount: 1,
        isPublic: true,
        photo: '',
        tags: [clubData.category, clubData.skillLevel],
        rating: 0,
        reviewCount: 0,
        members: [{
          userId: user!.id,
          userName: `${user!.firstName} ${user!.lastName}`,
          userPhoto: user!.photo,
          role: 'OWNER' as const,
        }],
      };

      createClub(newClub);
      
      Alert.alert(
        'Club Created!',
        'Your club has been created successfully. You are now the owner!',
        [
          {
            text: 'View Club',
            onPress: () => navigation.replace('ClubDetails', { clubId: newClub.id })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create club. Please try again.');
    }
  };

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
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create Club</Text>
              <View style={styles.placeholder} />
            </View>
          </LinearGradient>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Club Name *</Text>
              <TextInput
                style={styles.textInput}
                value={clubData.name}
                onChangeText={(value) => updateClubData('name', value)}
                placeholder="Enter club name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={clubData.description}
                onChangeText={(value) => updateClubData('description', value)}
                placeholder="Describe your club"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.optionsContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.optionChip,
                      clubData.category === category && styles.optionChipSelected
                    ]}
                    onPress={() => updateClubData('category', category)}
                  >
                    <Text style={[
                      styles.optionChipText,
                      clubData.category === category && styles.optionChipTextSelected
                    ]}>
                      {category.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Skill Level</Text>
              <View style={styles.optionsContainer}>
                {skillLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionChip,
                      clubData.skillLevel === level && styles.optionChipSelected
                    ]}
                    onPress={() => updateClubData('skillLevel', level)}
                  >
                    <Text style={[
                      styles.optionChipText,
                      clubData.skillLevel === level && styles.optionChipTextSelected
                    ]}>
                      {level.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.textInput}
                value={clubData.location.city}
                onChangeText={(value) => updateLocationData('city', value)}
                placeholder="Enter city"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State *</Text>
              <TextInput
                style={styles.textInput}
                value={clubData.location.state}
                onChangeText={(value) => updateLocationData('state', value)}
                placeholder="Enter state"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.textInput}
                value={clubData.location.address}
                onChangeText={(value) => updateLocationData('address', value)}
                placeholder="Enter address (optional)"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          {/* Membership */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Membership</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Membership Type</Text>
              <View style={styles.optionsContainer}>
                {membershipTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionChip,
                      clubData.membershipType === type && styles.optionChipSelected
                    ]}
                    onPress={() => updateClubData('membershipType', type)}
                  >
                    <Text style={[
                      styles.optionChipText,
                      clubData.membershipType === type && styles.optionChipTextSelected
                    ]}>
                      {type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {clubData.membershipType === 'PAID' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Monthly Fee ($)</Text>
                <TextInput
                  style={styles.textInput}
                  value={clubData.membershipFee}
                  onChangeText={(value) => updateClubData('membershipFee', value)}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max Members</Text>
              <TextInput
                style={styles.textInput}
                value={clubData.maxMembers}
                onChangeText={(value) => updateClubData('maxMembers', value)}
                placeholder="50"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={clubData.contactEmail}
                onChangeText={(value) => updateClubData('contactEmail', value)}
                placeholder="Enter email (optional)"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.textInput}
                value={clubData.contactPhone}
                onChangeText={(value) => updateClubData('contactPhone', value)}
                placeholder="Enter phone (optional)"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateClub}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.createButtonGradient}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.createButtonText}>Create Club</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingVertical: theme.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  optionChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionChipText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  optionChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  createButton: {
    marginTop: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateClubScreen;
