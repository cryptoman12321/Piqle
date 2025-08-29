import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useClubsStore, Club } from '../stores/clubsStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';

const ClubsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { 
    clubs, 
    isLoading, 
    loadClubs,
    searchQuery,
    selectedCategory,
    selectedLocation,
    setSearchQuery,
    setSelectedCategory,
    setSelectedLocation,
    getFilteredClubs,
    sendClubInvitation
  } = useClubsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const styles = createStyles(theme);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClubs();
    setRefreshing(false);
  };

  const handleClubPress = (club: Club) => {
    navigation.navigate('ClubDetails', { clubId: club.id });
  };

  const handleCreateClub = () => {
    navigation.navigate('CreateClub');
  };

  const handleJoinClub = (club: Club) => {
    if (club.membershipType === 'INVITATION_ONLY') {
      Alert.alert(
        'Invitation Required',
        'This club requires an invitation to join. Please contact the club administrators.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (club.membershipType === 'APPLICATION_REQUIRED') {
      navigation.navigate('ClubApplication', { clubId: club.id });
      return;
    }

    // For free/paid clubs, show join options
    Alert.alert(
      'Join Club',
      `Would you like to join ${club.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: () => {
            // In a real app, this would process the join request
            Alert.alert('Success', `You have joined ${club.name}!`);
          }
        },
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'RECREATIONAL': return 'happy';
      case 'COMPETITIVE': return 'trophy';
      case 'MIXED': return 'people';
      case 'ELITE': return 'star';
      case 'BEGINNER_FRIENDLY': return 'school';
      default: return 'business';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'RECREATIONAL': return theme.colors.success;
      case 'COMPETITIVE': return theme.colors.warning;
      case 'MIXED': return theme.colors.info;
      case 'ELITE': return theme.colors.primary;
      case 'BEGINNER_FRIENDLY': return theme.colors.secondary;
      default: return theme.colors.textSecondary;
    }
  };

  const getMembershipTypeText = (type: string) => {
    switch (type) {
      case 'FREE': return 'Free';
      case 'PAID': return 'Paid';
      case 'INVITATION_ONLY': return 'Invitation Only';
      case 'APPLICATION_REQUIRED': return 'Application Required';
      default: return 'Unknown';
    }
  };

  const getMembershipTypeColor = (type: string) => {
    switch (type) {
      case 'FREE': return theme.colors.success;
      case 'PAID': return theme.colors.warning;
      case 'INVITATION_ONLY': return theme.colors.error;
      case 'APPLICATION_REQUIRED': return theme.colors.info;
      default: return theme.colors.textSecondary;
    }
  };

  const formatMemberCount = (current: number, max: number) => {
    if (max === 0) return `${current} members`;
    const percentage = Math.round((current / max) * 100);
    return `${current}/${max} (${percentage}%)`;
  };

  const filteredClubs = getFilteredClubs();

  const categories = ['RECREATIONAL', 'COMPETITIVE', 'MIXED', 'ELITE', 'BEGINNER_FRIENDLY'];
  const locations = Array.from(new Set(clubs.map(club => club.location.city)));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Pickleball Clubs</Text>
              <Text style={styles.headerSubtitle}>
                {clubs.length} clubs • Join communities and compete
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clubs..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === null && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === null && { color: 'white' }
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                <Ionicons 
                  name={getCategoryIcon(category) as any} 
                  size={16} 
                  color={selectedCategory === category ? 'white' : getCategoryColor(category)} 
                />
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

        {/* Location Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Location</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedLocation === null && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedLocation(null)}
            >
              <Text style={[
                styles.filterChipText,
                selectedLocation === null && { color: 'white' }
              ]}>
                All Locations
              </Text>
            </TouchableOpacity>
            
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.filterChip,
                  selectedLocation === location && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedLocation(selectedLocation === location ? null : location)}
              >
                <Ionicons 
                  name="location" 
                  size={16} 
                  color={selectedLocation === location ? 'white' : theme.colors.textSecondary} 
                />
                <Text style={[
                  styles.filterChipText,
                  selectedLocation === location && { color: 'white' }
                ]}>
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Clubs List */}
        <View style={styles.clubsSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading clubs...
              </Text>
            </View>
          ) : filteredClubs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                {searchQuery || selectedCategory || selectedLocation ? 'No clubs found' : 'No clubs yet'}
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {searchQuery || selectedCategory || selectedLocation 
                  ? 'Try adjusting your search or filters.'
                  : 'Be the first to create a club in your area!'
                }
              </Text>
            </View>
          ) : (
            filteredClubs.map((club) => (
              <TouchableOpacity
                key={club.id}
                style={styles.clubCard}
                onPress={() => handleClubPress(club)}
                activeOpacity={0.7}
              >
                {/* Club Header */}
                <View style={styles.clubHeader}>
                  <View style={styles.clubLogoContainer}>
                    {club.logo ? (
                      <Image source={{ uri: club.logo }} style={styles.clubLogo} />
                    ) : (
                      <View style={[styles.clubLogoPlaceholder, { backgroundColor: getCategoryColor(club.category) + '20' }]}>
                        <Ionicons 
                          name={getCategoryIcon(club.category) as any} 
                          size={32} 
                          color={getCategoryColor(club.category)} 
                        />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.clubInfo}>
                    <View style={styles.clubTitleRow}>
                      <Text style={styles.clubName}>{club.name}</Text>
                      {club.isVerified && (
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.clubCategory}>
                      {club.category.replace('_', ' ')} • {club.location.city}
                    </Text>
                    
                    <View style={styles.clubStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.statText}>
                          {formatMemberCount(club.currentMembers, club.maxMembers)}
                        </Text>
                      </View>
                      
                      <View style={styles.statItem}>
                        <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.statText}>
                          {club.events.length} events
                        </Text>
                      </View>
                      
                      <View style={styles.statItem}>
                        <Ionicons name="star" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.statText}>
                          {club.stats.averageRating.toFixed(1)} rating
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Club Description */}
                <Text style={styles.clubDescription} numberOfLines={2}>
                  {club.description}
                </Text>

                {/* Club Footer */}
                <View style={styles.clubFooter}>
                  <View style={styles.membershipInfo}>
                    <View style={[
                      styles.membershipBadge,
                      { backgroundColor: getMembershipTypeColor(club.membershipType) + '20' }
                    ]}>
                      <Text style={[
                        styles.membershipText,
                        { color: getMembershipTypeColor(club.membershipType) }
                      ]}>
                        {getMembershipTypeText(club.membershipType)}
                      </Text>
                    </View>
                    
                    {club.membershipFee && (
                      <Text style={styles.membershipFee}>
                        ${club.membershipFee}/month
                      </Text>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => handleJoinClub(club)}
                  >
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Create Club Button */}
        <TouchableOpacity style={styles.createClubButton} onPress={handleCreateClub}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.createClubGradient}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.createClubText}>Create New Club</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  filterSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  clubsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  clubCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clubHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  clubLogoContainer: {
    marginRight: theme.spacing.md,
  },
  clubLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  clubLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubInfo: {
    flex: 1,
  },
  clubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: theme.spacing.xs,
  },
  clubCategory: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  clubStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  clubDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  membershipBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  membershipFee: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  createClubButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  createClubGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: 16,
    gap: theme.spacing.sm,
  },
  createClubText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ClubsScreen;
