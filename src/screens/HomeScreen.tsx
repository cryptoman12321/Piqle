import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useNavigation } from '@react-navigation/native';
import { Game, Court, GameFormat, SkillLevel, GameStatus, CourtType, CourtSurface, Tournament, TournamentFormat, TournamentStatus } from '../types';

const HomeScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { games, getUpcomingGames } = useGameStore();
  const { tournaments, getUpcomingTournaments } = useTournamentStore();
  const navigation = useNavigation<any>();

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

  const handleViewTournaments = () => {
    navigation.navigate('TournamentsList' as never);
  };

  const handleFindGame = () => {
    // Temporarily disabled - Games tab removed
    Alert.alert('Coming Soon', 'Games functionality will be available soon!');
  };

  const handleFindTournament = () => {
    navigation.navigate('TournamentsList' as never);
  };

  const handleFindCourt = () => {
    navigation.navigate('Map' as never);
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
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as any)}
          >
            <Ionicons name="person-circle" size={40} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCreateGame}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.actionGradient}
              >
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.actionText}>Create Game</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleViewTournaments}>
              <LinearGradient
                colors={[theme.colors.warning, '#D97706']}
                style={styles.actionGradient}
              >
                <Ionicons name="trophy" size={24} color="white" />
                <Text style={styles.actionText}>Tournaments</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleFindGame}>
              <LinearGradient
                colors={[theme.colors.success, '#059669']}
                style={styles.actionGradient}
              >
                <Ionicons name="search" size={24} color="white" />
                <Text style={styles.actionText}>Find Game</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleFindCourt}>
              <LinearGradient
                colors={[theme.colors.info, '#2563EB']}
                style={styles.actionGradient}
              >
                <Ionicons name="map" size={24} color="white" />
                <Text style={styles.actionText}>Find Court</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Games */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            <TouchableOpacity onPress={handleFindGame}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentGames.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentGames.map((game) => (
                <TouchableOpacity 
                  key={game.id} 
                  style={styles.gameCard}
                  onPress={() => Alert.alert('Game Details', `Details for ${game.title} coming soon!`)}
                >
                  <View style={styles.gameCardHeader}>
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <View style={[styles.gameStatus, { backgroundColor: theme.colors.success }]}>
                      <Text style={styles.gameStatusText}>{game.status}</Text>
                    </View>
                  </View>
                  <View style={styles.gameDetails}>
                    <View style={styles.gameDetail}>
                      <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.gameDetailText}>
                        {game.currentPlayers}/{game.maxPlayers} players
                      </Text>
                    </View>
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
                  onPress={() => Alert.alert('Tournament Details', `Details for ${tournament.name} coming soon!`)}
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
              <TouchableOpacity style={styles.emptySectionButton} onPress={handleViewTournaments}>
                <Text style={styles.emptySectionButtonText}>Browse Tournaments</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Nearby Courts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Courts</Text>
            <TouchableOpacity onPress={handleFindCourt}>
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
                    <View key={index} style={styles.amenityTag}>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionButton: {
    width: '48%',
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
});

export default HomeScreen;
