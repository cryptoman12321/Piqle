import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';
import { 
  TournamentFormat, 
  SkillLevel, 
  TournamentStatus, 
  BracketType,
  Prize 
} from '../types';

const CreateTournamentScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { addTournament } = useTournamentStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  
  const [tournamentData, setTournamentData] = useState({
    name: '',
    description: '',
    format: TournamentFormat.DOUBLES_KNOCKOUT,
    skillLevel: SkillLevel.INTERMEDIATE,
    maxParticipants: 16,
    entryFee: '',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 24 * 60 * 60 * 1000), // 1 week + 2 days
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    location: '',
    isDUPR: false,
    prizes: [] as Prize[],
  });

  const [isLoading, setIsLoading] = useState(false);

  const tournamentFormats = [
    {
      format: TournamentFormat.MILP,
      name: 'Major League Pickleball (MiLP)',
      description: 'Professional tournament format with team-based competition',
      icon: '🏆'
    },
    {
      format: TournamentFormat.SINGLES_KNOCKOUT,
      name: 'Singles Knockout',
      description: 'Single elimination tournament for individual players',
      icon: '👤'
    },
    {
      format: TournamentFormat.DOUBLES_KNOCKOUT,
      name: 'Doubles Knockout',
      description: 'Single elimination tournament for doubles teams',
      icon: '👥'
    },
    {
      format: TournamentFormat.SINGLES_ROUND_ROBIN,
      name: 'Singles Round Robin',
      description: 'Everyone plays everyone in singles format',
      icon: '🔄'
    },
    {
      format: TournamentFormat.DOUBLES_ROUND_ROBIN,
      name: 'Doubles Round Robin',
      description: 'Everyone plays everyone in doubles format',
      icon: '🔄'
    },
    {
      format: TournamentFormat.RANDOM_TEAMS_ROUND_ROBIN,
      name: 'Random Teams Round Robin',
      description: 'Random team assignments with round robin play',
      icon: '🎲'
    },
    {
      format: TournamentFormat.INDIVIDUAL_LADDER,
      name: 'Individual Ladder',
      description: 'Players challenge each other to move up the ladder',
      icon: '📈'
    },
    {
      format: TournamentFormat.LADDER_LEAGUE,
      name: 'Ladder League',
      description: 'Team-based ladder competition',
      icon: '🏗️'
    },
    {
      format: TournamentFormat.SWISS_SYSTEM,
      name: 'Swiss System',
      description: 'Players are paired against similar skill levels',
      icon: '🇨🇭'
    },
    {
      format: TournamentFormat.CONSOLATION_BRACKET,
      name: 'Consolation Bracket',
      description: 'Losers bracket for second chances',
      icon: '🔄'
    },
    {
      format: TournamentFormat.DOUBLE_ELIMINATION,
      name: 'Double Elimination',
      description: 'Players must lose twice to be eliminated',
      icon: '⚡'
    },
    {
      format: TournamentFormat.ROUND_ROBIN_PLUS_KNOCKOUT,
      name: 'Round Robin + Knockout',
      description: 'Group stage followed by elimination rounds',
      icon: '🏁'
    },
    {
      format: TournamentFormat.TEAM_FORMAT,
      name: 'Team Format',
      description: 'Team-based competition with multiple players',
      icon: '👥'
    }
  ];

  const handleCreateTournament = async () => {
    if (!tournamentData.name || !tournamentData.location) {
      Alert.alert('Error', 'Please fill in the tournament name and location');
      return;
    }

    if (tournamentData.maxParticipants < 4) {
      Alert.alert('Error', 'Tournament must have at least 4 participants');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create the tournament using the store
      const newTournament = {
        name: tournamentData.name,
        description: tournamentData.description,
        format: tournamentData.format,
        clubId: 'demoClub', // Default club for demo
        location: { 
          latitude: 40.7128, // Default coordinates for demo
          longitude: -74.0060,
          city: tournamentData.location 
        },
        startDate: tournamentData.startDate,
        endDate: tournamentData.endDate,
        registrationDeadline: tournamentData.registrationDeadline,
        maxParticipants: tournamentData.maxParticipants,
        currentParticipants: 1, // Creator is automatically added
        players: [user?.id || 'currentUser'], // Creator is automatically added as first player
        skillLevel: tournamentData.skillLevel,
        entryFee: tournamentData.entryFee ? parseFloat(tournamentData.entryFee) : undefined,
        prizes: tournamentData.prizes,
        brackets: [], // Empty brackets initially
        status: TournamentStatus.REGISTRATION_OPEN,
        isDUPR: tournamentData.isDUPR,
        createdBy: user?.id || 'currentUser',
      };

      addTournament(newTournament);
      
      Alert.alert(
        'Tournament Created!', 
        `"${tournamentData.name}" has been created successfully! Players can now register.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('TournamentsList' as never)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create tournament. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addPrize = () => {
    const newPrize: Prize = {
      place: tournamentData.prizes.length + 1,
      amount: 0,
      description: ''
    };
    setTournamentData({
      ...tournamentData,
      prizes: [...tournamentData.prizes, newPrize]
    });
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    const updatedPrizes = [...tournamentData.prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    setTournamentData({ ...tournamentData, prizes: updatedPrizes });
  };

  const removePrize = (index: number) => {
    const updatedPrizes = tournamentData.prizes.filter((_, i) => i !== index);
    setTournamentData({ ...tournamentData, prizes: updatedPrizes });
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.headerGradient}
          >
            <Ionicons name="trophy" size={32} color="white" />
            <Text style={styles.headerTitle}>Create Tournament</Text>
          </LinearGradient>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Tournament Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tournament Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Summer Championship, Club Tournament"
              placeholderTextColor={theme.colors.textSecondary}
              value={tournamentData.name}
              onChangeText={(text) => setTournamentData({...tournamentData, name: text})}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the tournament, rules, special requirements..."
              placeholderTextColor={theme.colors.textSecondary}
              value={tournamentData.description}
              onChangeText={(text) => setTournamentData({...tournamentData, description: text})}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Tournament Format */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tournament Format *</Text>
            <Text style={styles.formatDescription}>
              Select from 13 professional tournament formats
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formatsContainer}>
              {tournamentFormats.map((format) => (
                <TouchableOpacity
                  key={format.format}
                  style={[
                    styles.formatCard,
                    tournamentData.format === format.format && styles.formatCardSelected
                  ]}
                  onPress={() => setTournamentData({...tournamentData, format: format.format})}
                >
                  <Text style={styles.formatIcon}>{format.icon}</Text>
                  <Text style={[
                    styles.formatName,
                    tournamentData.format === format.format && styles.formatNameSelected
                  ]}>
                    {format.name}
                  </Text>
                  <Text style={[
                    styles.formatDesc,
                    tournamentData.format === format.format && styles.formatDescSelected
                  ]}>
                    {format.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Skill Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.skillLevelOptions}>
              {Object.values(SkillLevel).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.skillLevelOption,
                    tournamentData.skillLevel === level && styles.skillLevelOptionSelected
                  ]}
                  onPress={() => setTournamentData({...tournamentData, skillLevel: level})}
                >
                  <Text style={[
                    styles.skillLevelOptionText,
                    tournamentData.skillLevel === level && styles.skillLevelOptionTextSelected
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Participant Count */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maximum Participants</Text>
            <View style={styles.participantCountContainer}>
              <TouchableOpacity
                style={styles.participantCountButton}
                onPress={() => setTournamentData({
                  ...tournamentData, 
                  maxParticipants: Math.max(4, tournamentData.maxParticipants - 4)
                })}
              >
                <Ionicons name="remove" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.participantCount}>{tournamentData.maxParticipants}</Text>
              <TouchableOpacity
                style={styles.participantCountButton}
                onPress={() => setTournamentData({
                  ...tournamentData, 
                  maxParticipants: tournamentData.maxParticipants + 4
                })}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Must be divisible by 4 for doubles tournaments
            </Text>
          </View>

          {/* Entry Fee */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Entry Fee per Player (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., $25, Free"
              placeholderTextColor={theme.colors.textSecondary}
              value={tournamentData.entryFee}
              onChangeText={(text) => setTournamentData({...tournamentData, entryFee: text})}
              keyboardType="numeric"
            />
          </View>

          {/* Dates */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date</Text>
            <Text style={styles.dateDisplay}>
              {tournamentData.startDate.toLocaleDateString()}
            </Text>
            <TouchableOpacity style={styles.dateButton}>
              <Text style={styles.dateButtonText}>Change Date</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>End Date</Text>
            <Text style={styles.dateDisplay}>
              {tournamentData.endDate.toLocaleDateString()}
            </Text>
            <TouchableOpacity style={styles.dateButton}>
              <Text style={styles.dateButtonText}>Change Date</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registration Deadline</Text>
            <Text style={styles.dateDisplay}>
              {tournamentData.registrationDeadline.toLocaleDateString()}
            </Text>
            <TouchableOpacity style={styles.dateButton}>
              <Text style={styles.dateButtonText}>Change Date</Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Court name, address, or general area"
              placeholderTextColor={theme.colors.textSecondary}
              value={tournamentData.location}
              onChangeText={(text) => setTournamentData({...tournamentData, location: text})}
            />
          </View>

          {/* DUPR Integration */}
          <View style={styles.inputGroup}>
            <View style={styles.duprRow}>
              <Text style={styles.label}>DUPR Integration</Text>
              <Switch
                value={tournamentData.isDUPR}
                onValueChange={(value) => setTournamentData({...tournamentData, isDUPR: value})}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={tournamentData.isDUPR ? 'white' : theme.colors.textSecondary}
              />
            </View>
            <Text style={styles.helperText}>
              Enable DUPR rating updates for tournament matches
            </Text>
          </View>

          {/* Prizes */}
          <View style={styles.inputGroup}>
            <View style={styles.prizesHeader}>
              <Text style={styles.label}>Prizes</Text>
              <TouchableOpacity style={styles.addPrizeButton} onPress={addPrize}>
                <Ionicons name="add" size={20} color={theme.colors.primary} />
                <Text style={styles.addPrizeText}>Add Prize</Text>
              </TouchableOpacity>
            </View>
            
            {tournamentData.prizes.map((prize, index) => (
              <View key={index} style={styles.prizeItem}>
                <View style={styles.prizeRow}>
                  <Text style={styles.prizePlace}>{prize.place} Place</Text>
                  <TouchableOpacity 
                    style={styles.removePrizeButton}
                    onPress={() => removePrize(index)}
                  >
                    <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                <View style={styles.prizeInputs}>
                  <TextInput
                    style={[styles.input, styles.prizeInput]}
                    placeholder="Amount"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={prize.amount.toString()}
                    onChangeText={(text) => updatePrize(index, 'amount', parseFloat(text) || 0)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.prizeInput]}
                    placeholder="Description (e.g., Trophy, Medal)"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={prize.description}
                    onChangeText={(text) => updatePrize(index, 'description', text)}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateTournament}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.createButtonGradient}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Creating Tournament...' : 'Create Tournament'}
              </Text>
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
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  form: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
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
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formatDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  formatsContainer: {
    marginBottom: theme.spacing.sm,
  },
  formatCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    width: 200,
    alignItems: 'center',
  },
  formatCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  formatIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  formatName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  formatNameSelected: {
    color: 'white',
  },
  formatDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  formatDescSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  skillLevelOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  skillLevelOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skillLevelOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  skillLevelOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  skillLevelOptionTextSelected: {
    color: 'white',
  },
  participantCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  participantCountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantCount: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  dateDisplay: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  dateButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  dateButtonText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  duprRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  prizesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addPrizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  addPrizeText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  prizeItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  prizePlace: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  removePrizeButton: {
    padding: theme.spacing.xs,
  },
  prizeInputs: {
    gap: theme.spacing.sm,
  },
  prizeInput: {
    flex: 1,
  },
  createButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginTop: theme.spacing.xl,
    ...theme.shadows?.md,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonGradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateTournamentScreen;
