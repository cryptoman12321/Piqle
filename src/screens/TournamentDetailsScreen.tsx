import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  Tournament, 
  TournamentFormat, 
  SkillLevel, 
  TournamentStatus,
  Prize 
} from '../types';

const TournamentDetailsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { getTournamentById, unregisterFromTournament, registerForTournament } = useTournamentStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  const tournamentId = (route.params as any)?.tournamentId;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const styles = createStyles(theme);

  useEffect(() => {
    if (tournamentId) {
      const foundTournament = getTournamentById(tournamentId);
      setTournament(foundTournament || null);
      setIsLoading(false);
    }
  }, [tournamentId, getTournamentById]);

  const handleUnregister = () => {
    if (!tournament || !user?.id) return;
    
    Alert.alert(
      'Unregister from Tournament',
      `Are you sure you want to unregister from "${tournament.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unregister',
          style: 'destructive',
          onPress: () => {
            unregisterFromTournament(tournament.id, user.id);
                // Navigate back to Tournaments list instead of just going back
    navigation.navigate('TournamentsList' as any);
          },
        },
      ]
    );
  };

  const handleShareTournament = () => {
    if (!tournament) return;
    
    Alert.alert(
      'Share Tournament',
      `Share "${tournament.name}" with other players!`,
      [
        { text: 'Copy Link', onPress: () => Alert.alert('Copied!', 'Tournament link copied to clipboard') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getFormatDisplayName = (format: TournamentFormat) => {
    switch (format) {
      case TournamentFormat.MILP:
        return 'Major League Pickleball (MiLP)';
      case TournamentFormat.SINGLES_KNOCKOUT:
        return 'Singles Knockout';
      case TournamentFormat.DOUBLES_KNOCKOUT:
        return 'Doubles Knockout';
      case TournamentFormat.SINGLES_ROUND_ROBIN:
        return 'Singles Round Robin';
      case TournamentFormat.DOUBLES_ROUND_ROBIN:
        return 'Doubles Round Robin';
      case TournamentFormat.RANDOM_TEAMS_ROUND_ROBIN:
        return 'Random Teams Round Robin';
      case TournamentFormat.INDIVIDUAL_LADDER:
        return 'Individual Ladder';
      case TournamentFormat.LADDER_LEAGUE:
        return 'Ladder League';
      case TournamentFormat.SWISS_SYSTEM:
        return 'Swiss System';
      case TournamentFormat.CONSOLATION_BRACKET:
        return 'Consolation Bracket';
      case TournamentFormat.DOUBLE_ELIMINATION:
        return 'Double Elimination';
      case TournamentFormat.ROUND_ROBIN_PLUS_KNOCKOUT:
        return 'Round Robin + Knockout';
      case TournamentFormat.TEAM_FORMAT:
        return 'Team Format';
      default:
        return format;
    }
  };

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.REGISTRATION_OPEN:
        return theme.colors.success;
      case TournamentStatus.REGISTRATION_CLOSED:
        return theme.colors.warning;
      case TournamentStatus.IN_PROGRESS:
        return theme.colors.info;
      case TournamentStatus.COMPLETED:
        return theme.colors.textSecondary;
      case TournamentStatus.CANCELLED:
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.REGISTRATION_OPEN:
        return 'Registration Open';
      case TournamentStatus.REGISTRATION_CLOSED:
        return 'Registration Closed';
      case TournamentStatus.IN_PROGRESS:
        return 'In Progress';
      case TournamentStatus.COMPLETED:
        return 'Completed';
      case TournamentStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading tournament details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Tournament Not Found</Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            The tournament you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Check if the current user is registered for this tournament
  // For demo purposes, assume current user is 'user1' and check if they're in the players list
  const isPlayerRegistered = tournament.players ? tournament.players.includes(user?.id || 'user1') : false;
  const canRegister = tournament.status === TournamentStatus.REGISTRATION_OPEN && 
                     tournament.currentParticipants < tournament.maxParticipants;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.headerGradient}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{tournament.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament.status) }]}>
                <Text style={styles.statusText}>{getStatusText(tournament.status)}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Tournament Info */}
        <View style={styles.content}>
          {/* Description */}
          {tournament.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{tournament.description}</Text>
            </View>
          )}

          {/* Tournament Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tournament Details</Text>
            {/* Row 1: Format & Participants */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="trophy" size={20} color={theme.colors.primary} />
                <Text style={styles.detailLabel}>Format</Text>
                <Text style={styles.detailValue}>{getFormatDisplayName(tournament.format)}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
                <Text style={styles.detailLabel}>Participants</Text>
                <Text style={styles.detailValue}>
                  {tournament.currentParticipants}/{tournament.maxParticipants}
                </Text>
              </View>
            </View>
            
            {/* Row 2: Skill Level & DUPR Rating */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="star" size={20} color={theme.colors.primary} />
                <Text style={styles.detailLabel}>Skill Level</Text>
                <Text style={styles.detailValue}>{tournament.skillLevel}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="trending-up" size={20} color={tournament.isDUPR ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={styles.detailLabel}>DUPR Rating</Text>
                <Text style={[styles.detailValue, { color: tournament.isDUPR ? theme.colors.primary : theme.colors.textSecondary }]}>
                  {tournament.isDUPR ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Important Dates</Text>
            <View style={styles.datesContainer}>
              <View style={styles.dateItem}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <Text style={styles.dateValue}>
                    {tournament.startDate.toLocaleDateString([], { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
              
              <View style={styles.dateItem}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <Text style={styles.dateValue}>
                    {tournament.endDate.toLocaleDateString([], { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
              
              <View style={styles.dateItem}>
                <Ionicons name="time" size={20} color={theme.colors.warning} />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Registration Deadline</Text>
                  <Text style={styles.dateValue}>
                    {tournament.registrationDeadline.toLocaleDateString([], { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={24} color={theme.colors.primary} />
              <Text style={styles.locationText}>{tournament.location.city}</Text>
            </View>
          </View>

          {/* Entry Fee */}
          {tournament.entryFee !== undefined && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Entry Fee</Text>
              <View style={styles.feeContainer}>
                <Ionicons name="card" size={24} color={theme.colors.primary} />
                <Text style={styles.feeText}>
                  {tournament.entryFee === 0 ? 'Free Entry' : `$${tournament.entryFee} per player`}
                </Text>
              </View>
            </View>
          )}

          {/* Prizes */}
          {tournament.prizes && tournament.prizes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prizes</Text>
              <View style={styles.prizesContainer}>
                {tournament.prizes.map((prize, index) => (
                  <View key={`prize-${prize.place}-${index}`} style={styles.prizeItem}>
                    <View style={styles.prizePlace}>
                      <Text style={styles.prizePlaceText}>{prize.place}</Text>
                    </View>
                    <View style={styles.prizeInfo}>
                      <Text style={styles.prizeAmount}>
                        {prize.amount === 0 ? 'Certificate' : `$${prize.amount}`}
                      </Text>
                      <Text style={styles.prizeDescription}>{prize.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsSection}>
            {isPlayerRegistered ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.unregisterButton]}
                onPress={handleUnregister}
              >
                <Ionicons name="exit-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Unregister</Text>
              </TouchableOpacity>
            ) : canRegister ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.registerButton]}
                onPress={() => {
                  if (tournament && user?.id) {
                    // Actually register for the tournament using the store
                    registerForTournament(tournament.id, user.id);
                          // Navigate back to Tournaments list to show updated state
      navigation.navigate('TournamentsList' as any);
                  }
                }}
              >
                <Ionicons name="enter-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Register Now</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.actionButton, styles.closedButton]}>
                <Ionicons name="close-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>
                  {tournament.currentParticipants >= tournament.maxParticipants ? 'Tournament Full' : 'Registration Closed'}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShareTournament}
            >
              <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Share</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
    ...theme.shadows?.sm,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  datesContainer: {
    gap: theme.spacing.md,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
    ...theme.shadows?.sm,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
    ...theme.shadows?.sm,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
    ...theme.shadows?.sm,
  },
  feeText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  prizesContainer: {
    gap: theme.spacing.md,
  },
  prizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
    ...theme.shadows?.sm,
  },
  prizePlace: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizePlaceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  prizeInfo: {
    flex: 1,
  },
  prizeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  prizeDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows?.md,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
  },
  unregisterButton: {
    backgroundColor: theme.colors.error,
  },
  closedButton: {
    backgroundColor: theme.colors.textSecondary,
  },
  shareButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TournamentDetailsScreen;
