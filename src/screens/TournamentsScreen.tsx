import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../hooks/useToast';
import { 
  Tournament, 
  TournamentFormat, 
  SkillLevel, 
  TournamentStatus,
  Prize 
} from '../types';

const TournamentsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { tournaments, loadTournaments, registerForTournament, isLoading, error } = useTournamentStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const { showSuccess } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<TournamentFormat | 'ALL'>('ALL');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<TournamentStatus | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Load tournaments when component mounts
  useEffect(() => {
    loadTournaments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTournaments();
    setRefreshing(false);
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormat === 'ALL' || tournament.format === selectedFormat;
    const matchesSkill = selectedSkillLevel === 'ALL' || tournament.skillLevel === selectedSkillLevel;
    const matchesStatus = selectedStatus === 'ALL' || tournament.status === selectedStatus;
    
    return matchesSearch && matchesFormat && matchesSkill && matchesStatus;
  });

  const handleRegister = async (tournament: Tournament) => {
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      alert('This tournament is full!');
      return;
    }
    
    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      alert('Registration is not open for this tournament');
      return;
    }

    if (!user?.id) {
      alert('Please log in to register for tournaments');
      return;
    }
    
    // Register for the tournament using the store
    registerForTournament(tournament.id, user.id);
    
    // Show success toast
    showSuccess(`Successfully registered for "${tournament.name}"!`);
    
    // Navigate to the tournament lobby/details
    navigation.navigate('TournamentDetails', { tournamentId: tournament.id });
  };

  const handleCreateTournament = () => {
    navigation.navigate('CreateTournament');
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

  const getFormatDisplayName = (format: TournamentFormat) => {
    switch (format) {
      case TournamentFormat.MILP:
        return 'MiLP';
      case TournamentFormat.SINGLES_KNOCKOUT:
        return 'Singles KO';
      case TournamentFormat.DOUBLES_KNOCKOUT:
        return 'Doubles KO';
      case TournamentFormat.SINGLES_ROUND_ROBIN:
        return 'Singles RR';
      case TournamentFormat.DOUBLES_ROUND_ROBIN:
        return 'Doubles RR';
      case TournamentFormat.RANDOM_TEAMS_ROUND_ROBIN:
        return 'Random RR';
      case TournamentFormat.INDIVIDUAL_LADDER:
        return 'Ladder';
      case TournamentFormat.LADDER_LEAGUE:
        return 'Ladder League';
      case TournamentFormat.SWISS_SYSTEM:
        return 'Swiss';
      case TournamentFormat.CONSOLATION_BRACKET:
        return 'Consolation';
      case TournamentFormat.DOUBLE_ELIMINATION:
        return 'Double Elim';
      case TournamentFormat.ROUND_ROBIN_PLUS_KNOCKOUT:
        return 'RR + KO';
      case TournamentFormat.TEAM_FORMAT:
        return 'Team';
      default:
        return format;
    }
  };

  const renderTournamentCard = ({ item: tournament }: { item: Tournament }) => (
    <TouchableOpacity 
      style={styles.tournamentCard}
      onPress={() => {
        // All tournaments go to the same tournament table page
        navigation.navigate('SinglesRoundRobin', { tournamentId: tournament.id });
      }}
    >
      <View style={styles.tournamentCardHeader}>
        <Text style={styles.tournamentTitle}>{tournament.name}</Text>
        <View style={[styles.tournamentStatus, { backgroundColor: getStatusColor(tournament.status) }]}>
          <Text style={styles.tournamentStatusText}>
            {getStatusText(tournament.status)}
          </Text>
        </View>
      </View>
      
      {tournament.description && (
        <Text style={styles.tournamentDescription}>{tournament.description}</Text>
      )}
      
      <View style={styles.tournamentDetails}>
        <View style={styles.tournamentDetail}>
          <Ionicons name="trophy" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.tournamentDetailText}>
            {getFormatDisplayName(tournament.format)}
          </Text>
        </View>
        
        <View style={styles.tournamentDetail}>
          <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.tournamentDetailText}>
            {tournament.currentParticipants}/{tournament.maxParticipants} players
          </Text>
        </View>
        
        <View style={styles.tournamentDetail}>
          <Ionicons name="star" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.tournamentDetailText}>{tournament.skillLevel}</Text>
        </View>
        
        <View style={styles.tournamentDetail}>
          <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.tournamentDetailText}>
            {tournament.startDate.toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.tournamentDetail}>
          <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.tournamentDetailText}>{tournament.location.city}</Text>
        </View>
        
        {tournament.entryFee !== undefined && (
          <View style={styles.tournamentDetail}>
            <Ionicons name="card" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.tournamentDetailText}>
              {tournament.entryFee === 0 ? 'Free' : `$${tournament.entryFee}`}
            </Text>
          </View>
        )}
        
        {tournament.isDUPR && (
          <View style={styles.tournamentDetail}>
            <Ionicons name="trending-up" size={16} color={theme.colors.primary} />
            <Text style={[styles.tournamentDetailText, { color: theme.colors.primary }]}>
              DUPR Rated
            </Text>
          </View>
        )}
      </View>
      
      {tournament.prizes && tournament.prizes.length > 0 && (
        <View style={styles.prizesSection}>
          <Text style={styles.prizesTitle}>Prizes:</Text>
          <View style={styles.prizesList}>
            {tournament.prizes.slice(0, 3).map((prize, index) => (
              <View key={`tournament-prize-${prize.place}-${index}`} style={styles.prizeItem}>
                <Text style={styles.prizePlace}>{prize.place}</Text>
                <Text style={styles.prizeAmount}>
                  {prize.amount === 0 ? 'Certificate' : `$${prize.amount}`}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.tournamentActions}>
        <TouchableOpacity 
          style={[
            styles.registerButton, 
            (tournament.currentParticipants >= tournament.maxParticipants || 
             tournament.status !== TournamentStatus.REGISTRATION_OPEN) && styles.registerButtonDisabled
          ]}
          onPress={() => handleRegister(tournament)}
          disabled={tournament.currentParticipants >= tournament.maxParticipants || 
                   tournament.status !== TournamentStatus.REGISTRATION_OPEN}
        >
          <Text style={styles.registerButtonText}>
            {tournament.currentParticipants >= tournament.maxParticipants ? 'Full' :
             tournament.status !== TournamentStatus.REGISTRATION_OPEN ? 'Closed' : 'Register'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header with Search */}
      <View style={styles.compactHeader}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tournaments..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateTournament}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.createButtonGradient}
            >
              <Ionicons name="add" size={18} color="white" />
              <Text style={styles.createButtonText}>Create</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>



      {/* Compact Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {/* Format Filter */}
          <View style={styles.filterChip}>
            <Text style={styles.filterChipLabel}>Format</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipOptions}>
              {['ALL', ...Object.values(TournamentFormat)].map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.filterChipOption,
                    selectedFormat === format && styles.filterChipOptionSelected
                  ]}
                  onPress={() => setSelectedFormat(format as any)}
                >
                  <Text style={[
                    styles.filterChipOptionText,
                    selectedFormat === format && styles.filterChipOptionTextSelected
                  ]}>
                    {format === 'ALL' ? 'All' : getFormatDisplayName(format as TournamentFormat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Skill Level Filter */}
          <View style={styles.filterChip}>
            <Text style={styles.filterChipLabel}>Skill</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipOptions}>
              {['ALL', ...Object.values(SkillLevel)].map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.filterChipOption,
                    selectedSkillLevel === skill && styles.filterChipOptionSelected
                  ]}
                  onPress={() => setSelectedSkillLevel(skill as any)}
                >
                  <Text style={[
                    styles.filterChipOptionText,
                    selectedSkillLevel === skill && styles.filterChipOptionTextSelected
                  ]}>
                    {skill === 'ALL' ? 'All' : skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Status Filter */}
          <View style={styles.filterChip}>
            <Text style={styles.filterChipLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipOptions}>
              {['ALL', ...Object.values(TournamentStatus)].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChipOption,
                    selectedStatus === status && styles.filterChipOptionSelected
                  ]}
                  onPress={() => setSelectedStatus(status as any)}
                >
                  <Text style={[
                    styles.filterChipOptionText,
                    selectedStatus === status && styles.filterChipOptionTextSelected
                  ]}>
                    {status === 'ALL' ? 'All' : getStatusText(status as TournamentStatus)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Loading State */}
      {isLoading && !refreshing && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tournaments...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTournaments}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tournaments List */}
      {!isLoading && !error && (
        <View style={styles.tournamentsContainer}>
          <FlatList
            data={filteredTournaments}
            renderItem={renderTournamentCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.tournamentsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={styles.emptyTitle}>No tournaments found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || selectedFormat !== 'ALL' || selectedSkillLevel !== 'ALL' || selectedStatus !== 'ALL'
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to create a tournament!'}
                </Text>
                <TouchableOpacity style={styles.createFirstTournamentButton} onPress={handleCreateTournament}>
                  <Text style={styles.createFirstTournamentButtonText}>Create First Tournament</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  compactHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  createButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    minWidth: 80,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  createButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  filtersScroll: {
    paddingRight: theme.spacing.lg,
  },
  filterChip: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
    minWidth: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChipOptions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  filterChipOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  filterChipOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipOptionText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.text,
  },
  filterChipOptionTextSelected: {
    color: 'white',
  },
  filterGroup: {
    marginRight: theme.spacing.lg,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  tournamentsContainer: {
    flex: 1,
    marginTop: theme.spacing.xs,
  },
  tournamentsList: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xxl,
  },
  tournamentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows?.sm,
  },
  tournamentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tournamentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  tournamentStatus: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tournamentStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  tournamentDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  tournamentDetails: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  tournamentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  tournamentDetailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  prizesSection: {
    marginBottom: theme.spacing.md,
  },
  prizesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  prizesList: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  prizeItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  prizePlace: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  prizeAmount: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  tournamentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  registerButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    padding: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  createFirstTournamentButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  createFirstTournamentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TournamentsScreen;
