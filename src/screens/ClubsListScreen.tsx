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
import { useNavigation } from '@react-navigation/native';

interface Club {
  id: string;
  name: string;
  description: string;
  location: {
    city: string;
    state: string;
    address: string;
  };
  memberCount: number;
  maxMembers: number;
  category: 'PICKLEBALL' | 'TENNIS' | 'MULTI_SPORT' | 'SOCIAL' | 'COMPETITIVE';
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  membershipFee: number;
  isPublic: boolean;
  photo: string;
  tags: string[];
  rating: number;
  reviewCount: number;
}

const ClubsListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>('ALL');

  const handleCreateClub = () => {
    navigation.navigate('CreateClub' as never);
  };

  // Mock clubs data
  const clubs: Club[] = [
    {
      id: '1',
      name: 'NYC Pickleball Club',
      description: 'Premier pickleball community with professional coaching, tournaments, and social events.',
      location: {
        city: 'New York',
        state: 'NY',
        address: 'Manhattan, NY',
      },
      memberCount: 156,
      maxMembers: 200,
      category: 'PICKLEBALL',
      skillLevel: 'ALL_LEVELS',
      membershipFee: 50,
      isPublic: true,
      photo: '',
      tags: ['Professional', 'Coaching', 'Tournaments', 'Social'],
      rating: 4.8,
      reviewCount: 89,
    },
    {
      id: '2',
      name: 'Brooklyn Tennis Society',
      description: 'Friendly tennis community for all skill levels. Weekly meetups and casual play.',
      location: {
        city: 'Brooklyn',
        state: 'NY',
        address: 'Brooklyn, NY',
      },
      memberCount: 89,
      maxMembers: 120,
      category: 'TENNIS',
      skillLevel: 'ALL_LEVELS',
      membershipFee: 35,
      isPublic: true,
      photo: '',
      tags: ['Casual', 'Weekly Meetups', 'Friendly', 'All Levels'],
      rating: 4.6,
      reviewCount: 67,
    },
    {
      id: '3',
      name: 'Queens Sports Collective',
      description: 'Multi-sport community with focus on pickleball. Indoor and outdoor facilities.',
      location: {
        city: 'Queens',
        state: 'NY',
        address: 'Queens, NY',
      },
      memberCount: 234,
      maxMembers: 300,
      category: 'MULTI_SPORT',
      skillLevel: 'ALL_LEVELS',
      membershipFee: 75,
      isPublic: false,
      photo: '',
      tags: ['Multi-Sport', 'Indoor', 'Outdoor', 'Facilities'],
      rating: 4.9,
      reviewCount: 156,
    },
    {
      id: '4',
      name: 'Manhattan Elite Pickleball',
      description: 'Competitive pickleball club for advanced players. Professional training and league play.',
      location: {
        city: 'New York',
        state: 'NY',
        address: 'Manhattan, NY',
      },
      memberCount: 45,
      maxMembers: 60,
      category: 'PICKLEBALL',
      skillLevel: 'ADVANCED',
      membershipFee: 120,
      isPublic: false,
      photo: '',
      tags: ['Competitive', 'Advanced', 'Professional', 'League Play'],
      rating: 4.7,
      reviewCount: 34,
    },
  ];

  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           club.location.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'ALL' || club.category === selectedCategory;
      const matchesSkillLevel = selectedSkillLevel === 'ALL' || club.skillLevel === selectedSkillLevel;
      
      return matchesSearch && matchesCategory && matchesSkillLevel;
    });
  }, [searchQuery, selectedCategory, selectedSkillLevel]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PICKLEBALL': return theme.colors.primary;
      case 'TENNIS': return theme.colors.success;
      case 'MULTI_SPORT': return theme.colors.info;
      case 'SOCIAL': return theme.colors.warning;
      case 'COMPETITIVE': return theme.colors.secondary;
      default: return theme.colors.textSecondary;
    }
  };

  const renderClubCard = ({ item }: { item: Club }) => (
    <TouchableOpacity style={styles.clubCard}>
      <View style={styles.clubHeader}>
        <View style={styles.clubInfo}>
          <Text style={styles.clubName}>{item.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category.replace('_', ' ')}</Text>
          </View>
        </View>
        <View style={styles.clubStats}>
          <Text style={styles.ratingText}>{item.rating} ⭐</Text>
          <Text style={styles.reviewText}>({item.reviewCount} reviews)</Text>
        </View>
      </View>
      
      <Text style={styles.clubDescription}>{item.description}</Text>
      
      <View style={styles.clubDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{item.location.city}, {item.location.state}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {item.memberCount}/{item.maxMembers} members
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="star" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Skill Level: {item.skillLevel}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            Membership: ${item.membershipFee}/month
          </Text>
        </View>
      </View>
      
      <View style={styles.clubFooter}>
        <View style={styles.tagsList}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {}}
        >
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
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
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Clubs</Text>
                <Text style={styles.headerSubtitle}>Join amazing sports communities</Text>
              </View>
              <TouchableOpacity style={styles.createButton} onPress={handleCreateClub}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.createButtonGradient}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.createButtonText}>Create</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clubs..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {/* Category Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Category:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {['ALL', 'PICKLEBALL', 'TENNIS', 'MULTI_SPORT', 'SOCIAL', 'COMPETITIVE'].map((category) => (
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

        {/* Clubs List */}
        <View style={styles.clubsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Available Clubs ({filteredClubs.length})
            </Text>
          </View>
          
          {filteredClubs.length > 0 ? (
            <FlatList
              data={filteredClubs}
              renderItem={renderClubCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No clubs found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search criteria or check back later for new clubs.
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
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
  createButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
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
    fontSize: 14,
    fontWeight: '600',
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
  clubsSection: {
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
  clubCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  clubInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  clubStats: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  reviewText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  clubDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  clubDetails: {
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
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsList: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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

export default ClubsListScreen;
