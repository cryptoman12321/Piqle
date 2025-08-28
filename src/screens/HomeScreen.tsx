import React from 'react';
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
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { Game, Court, GameFormat, SkillLevel, GameStatus, CourtType, CourtSurface } from '../types';

const HomeScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  // Mock data for demo
  const recentGames: Game[] = [
    {
      id: '1',
      title: 'Morning Pickleball',
      format: GameFormat.DOUBLES,
      maxPlayers: 4,
      currentPlayers: 3,
      skillLevel: SkillLevel.INTERMEDIATE,
      location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      isPrivate: false,
      createdBy: 'user1',
      players: [],
      status: GameStatus.UPCOMING,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Weekend Tournament',
      format: GameFormat.SINGLES,
      maxPlayers: 16,
      currentPlayers: 12,
      skillLevel: SkillLevel.ADVANCED,
      location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      isPrivate: false,
      createdBy: 'user2',
      players: [],
      status: GameStatus.UPCOMING,
      createdAt: new Date(),
    },
  ];

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
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.actionGradient}
              >
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.actionText}>Create Game</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={[theme.colors.success, '#059669']}
                style={styles.actionGradient}
              >
                <Ionicons name="search" size={24} color="white" />
                <Text style={styles.actionText}>Find Game</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={[theme.colors.warning, '#D97706']}
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
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentGames.map((game) => (
              <TouchableOpacity key={game.id} style={styles.gameCard}>
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
        </View>

        {/* Nearby Courts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Courts</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {nearbyCourts.map((court) => (
            <TouchableOpacity key={court.id} style={styles.courtCard}>
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
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
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
