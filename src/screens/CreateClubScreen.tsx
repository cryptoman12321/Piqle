import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
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
  
  const [step, setStep] = useState(1);
  const [clubData, setClubData] = useState({
    name: '',
    description: '',
    category: 'MIXED' as const,
    skillLevels: [] as string[],
    membershipType: 'FREE' as const,
    membershipFee: '',
    maxMembers: '',
    rules: [''],
    contactInfo: {
      email: '',
      phone: '',
      website: '',
    },
    location: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      latitude: 0,
      longitude: 0,
      courtCount: '',
      courtTypes: [] as string[],
      amenities: [] as string[],
    },
  });

  const styles = createStyles(theme);

  const categories = ['RECREATIONAL', 'COMPETITIVE', 'MIXED', 'ELITE', 'BEGINNER_FRIENDLY'];
  const skillLevelOptions = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
  const membershipTypes = ['FREE', 'PAID', 'INVITATION_ONLY', 'APPLICATION_REQUIRED'];
  const courtTypeOptions = ['Outdoor', 'Indoor', 'Hard Court', 'Clay Court', 'Grass Court'];
  const amenityOptions = ['Parking', 'Restrooms', 'Pro Shop', 'Lighting', 'Locker Rooms', 'Café', 'WiFi', 'First Aid'];

  const updateClubData = (field: string, value: any) => {
    setClubData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLocationData = (field: string, value: any) => {
    setClubData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const updateContactInfo = (field: string, value: string) => {
    setClubData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value,
      },
    }));
  };

  const toggleArrayItem = (array: string[], item: string, field: string) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    updateClubData(field, newArray);
  };

  const addRule = () => {
    setClubData(prev => ({
      ...prev,
      rules: [...prev.rules, ''],
    }));
  };

  const removeRule = (index: number) => {
    setClubData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const updateRule = (index: number, value: string) => {
    setClubData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule),
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return clubData.name.trim() !== '' && clubData.description.trim() !== '';
      case 2:
        return clubData.location.name.trim() !== '' && 
               clubData.location.address.trim() !== '' && 
               clubData.location.city.trim() !== '';
      case 3:
        return clubData.skillLevels.length > 0;
      case 4:
        return true; // Rules and contact info are optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleCreateClub();
      }
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields before continuing.');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleCreateClub = () => {
    try {
      const newClub = {
        ...clubData,
        membershipFee: clubData.membershipType === 'PAID' ? parseFloat(clubData.membershipFee) : undefined,
        maxMembers: parseInt(clubData.maxMembers) || 0,
        location: {
          ...clubData.location,
          courtCount: parseInt(clubData.location.courtCount) || 0,
          latitude: clubData.location.latitude || 0,
          longitude: clubData.location.longitude || 0,
        },
        members: [{
          userId: user!.id,
          userName: `${user!.firstName} ${user!.lastName}`,
          userPhoto: user!.photo,
          role: 'OWNER' as const,
        }],
      };

      const clubId = createClub(newClub);
      
      Alert.alert(
        'Club Created!',
        'Your club has been created successfully. You are now the owner and can start managing your community!',
        [
          {
            text: 'View Club',
            onPress: () => navigation.replace('ClubDetails', { clubId })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create club. Please try again.');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((stepNumber) => (
        <View key={stepNumber} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            step >= stepNumber && styles.stepCircleActive
          ]}>
            {step > stepNumber ? (
              <Ionicons name="checkmark" size={16} color="white" />
            ) : (
              <Text style={[
                styles.stepNumber,
                step >= stepNumber && styles.stepNumberActive
              ]}>
                {stepNumber}
              </Text>
            )}
          </View>
          <Text style={[
            styles.stepLabel,
            step >= stepNumber && styles.stepLabelActive
          ]}>
            {stepNumber === 1 && 'Basic Info'}
            {stepNumber === 2 && 'Location'}
            {stepNumber === 3 && 'Settings'}
            {stepNumber === 4 && 'Details'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderBasicInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Club Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your club</Text>
      
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
          placeholder="Describe your club's mission and activities"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Category</Text>
        <View style={styles.optionsGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.optionChip,
                clubData.category === category && styles.optionChipActive
              ]}
              onPress={() => updateClubData('category', category)}
            >
              <Text style={[
                styles.optionChipText,
                clubData.category === category && styles.optionChipTextActive
              ]}>
                {category.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Club Location</Text>
      <Text style={styles.stepSubtitle}>Where is your club located?</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Location Name *</Text>
        <TextInput
          style={styles.textInput}
          value={clubData.location.name}
          onChangeText={(value) => updateLocationData('name', value)}
          placeholder="e.g., Central Park Courts"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address *</Text>
        <TextInput
          style={styles.textInput}
          value={clubData.location.address}
          onChangeText={(value) => updateLocationData('address', value)}
          placeholder="Street address"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
      
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.textInput}
            value={clubData.location.city}
            onChangeText={(value) => updateLocationData('city', value)}
            placeholder="City"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
        
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>State</Text>
          <TextInput
            style={styles.textInput}
            value={clubData.location.state}
            onChangeText={(value) => updateLocationData('state', value)}
            placeholder="State"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Number of Courts</Text>
        <TextInput
          style={styles.textInput}
          value={clubData.location.courtCount}
          onChangeText={(value) => updateLocationData('courtCount', value)}
          placeholder="0"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Court Types</Text>
        <View style={styles.optionsGrid}>
          {courtTypeOptions.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionChip,
                clubData.location.courtTypes.includes(type) && styles.optionChipActive
              ]}
              onPress={() => toggleArrayItem(clubData.location.courtTypes, type, 'courtTypes')}
            >
              <Text style={[
                styles.optionChipText,
                clubData.location.courtTypes.includes(type) && styles.optionChipTextActive
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Amenities</Text>
        <View style={styles.optionsGrid}>
          {amenityOptions.map((amenity) => (
            <TouchableOpacity
              key={amenity}
              style={[
                styles.optionChip,
                clubData.location.amenities.includes(amenity) && styles.optionChipActive
              ]}
              onPress={() => toggleArrayItem(clubData.location.amenities, amenity, 'amenities')}
            >
              <Text style={[
                styles.optionChipText,
                clubData.location.amenities.includes(amenity) && styles.optionChipTextActive
              ]}>
                {amenity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderSettingsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Club Settings</Text>
      <Text style={styles.stepSubtitle}>Configure membership and requirements</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Skill Levels *</Text>
        <Text style={styles.inputHint}>Select which skill levels your club welcomes</Text>
        <View style={styles.optionsGrid}>
          {skillLevelOptions.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionChip,
                clubData.skillLevels.includes(level) && styles.optionChipActive
              ]}
              onPress={() => toggleArrayItem(clubData.skillLevels, level, 'skillLevels')}
            >
              <Text style={[
                styles.optionChipText,
                clubData.skillLevels.includes(level) && styles.optionChipTextActive
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Membership Type</Text>
        <View style={styles.optionsGrid}>
          {membershipTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionChip,
                clubData.membershipType === type && styles.optionChipActive
              ]}
              onPress={() => updateClubData('membershipType', type)}
            >
              <Text style={[
                styles.optionChipText,
                clubData.membershipType === type && styles.optionChipTextActive
              ]}>
                {type.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {clubData.membershipType === 'PAID' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Monthly Membership Fee ($)</Text>
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
        <Text style={styles.inputLabel}>Maximum Members</Text>
        <TextInput
          style={styles.textInput}
          value={clubData.maxMembers}
          onChangeText={(value) => updateClubData('maxMembers', value)}
          placeholder="0 (unlimited)"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Additional Details</Text>
      <Text style={styles.stepSubtitle}>Rules, contact info, and more</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Club Rules</Text>
        <Text style={styles.inputHint}>Add rules that members should follow</Text>
        {clubData.rules.map((rule, index) => (
          <View key={index} style={styles.ruleInputContainer}>
            <TextInput
              style={styles.textInput}
              value={rule}
              onChangeText={(value) => updateRule(index, value)}
              placeholder={`Rule ${index + 1}`}
              placeholderTextColor={theme.colors.textSecondary}
            />
            {clubData.rules.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeRule(index)}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={addRule}
        >
          <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>Add Rule</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Contact Information</Text>
        <TextInput
          style={styles.textInput}
          value={clubData.contactInfo.email}
          onChangeText={(value) => updateContactInfo('email', value)}
          placeholder="Email address"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.textInput}
          value={clubData.contactInfo.phone}
          onChangeText={(value) => updateContactInfo('phone', value)}
          placeholder="Phone number"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.textInput}
          value={clubData.contactInfo.website}
          onChangeText={(value) => updateContactInfo('website', value)}
          placeholder="Website (optional)"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="url"
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderBasicInfoStep();
      case 2: return renderLocationStep();
      case 3: return renderSettingsStep();
      case 4: return renderDetailsStep();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Create New Club</Text>
            
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleBack}
        >
          <Text style={styles.navButtonText}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.primaryButton,
            !validateStep(step) && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!validateStep(step)}
        >
          <Text style={styles.primaryButtonText}>
            {step === 4 ? 'Create Club' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    flex: 1,
  },
  headerSpacer: {
    width: 48,
  },
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: theme.colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  stepNumberActive: {
    color: 'white',
  },
  stepLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  stepContent: {
    paddingBottom: theme.spacing.xl,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputHint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  optionChipTextActive: {
    color: 'white',
  },
  ruleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '20',
    gap: theme.spacing.sm,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  navButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default CreateClubScreen;
