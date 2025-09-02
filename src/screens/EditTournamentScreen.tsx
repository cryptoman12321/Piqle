import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { 
  TournamentFormat, 
  SkillLevel, 
  TournamentStatus, 
  Prize,
  Tournament
} from '../types';

type EditTournamentRouteProp = RouteProp<{ EditTournament: { tournamentId: string } }, 'EditTournament'>;

const EditTournamentScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { getTournamentById, updateTournament, loadTournaments } = useTournamentStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const route = useRoute<EditTournamentRouteProp>();
  const { toast, showSuccess, showError, hideToast } = useToast();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tournamentData, setTournamentData] = useState({
    name: '',
    description: '',
    format: TournamentFormat.SINGLES_ROUND_ROBIN,
    skillLevel: SkillLevel.INTERMEDIATE,
    maxParticipants: 8,
    entryFee: '',
    startDate: new Date(),
    endDate: new Date(),
    registrationDeadline: new Date(),
    location: '',
    isDUPR: false,
    courtsCount: 2,
    prizes: [] as Prize[],
  });

  useEffect(() => {
    loadTournament();
  }, []);

  const loadTournament = async () => {
    try {
      const tournamentId = route.params.tournamentId;
      const loadedTournament = getTournamentById(tournamentId);
      
      if (!loadedTournament) {
        showError('Tournament not found');
        navigation.goBack();
        return;
      }

      // Check if user is the creator
      if (loadedTournament.createdBy !== user?.id) {
        showError('Only tournament creator can edit');
        navigation.goBack();
        return;
      }

      // Check if tournament can still be edited
      if (loadedTournament.status !== TournamentStatus.REGISTRATION_OPEN) {
        showError('Tournament cannot be edited after it has started');
        navigation.goBack();
        return;
      }

      setTournament(loadedTournament);
      setTournamentData({
        name: loadedTournament.name,
        description: loadedTournament.description,
        format: loadedTournament.format,
        skillLevel: loadedTournament.skillLevel,
        maxParticipants: loadedTournament.maxParticipants,
        entryFee: loadedTournament.entryFee?.toString() || '',
        startDate: loadedTournament.startDate,
        endDate: loadedTournament.endDate,
        registrationDeadline: loadedTournament.registrationDeadline,
        location: loadedTournament.location.city,
        isDUPR: loadedTournament.isDUPR,
        courtsCount: loadedTournament.courtsCount,
        prizes: loadedTournament.prizes || [],
      });
    } catch (error) {
      showError('Failed to load tournament');
      navigation.goBack();
    }
  };

  const handleSaveTournament = async () => {
    if (!tournament) return;

    // Validation
    if (!tournamentData.name.trim()) {
      showError('Tournament name is required');
      return;
    }

    if (!tournamentData.location.trim()) {
      showError('Location is required');
      return;
    }

    if (tournamentData.maxParticipants < 4) {
      showError('Minimum 4 participants required');
      return;
    }

    if (tournamentData.courtsCount < 1) {
      showError('At least 1 court is required');
      return;
    }

    setIsLoading(true);

    try {
      const updatedTournament: Tournament = {
        ...tournament,
        name: tournamentData.name.trim(),
        description: tournamentData.description.trim(),
        skillLevel: tournamentData.skillLevel,
        maxParticipants: tournamentData.maxParticipants,
        entryFee: tournamentData.entryFee ? parseFloat(tournamentData.entryFee) : undefined,
        startDate: tournamentData.startDate,
        endDate: tournamentData.endDate,
        registrationDeadline: tournamentData.registrationDeadline,
        location: {
          ...tournament.location,
          city: tournamentData.location.trim(),
        },
        isDUPR: tournamentData.isDUPR,
        courtsCount: tournamentData.courtsCount,
        prizes: tournamentData.prizes,
      };

      await updateTournament(tournament.id, updatedTournament);
      await loadTournaments();
      
      showSuccess('Tournament updated successfully!');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
      
    } catch (error) {
      showError('Failed to update tournament. Please try again.');
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

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading tournament...</Text>
      </View>
    );
  }

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
          <Ionicons name="create" size={32} color="white" />
          <Text style={styles.headerTitle}>Edit Tournament</Text>
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
              placeholder="Describe your tournament..."
              placeholderTextColor={theme.colors.textSecondary}
              value={tournamentData.description}
              onChangeText={(text) => setTournamentData({...tournamentData, description: text})}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Skill Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.skillLevelContainer}>
              {Object.values(SkillLevel).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.skillLevelButton,
                    tournamentData.skillLevel === level && styles.skillLevelButtonActive
                  ]}
                  onPress={() => setTournamentData({...tournamentData, skillLevel: level})}
                >
                  <Text style={[
                    styles.skillLevelButtonText,
                    tournamentData.skillLevel === level && styles.skillLevelButtonTextActive
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Max Participants */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maximum Participants</Text>
            <View style={styles.participantCountContainer}>
              <TouchableOpacity
                style={styles.participantCountButton}
                onPress={() => setTournamentData({
                  ...tournamentData, 
                  maxParticipants: Math.max(4, tournamentData.maxParticipants - 1)
                })}
              >
                <Ionicons name="remove" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.participantCount}>{tournamentData.maxParticipants}</Text>
              <TouchableOpacity
                style={styles.participantCountButton}
                onPress={() => setTournamentData({
                  ...tournamentData, 
                  maxParticipants: tournamentData.maxParticipants + 1
                })}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Minimum 4 participants required
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
                trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                thumbColor={tournamentData.isDUPR ? theme.colors.secondary : theme.colors.textSecondary}
              />
            </View>
            <Text style={styles.helperText}>
              Enable DUPR rating tracking for this tournament
            </Text>
          </View>

          {/* Prizes */}
          <View style={styles.inputGroup}>
            <View style={styles.prizesHeader}>
              <Text style={styles.label}>Prizes</Text>
              <TouchableOpacity style={styles.addPrizeButton} onPress={addPrize}>
                <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            {tournamentData.prizes.map((prize, index) => (
              <View key={index} style={styles.prizeRow}>
                <View style={styles.prizeInputs}>
                  <TextInput
                    style={[styles.input, styles.prizeInput]}
                    placeholder="Place"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={prize.place.toString()}
                    onChangeText={(text) => updatePrize(index, 'place', parseInt(text) || 1)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.prizeInput]}
                    placeholder="Amount"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={prize.amount.toString()}
                    onChangeText={(text) => updatePrize(index, 'amount', parseFloat(text) || 0)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.prizeDescription]}
                    placeholder="Description"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={prize.description}
                    onChangeText={(text) => updatePrize(index, 'description', text)}
                  />
                </View>
                <TouchableOpacity
                  style={styles.removePrizeButton}
                  onPress={() => removePrize(index)}
                >
                  <Ionicons name="trash" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[theme.colors.surface, theme.colors.surface]}
              style={styles.buttonGradient}
            >
              <Ionicons name="close" size={20} color={theme.colors.text} />
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveTournament}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[theme.colors.success, '#059669']}
              style={styles.buttonGradient}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.buttonText}>
                {isLoading ? 'Saving...' : 'Save Changes'}
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
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  skillLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillLevelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  skillLevelButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  skillLevelButtonText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  skillLevelButtonTextActive: {
    color: 'white',
  },
  participantCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  participantCountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  participantCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  duprRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addPrizeButton: {
    padding: 4,
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  prizeInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  prizeInput: {
    flex: 1,
    minWidth: 0,
  },
  prizeDescription: {
    flex: 2,
    minWidth: 0,
  },
  removePrizeButton: {
    padding: 8,
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    // Uses LinearGradient
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: theme.colors.text,
  },
});

export default EditTournamentScreen;
