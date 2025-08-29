import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';

interface Tournament {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: {
    city: string;
    venue: string;
    address: string;
  };
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool: number;
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'COMPLETED';
  category: 'SINGLES' | 'DOUBLES' | 'MIXED_DOUBLES' | 'TEAM';
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  organizer: {
    name: string;
    photo: string;
  };
}

const TournamentsListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Mock tournaments data
  const tournaments: Tournament[] = [
    {
      id: '1',
      title: 'Spring Championship 2024',
      description: 'Annual spring tournament for all skill levels',
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-04-17'),
      location: {
        city: 'New York',
        venue: 'Central Park Tennis Center',
        address: '123 Tennis Ave, NY 10001',
      },
      maxParticipants: 64,
      currentParticipants: 48,
      entryFee: 50,
      prizePool: 5000,
      status: 'REGISTRATION_OPEN',
      category: 'SINGLES',
      skillLevel: 'ALL_LEVELS',
      organizer: {
        name: 'NYC Tennis Association',
        photo: '',
      },
    },
    {
      id: '2',
      title: 'Doubles Masters Cup',
      description: 'Elite doubles tournament for advanced players',
      startDate: new Date('2024-05-20'),
      endDate: new Date('2024-05-22'),
      location: {
        city: 'Los Angeles',
        venue: 'LA Tennis Club',
        address: '456 Court St, LA 90210',
      },
      maxParticipants: 32,
      currentParticipants: 28,
      entryFee: 75,
      prizePool: 3000,
      status: 'REGISTRATION_OPEN',
      category: 'DOUBLES',
      skillLevel: 'ADVANCED',
      organizer: {
        name: 'LA Tennis Federation',
        photo: '',
      },
    },
    {
      id: '3',
      title: 'Beginner Friendly Tournament',
      description: 'Perfect for new players to gain experience',
      startDate: new Date('2024-06-10'),
      endDate: new Date('2024-06-10'),
      location: {
        city: 'Chicago',
        venue: 'Community Tennis Center',
        address: '789 Racket Rd, Chicago 60601',
      },
      maxParticipants: 24,
      currentParticipants: 16,
      entryFee: 25,
      prizePool: 500,
      status: 'REGISTRATION_OPEN',
      category: 'SINGLES',
      skillLevel: 'BEGINNER',
      organizer: {
        name: 'Chicago Tennis Community',
        photo: '',
      },
    },
  ];

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      const matchesSearch = tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tournament.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tournament.location.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'ALL' || tournament.category === selectedCategory;
      const matchesSkillLevel = selectedSkillLevel === 'ALL' || tournament.skillLevel === selectedSkillLevel;
      const matchesStatus = selectedStatus === 'ALL' || tournament.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesSkillLevel && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedSkillLevel, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return theme.colors.info;
      case 'REGISTRATION_OPEN': return theme.colors.success;
      case 'REGISTRATION_CLOSED': return theme.colors.warning;
      case 'IN_PROGRESS': return theme.colors.primary;
      case 'COMPLETED': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'Upcoming';
      case 'REGISTRATION_OPEN': return 'Registration Open';
      case 'REGISTRATION_CLOSED': return 'Registration Closed';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  const renderTournamentCard = ({ item }: { item: Tournament }) => (
    <TouchableOpacity style={styles.tournamentCard}>
      <View style={styles.tournamentHeader}>
        <Text style={styles.tournamentTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.tournamentDescription}>{item.description}</Text>
      
      <View style={styles.tournamentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {item.startDate.toLocaleDateString()} - {item.endDate.toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{item.location.venue}, {item.location.city}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {item.currentParticipants}/{item.maxParticipants} participants
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="trophy" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Prize Pool: ${item.prizePool.toLocaleString()}</Text>
        </View>
      </View>
      
      <View style={styles.tournamentFooter}>
        <View style={styles.categoryChips}>
          <View style={[styles.categoryChip, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.categoryChipText}>{item.category.replace('_', ' ')}</Text>
          </View>
          <View style={[styles.categoryChip, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.categoryChipText}>{item.skillLevel}</Text>
          </View>
        </View>
        
        <View style={styles.entryFee}>
          <Text style={styles.entryFeeLabel}>Entry Fee:</Text>
          <Text style={styles.entryFeeAmount}>${item.entryFee}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Tournaments</Text>
              <Text style={styles.headerSubtitle}>Find and join exciting tournaments</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tournaments..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {/* Category Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Category:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {['ALL', 'SINGLES', 'DOUBLES', 'MIXED_DOUBLES', 'TEAM'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedCategory === category && { color: 'white' }
                  ]}>
                    {category.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Skill Level Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Skill Level:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterChip,
                    selectedSkillLevel === level && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setSelectedSkillLevel(level)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedSkillLevel === level && { color: 'white' }
                  ]}>
                    {level.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Tournaments List */}
        <View style={styles.tournamentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Available Tournaments ({filteredTournaments.length})
            </Text>
          </View>
          
          {filteredTournaments.length > 0 ? (
            <FlatList
              data={filteredTournaments}
              renderItem={renderTournamentCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No tournaments found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search criteria or check back later for new tournaments.
              </Text>
            </View>
          )}
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
    padding: theme.spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  filtersSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  filterGroup: {
    marginBottom: theme.spacing.md,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  tournamentsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  tournamentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  tournamentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  tournamentDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  tournamentDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  tournamentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChips: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  entryFee: {
    alignItems: 'flex-end',
  },
  entryFeeLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  entryFeeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TournamentsListScreen;
