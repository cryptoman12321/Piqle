import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { userService } from '../services/userService';
import { useNavigation } from '@react-navigation/native';
import { Game, Court, GameFormat, SkillLevel, GameStatus, CourtType, CourtSurface, Tournament, TournamentFormat, TournamentStatus } from '../types';
import { getWeekDays, isDateInDay } from '../utils/dateUtils';

const HomeScreen: React.FC = () => {
  const { getCurrentTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { games, getUpcomingGames, joinGame } = useGameStore();
  const { tournaments, getUpcomingTournaments } = useTournamentStore();
  const navigation = useNavigation<any>();

  // Render player circles (same as in GamesScreen)
  const renderPlayerCircles = (game: Game) => {
    const circles = [];
    
    // Add existing players
    for (let i = 0; i < game.players.length; i++) {
      const playerId = game.players[i];
      const player = userService.getUserById(playerId);
      const initials = player ? `${player.firstName[0]}${player.lastName[0]}` : '?';
      const isCurrentUser = playerId === user?.id;
      
      circles.push(
        <View key={`player-${i}`} style={[styles.playerCircle, isCurrentUser && styles.currentUserCircle]}>
          <Text style={styles.playerInitials}>{initials}</Text>
        </View>
      );
    }
    
    // Add empty slots or plus buttons
    for (let i = game.players.length; i < game.maxPlayers; i++) {
      if (!game.players.includes(user?.id || '')) {
        // Show plus button for joining if user is not in the game
        circles.push(
          <TouchableOpacity 
            key={`plus-${i}`} 
            style={styles.plusCircle}
            onPress={(e) => {
              e.stopPropagation();
              handleJoinGame(game);
            }}
          >
            <Ionicons name="add" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        );
      } else {
        // Show empty slot if user is already in the game
        circles.push(
          <View key={`empty-${i}`} style={styles.emptyCircle} />
        );
      }
    }
    
    // Add VS between teams for all games
    let displayCircles = circles;
    if (game.format === GameFormat.SINGLES && game.maxPlayers === 2) {
      // Insert VS between 1v1 players
      displayCircles = [
        circles[0],
        <View key="vs" style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>,
        circles[1]
      ];
    } else if (game.format === GameFormat.DOUBLES && game.maxPlayers === 4) {
      // Insert VS after 2nd player for 2v2 games
      displayCircles = [
        ...circles.slice(0, 2),
        <View key="vs" style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>,
        ...circles.slice(2)
      ];
    }
    
    return (
      <View style={styles.playersContainer}>
        <Text style={styles.playersLabel}>Players ({game.players.length}/{game.maxPlayers})</Text>
        <View style={styles.playerCircles}>
          {displayCircles}
        </View>
        
        {/* Show match result if completed */}
        {game.result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              {game.result.matches.map((match, index) => 
                `${match.team1Score}-${match.team2Score}`
              ).join(', ')}
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  const theme = getCurrentTheme();

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          getUpcomingGames(),
          getUpcomingTournaments()
        ]);
      } catch (error) {
        console.error('Failed to load home data:', error);
      }
    };
    
    loadData();
  }, [getUpcomingGames, getUpcomingTournaments]);

  // Get recent games and tournaments from stores
  const recentGames = getUpcomingGames().slice(0, 2);
  const recentTournaments = getUpcomingTournaments().slice(0, 2);

  // Mock data for courts (in real app this would come from a court store)
  const nearbyCourts: Court[] = [
    {
      id: '1',
      name: 'Central Park Courts',
      location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
      type: CourtType.PICKLEBALL,
      surface: CourtSurface.CONCRETE,
      isIndoor: false,
      isAvailable: true,
      amenities: ['Lighting', 'Parking', 'Water'],
      photos: [],
    },
    {
      id: '2',
      name: 'Riverside Sports Complex',
      location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
      type: CourtType.MULTI_SPORT,
      surface: CourtSurface.ARTIFICIAL_TURF,
      isIndoor: false,
      isAvailable: true,
      amenities: ['Lighting', 'Parking', 'Locker Rooms'],
      photos: [],
    },
  ];

  const handleCreateGame = () => {
    navigation.navigate('CreateGame' as never);
  };

  const handleCreateTournament = () => {
    navigation.navigate('CreateTournament' as never);
  };



  const handleJoinGame = async (game: Game) => {
    if (game.currentPlayers >= game.maxPlayers) {
      return; // Game is full
    }
    
    if (!user?.id) {
      return; // User not logged in
    }
    
    // Join the game using the store
    await joinGame(game.id, user.id);
    
    // Navigate to game details
    navigation.navigate('GameDetails' as never, { gameId: game.id } as never);
  };

  const handleFindTournament = () => {
    navigation.navigate('TournamentsList' as never);
  };

  const handleFindTournaments = () => {
    navigation.navigate('TournamentsList' as never);
  };

  // Calendar helper functions - now using dateUtils
  const getLocalWeekDays = () => {
    return getWeekDays(7);
  };

  const getEventsForDay = (dateString: string) => {
    return {
      games: games.filter(game => isDateInDay(game.startTime, dateString)),
      tournaments: tournaments.filter(tournament => isDateInDay(tournament.startDate, dateString)),
    };
  };

  const getEventDotColor = (dayEvents: { games: Game[], tournaments: Tournament[] }) => {
    if (dayEvents.games.length > 0 && dayEvents.tournaments.length > 0) {
      return theme.colors.warning; // Mixed events
    } else if (dayEvents.tournaments.length > 0) {
      return theme.colors.secondary; // Tournaments only
    } else {
      return theme.colors.primary; // Games only
    }
  };

  const getTotalEventsThisWeek = () => {
    const weekDays = getLocalWeekDays();
    let total = 0;
    
    weekDays.forEach(day => {
      const dayEvents = getEventsForDay(day.date);
      total += dayEvents.games.length + dayEvents.tournaments.length;
    });
    
    return total;
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.userName}>{user?.firstName || 'Player'}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings' as any)}
            >
              <Ionicons name="settings" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile' as any)}
            >
              <Ionicons name="person-circle" size={40} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {/* Row 1: Create Game & Find Tournaments */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCreateGame}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="add-circle" size={24} color="white" />
                  <Text style={styles.actionText}>Create Game</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleFindTournaments}>
                <LinearGradient
                  colors={[theme.colors.warning, '#D97706']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="trophy" size={24} color="white" />
                  <Text style={styles.actionText}>Find Tournaments</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {/* Row 2: Clubs */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ClubsList' as never)}>
                <LinearGradient
                  colors={[theme.colors.secondary, '#7C3AED']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="business" size={24} color="white" />
                  <Text style={styles.actionText}>Clubs</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {/* Row 3: Map */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Map' as never)}>
                <LinearGradient
                  colors={[theme.colors.error, '#DC2626']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="map" size={24} color="white" />
                  <Text style={styles.actionText}>Map</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>


          </View>
        </View>

        {/* Weekly Calendar Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar' as never)}>
              <Text style={styles.seeAllText}>View Full Calendar</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.calendarPreview}
            onPress={() => navigation.navigate('Calendar' as never)}
          >
            <View style={styles.calendarPreviewHeader}>
              <Ionicons name="calendar" size={24} color={theme.colors.primary} />
              <Text style={styles.calendarPreviewTitle}>Weekly Schedule</Text>
            </View>
            
            <View style={styles.weekDaysContainer}>
              {getLocalWeekDays().map((day, index) => {
                const dayEvents = getEventsForDay(day.date);
                const hasEvents = dayEvents.games.length > 0 || dayEvents.tournaments.length > 0;
                
                return (
                  <View key={`day-${day.date}`} style={styles.dayContainer}>
                    <Text style={[
                      styles.dayName, 
                      day.isToday && styles.todayDayName
                    ]}>
                      {day.shortName}
                    </Text>
                    <Text style={[
                      styles.dayNumber,
                      day.isToday && styles.todayDayNumber
                    ]}>
                      {day.dayNumber}
                    </Text>
                    {hasEvents && (
                      <View style={styles.eventIndicator}>
                        <View style={[
                          styles.eventDot,
                          { backgroundColor: getEventDotColor(dayEvents) }
                        ]} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            
            <View style={styles.calendarPreviewFooter}>
              <Text style={styles.calendarPreviewSubtitle}>
                {getTotalEventsThisWeek()} events this week
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Games */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
          </View>
          {recentGames.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentGames.map((game) => (
                <TouchableOpacity 
                  key={game.id} 
                  style={styles.gameCard}
                  onPress={() => navigation.navigate('GameDetails' as never, { gameId: game.id } as never)}
                >
                  <View style={styles.gameCardHeader}>
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <View style={[styles.gameStatus, { backgroundColor: theme.colors.success }]}>
                      <Text style={styles.gameStatusText}>{game.status}</Text>
                    </View>
                  </View>
                  {/* Player Circles */}
                  {renderPlayerCircles(game)}
                  
                  <View style={styles.gameDetails}>
                    <View style={styles.gameDetail}>
                      <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.gameDetailText}>
                        {game.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View style={styles.gameDetail}>
                      <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.gameDetailText}>{game.location.city}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="game-controller-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptySectionText}>No games yet</Text>
              <TouchableOpacity style={styles.emptySectionButton} onPress={handleCreateGame}>
                <Text style={styles.emptySectionButtonText}>Create Your First Game</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Tournaments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tournaments</Text>
            <TouchableOpacity onPress={handleFindTournament}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentTournaments.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentTournaments.map((tournament) => (
                <TouchableOpacity 
                  key={tournament.id} 
                  style={styles.tournamentCard}
                  onPress={() => navigation.navigate('TournamentDetails' as never, { tournamentId: tournament.id } as never)}
                >
                  <View style={styles.tournamentCardHeader}>
                    <Text style={styles.tournamentTitle}>{tournament.name}</Text>
                    <View style={[styles.tournamentStatus, { backgroundColor: theme.colors.warning }]}>
                      <Text style={styles.tournamentStatusText}>{tournament.status}</Text>
                    </View>
                  </View>
                  <View style={styles.tournamentDetails}>
                    <View style={styles.tournamentDetail}>
                      <Ionicons name="trophy" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.tournamentDetailText}>
                        {tournament.format === TournamentFormat.DOUBLES_KNOCKOUT ? 'Doubles KO' : 
                         tournament.format === TournamentFormat.DOUBLES_ROUND_ROBIN ? 'Doubles RR' : 'Tournament'}
                      </Text>
                    </View>
                    <View style={styles.tournamentDetail}>
                      <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.tournamentDetailText}>
                        {tournament.currentParticipants}/{tournament.maxParticipants} players
                      </Text>
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
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptySection}>
              <Ionicons name="trophy-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptySectionText}>No tournaments yet</Text>
              <TouchableOpacity style={styles.emptySectionButton} onPress={handleFindTournament}>
                <Text style={styles.emptySectionButtonText}>Find Tournaments</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Nearby Courts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Courts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Map' as never)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {nearbyCourts.map((court) => (
            <TouchableOpacity 
              key={court.id} 
              style={styles.courtCard}
              onPress={() => navigation.navigate('CourtDetails' as never, { courtId: court.id } as never)}
            >
              <View style={styles.courtInfo}>
                <Text style={styles.courtName}>{court.name}</Text>
                <Text style={styles.courtType}>{court.type}</Text>
                <View style={styles.courtAmenities}>
                  {court.amenities.slice(0, 3).map((amenity, index) => (
                    <View key={`${court.id}-amenity-${index}`} style={styles.amenityTag}>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.courtStatus}>
                <View style={[styles.availabilityDot, { backgroundColor: court.isAvailable ? theme.colors.success : theme.colors.error }]} />
                <Text style={styles.availabilityText}>
                  {court.isAvailable ? 'Available' : 'Occupied'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  profileButton: {
    padding: theme.spacing.sm,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  quickActions: {
    // Removed flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md,
    // This will cause the buttons to stack vertically within each row
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    width: '48%', // Adjusted width for 2x3 grid
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows?.md,
  },
  actionGradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarPreview: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows?.sm,
  },
  calendarPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  calendarPreviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  dayContainer: {
    alignItems: 'center',
    minWidth: 40,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  todayDayName: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  todayDayNumber: {
    color: theme.colors.primary,
  },
  eventIndicator: {
    alignItems: 'center',
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  calendarPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  calendarPreviewSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  gameCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    width: 280,
    ...theme.shadows?.sm,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  gameStatus: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  gameStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  gameDetails: {
    gap: theme.spacing.xs,
  },
  gameDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  gameDetailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  tournamentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    width: 280,
    ...theme.shadows?.sm,
  },
  tournamentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tournamentTitle: {
    fontSize: 16,
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
  tournamentDetails: {
    gap: theme.spacing.xs,
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
  emptySection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptySectionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptySectionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emptySectionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  courtCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows?.sm,
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  courtType: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  courtAmenities: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  amenityTag: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  amenityText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  courtStatus: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  // Player circles styles
  playersContainer: {
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  playersLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  playerCircles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  playerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentUserCircle: {
    backgroundColor: theme.colors.success,
    borderWidth: 1,
    borderColor: theme.colors.text,
  },
  playerInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  plusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  resultContainer: {
    marginTop: theme.spacing.xs,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
});

export default HomeScreen;
