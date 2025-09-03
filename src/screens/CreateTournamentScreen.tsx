import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { 
  TournamentFormat, 
  SkillLevel, 
  TournamentStatus, 
  BracketType,
  Prize 
} from '../types';

const CreateTournamentScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { addTournament, loadTournaments } = useTournamentStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const { toast, showSuccess, showError, hideToast } = useToast();
  
  const [tournamentData, setTournamentData] = useState({
    name: '',
    description: '',
    format: TournamentFormat.SINGLES_ROUND_ROBIN,
    skillLevel: SkillLevel.INTERMEDIATE,
    maxParticipants: 8,
    entryFee: '',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 24 * 60 * 60 * 1000), // 1 week + 2 days
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    location: '',
    isDUPR: false,
    courtsCount: 2, // Default to 2 courts
    prizes: [] as Prize[],
  });

  const [isLoading, setIsLoading] = useState(false);

  const tournamentFormats = [
    {
      format: TournamentFormat.SINGLES_ROUND_ROBIN,
      name: 'Singles Round Robin',
      description: 'Everyone plays everyone in singles format',
      icon: '🔄',
      isFullyImplemented: true
    }
    // TODO: Uncomment and implement these formats later
    // {
    //   format: TournamentFormat.MILP,
    //   name: 'Major League Pickleball (MiLP)',
    //   description: 'Professional tournament format with team-based competition',
    //   icon: '🏆',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.SINGLES_KNOCKOUT,
    //   name: 'Singles Knockout',
    //   description: 'Single elimination tournament for individual players',
    //   icon: '👤',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.DOUBLES_KNOCKOUT,
    //   name: 'Doubles Knockout',
    //   description: 'Single elimination tournament for doubles teams',
    //   icon: '👥',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.DOUBLES_ROUND_ROBIN,
    //   name: 'Doubles Round Robin',
    //   description: 'Everyone plays everyone in doubles format',
    //   icon: '🔄',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.MIXED_DOUBLES_ROUND_ROBIN,
    //   name: 'Round Robin Mixed Doubles League',
    //   description: 'Mixed gender doubles teams compete in round robin format',
    //   icon: '👫',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.RANDOM_TEAMS_ROUND_ROBIN,
    //   name: 'Random Teams Round Robin',
    //   description: 'Random team assignments with round robin format',
    //   icon: '🎲',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.INDIVIDUAL_LADDER,
    //   name: 'Individual Ladder',
    //   description: 'Players challenge each other to move up the ladder',
    //   icon: '📈',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.LADDER_LEAGUE,
    //   name: 'Ladder League',
    //   description: 'Team-based ladder competition',
    //   icon: '🏗️',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.SWISS_SYSTEM,
    //   name: 'Swiss System',
    //   description: 'Players are paired against similar skill levels',
    //   icon: '🇨🇭',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.CONSOLATION_BRACKET,
    //   name: 'Consolation Bracket',
    //   description: 'Losers bracket for second chances',
    //   icon: '🔄',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.DOUBLE_ELIMINATION,
    //   name: 'Double Elimination',
    //   description: 'Players must lose twice to be eliminated',
    //   icon: '⚡',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.ROUND_ROBIN_PLUS_KNOCKOUT,
    //   name: 'Round Robin + Knockout',
    //   description: 'Group stage followed by elimination rounds',
    //   icon: '🏁',
    //   isFullyImplemented: false
    // },
    // {
    //   format: TournamentFormat.TEAM_FORMAT,
    //   name: 'Team Format',
    //   description: 'Team-based competition with multiple players',
    //   icon: '👥',
    //   isFullyImplemented: false
    // }
  ];

  // Mixed Doubles Round Robin League Calculations
  const getMixedDoublesCalculations = (teamCount: number) => {
    if (teamCount < 8) {
      return {
        isValid: false,
        message: 'Mixed Doubles League requires at least 8 teams (16 players)',
        males: 0,
        females: 0,
        totalPlayers: 0,
        totalMatches: 0,
        matchesPerTeam: 0,
        hasByes: false
      };
    }

    const males = teamCount;
    const females = teamCount;
    const totalPlayers = 2 * teamCount;
    const totalMatches = (teamCount * (teamCount - 1)) / 2;
    const matchesPerTeam = teamCount - 1;
    const hasByes = teamCount % 2 === 1; // Odd number of teams means byes

    return {
      isValid: true,
      message: `✅ ${teamCount} teams = ${males}♂ + ${females}♀ = ${totalPlayers} players`,
      males,
      females,
      totalPlayers,
      totalMatches,
      matchesPerTeam,
      hasByes
    };
  };

  const getPoolCalculations = (teamCount: number, poolCount: number = 2) => {
    if (teamCount < 8 || teamCount % poolCount !== 0) {
      return null;
    }

    const teamsPerPool = teamCount / poolCount;
    const poolMatches = (teamsPerPool * (teamsPerPool - 1)) / 2;
    const totalPoolMatches = poolMatches * poolCount;

    return {
      teamsPerPool,
      poolMatches,
      totalPoolMatches,
      message: `${poolCount} pools of ${teamsPerPool} teams each`
    };
  };

  const handleCreateTournament = async () => {
    if (!tournamentData.name || !tournamentData.location) {
      showError('Please fill in the tournament name and location');
      return;
    }

    // Special validation for Mixed Doubles Round Robin League
    if (tournamentData.format === TournamentFormat.MIXED_DOUBLES_ROUND_ROBIN) {
      const teamCount = Math.floor(tournamentData.maxParticipants / 2);
      const calculations = getMixedDoublesCalculations(teamCount);
      
      if (!calculations.isValid) {
        showError(calculations.message);
        return;
      }
      
      if (tournamentData.maxParticipants !== calculations.totalPlayers) {
        showError(`For ${teamCount} teams, you need exactly ${calculations.totalPlayers} players (${teamCount}♂ + ${teamCount}♀).\n\nCurrent: ${tournamentData.maxParticipants} players`);
        return;
      }
    } else {
      // Standard validation for other formats
      if (tournamentData.maxParticipants < 4) {
        showError('Tournament must have at least 4 participants');
        return;
      }
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
        currentParticipants: 0, // Creator is NOT automatically added
        players: [], // Creator is NOT automatically added
        waitingList: [], // Empty waiting list initially
        skillLevel: tournamentData.skillLevel,
        entryFee: tournamentData.entryFee ? parseFloat(tournamentData.entryFee) : undefined,
        prizes: tournamentData.prizes,
        brackets: [], // Empty brackets initially
        status: TournamentStatus.REGISTRATION_OPEN,
        isDUPR: tournamentData.isDUPR,
        courtsCount: tournamentData.courtsCount,
        createdBy: user?.id || 'currentUser',
      };

      const createdTournament = await addTournament(newTournament);
      
      // Reload tournaments to ensure fresh data
      await loadTournaments();
      
      // Show success toast
      showSuccess(`Tournament "${tournamentData.name}" created successfully!`);
      
      // Navigate to tournament table for Singles Round Robin, or to tournaments list for others
      setTimeout(() => {
        if (tournamentData.format === TournamentFormat.SINGLES_ROUND_ROBIN) {
          (navigation as any).navigate('SinglesRoundRobin', { tournamentId: createdTournament.id });
        } else {
          // For other formats, go to tournaments list instead of TournamentDetails
          (navigation as any).navigate('Tournaments');
        }
      }, 1000);
      
    } catch (error) {
      showError('Failed to create tournament. Please try again.');
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
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={hideToast}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <Ionicons name="trophy" size={32} color="white" />
          <Text style={styles.headerTitle}>Create Tournament</Text>
        </LinearGradient>

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
            
            {/* Mixed Doubles League Information */}
            {tournamentData.format === TournamentFormat.MIXED_DOUBLES_ROUND_ROBIN && (
              <View style={styles.mixedDoublesInfo}>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={20} color={theme.colors.info} />
                  <Text style={styles.infoTitle}>Mixed Doubles League Formula</Text>
                </View>
                
                <View style={styles.calculationGrid}>
                  <View style={styles.calculationItem}>
                    <Text style={styles.calculationLabel}>Teams</Text>
                    <Text style={styles.calculationValue}>{Math.floor(tournamentData.maxParticipants / 2)}</Text>
                  </View>
                  <View style={styles.calculationItem}>
                    <Text style={styles.calculationLabel}>Males</Text>
                    <Text style={styles.calculationValue}>♂ {Math.floor(tournamentData.maxParticipants / 2)}</Text>
                  </View>
                  <View style={styles.calculationItem}>
                    <Text style={styles.calculationLabel}>Females</Text>
                    <Text style={styles.calculationValue}>♀ {Math.floor(tournamentData.maxParticipants / 2)}</Text>
                  </View>
                  <View style={styles.calculationItem}>
                    <Text style={styles.calculationLabel}>Total Matches</Text>
                    <Text style={styles.calculationValue}>
                      {(() => {
                        const teamCount = Math.floor(tournamentData.maxParticipants / 2);
                        return teamCount >= 8 ? (teamCount * (teamCount - 1)) / 2 : 'N/A';
                      })()}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.infoText}>
                  Each team = 1 male + 1 female. Minimum 8 teams (16 players) required.
                </Text>
                
                {(() => {
                  const teamCount = Math.floor(tournamentData.maxParticipants / 2);
                  const calculations = getMixedDoublesCalculations(teamCount);
                  return calculations.isValid ? (
                    <Text style={styles.successText}>{calculations.message}</Text>
                  ) : (
                    <Text style={styles.errorText}>{calculations.message}</Text>
                  );
                })()}
              </View>
            )}
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
                  maxParticipants: Math.max(
                    tournamentData.format === TournamentFormat.SINGLES_ROUND_ROBIN ? 4 : 
                    tournamentData.format === TournamentFormat.MIXED_DOUBLES_ROUND_ROBIN ? 16 : 4, 
                    tournamentData.maxParticipants - (tournamentData.format === TournamentFormat.SINGLES_ROUND_ROBIN ? 1 :
                    tournamentData.format === TournamentFormat.MIXED_DOUBLES_ROUND_ROBIN ? 2 : 4)
                  )
                })}
              >
                <Ionicons name="remove" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.participantCount}>{tournamentData.maxParticipants}</Text>
              <TouchableOpacity
                style={styles.participantCountButton}
                onPress={() => setTournamentData({
                  ...tournamentData, 
                  maxParticipants: tournamentData.maxParticipants + (tournamentData.format === TournamentFormat.SINGLES_ROUND_ROBIN ? 1 :
                  tournamentData.format === TournamentFormat.MIXED_DOUBLES_ROUND_ROBIN ? 2 : 4)
                })}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              {tournamentData.format === TournamentFormat.SINGLES_ROUND_ROBIN 
                ? 'Each player will play against every other player'
                : tournamentData.format === TournamentFormat.MIXED_DOUBLES_ROUND_ROBIN 
                ? 'Must be even number ≥ 16 (8 teams minimum)'
                : 'Must be divisible by 4 for doubles tournaments'
              }
            </Text>
          </View>

          {/* Courts Count */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Courts</Text>
            <View style={styles.participantCountContainer}>
              <TouchableOpacity
                style={styles.participantCountButton}
                onPress={() => setTournamentData({
                  ...tournamentData, 
                  courtsCount: Math.max(1, tournamentData.courtsCount - 1)
                })}
              >
                <Ionicons name="remove" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.participantCount}>{tournamentData.courtsCount}</Text>
              <TouchableOpacity
                style={styles.participantCountButton}
                onPress={() => setTournamentData({
                  ...tournamentData, 
                  courtsCount: tournamentData.courtsCount + 1
                })}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Number of courts available for simultaneous matches
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
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: theme.spacing.xl, // Add top padding for status bar
    paddingBottom: theme.spacing.lg,
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
    backgroundColor: theme.colors.background,
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
  mixedDoublesInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  calculationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  calculationItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  calculationLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '500',
    textAlign: 'center',
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
