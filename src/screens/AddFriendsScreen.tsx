import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useFriendsStore } from '../stores/friendsStore';
import { useNavigation } from '@react-navigation/native';
import { SkillLevel } from '../types';

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  skillLevel?: SkillLevel;
  photo?: string;
  isAlreadyFriend: boolean;
  hasPendingRequest: boolean;
}

const AddFriendsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { sendFriendRequest, friends } = useFriendsStore();
  const navigation = useNavigation<any>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'skill' | 'location'>('all');

  const styles = createStyles(theme);

  // Mock search results - in real app this would come from API
  const mockSearchResults: SearchResult[] = [
    {
      id: 'user1',
      firstName: 'Alex',
      lastName: 'Thompson',
      email: 'alex@example.com',
      city: 'Miami',
      skillLevel: SkillLevel.INTERMEDIATE,
      isAlreadyFriend: false,
      hasPendingRequest: false,
    },
    {
      id: 'user2',
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma@example.com',
      city: 'Seattle',
      skillLevel: SkillLevel.ADVANCED,
      isAlreadyFriend: false,
      hasPendingRequest: false,
    },
    {
      id: 'user3',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david@example.com',
      city: 'Austin',
      skillLevel: SkillLevel.BEGINNER,
      isAlreadyFriend: false,
      hasPendingRequest: false,
    },
    {
      id: 'user4',
      firstName: 'Lisa',
      lastName: 'Brown',
      email: 'lisa@example.com',
      city: 'Denver',
      skillLevel: SkillLevel.EXPERT,
      isAlreadyFriend: false,
      hasPendingRequest: false,
    },
    {
      id: 'user5',
      firstName: 'Michael',
      lastName: 'Garcia',
      email: 'michael@example.com',
      city: 'Portland',
      skillLevel: SkillLevel.PROFESSIONAL,
      isAlreadyFriend: false,
      hasPendingRequest: false,
    },
    {
      id: 'user6',
      firstName: 'Andrew',
      lastName: 'Smith',
      email: '3',
      city: 'New York',
      skillLevel: SkillLevel.INTERMEDIATE,
      isAlreadyFriend: false,
      hasPendingRequest: false,
    },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter mock results based on search query
      let filtered = mockSearchResults.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.skillLevel?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Apply additional filters
      switch (selectedFilter) {
        case 'skill':
          filtered = filtered.filter(user => user.skillLevel);
          break;
        case 'location':
          filtered = filtered.filter(user => user.city);
          break;
        default:
          break;
      }

      // Mark users who are already friends or have pending requests
      filtered = filtered.map(user => ({
        ...user,
        isAlreadyFriend: friends.some(friend => friend.friendId === user.id),
        hasPendingRequest: false, // In real app, check pending requests
      }));

      setSearchResults(filtered);
    } catch (error) {
      Alert.alert('Error', 'Failed to search for users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = (user: SearchResult) => {
    Alert.alert(
      'Send Friend Request',
      `Send a friend request to ${user.firstName} ${user.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: () => {
            sendFriendRequest(user.id);
            // Update local state to show pending request
            setSearchResults(prev => 
              prev.map(result => 
                result.id === user.id 
                  ? { ...result, hasPendingRequest: true }
                  : result
              )
            );
            Alert.alert('Request Sent', `Friend request sent to ${user.firstName}!`);
          },
        },
      ]
    );
  };

  const handleInviteToGame = (user: SearchResult) => {
    Alert.alert(
      'Invite to Game',
      `Invite ${user.firstName} to play?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Invite',
          onPress: () => {
            navigation.navigate('CreateGame' as any);
            Alert.alert('Invitation Sent', `Game invitation sent to ${user.firstName}!`);
          },
        },
      ]
    );
  };

  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.BEGINNER: return theme.colors.success;
      case SkillLevel.INTERMEDIATE: return theme.colors.warning;
      case SkillLevel.ADVANCED: return theme.colors.info;
      case SkillLevel.EXPERT: return theme.colors.primary;
      case SkillLevel.PROFESSIONAL: return theme.colors.secondary;
      default: return theme.colors.textSecondary;
    }
  };

  const getFilteredResults = () => {
    let filtered = searchResults;

    // Apply additional filters
    switch (selectedFilter) {
      case 'skill':
        filtered = filtered.filter(user => user.skillLevel);
        break;
      case 'location':
        filtered = filtered.filter(user => user.city);
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredResults = getFilteredResults();

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
              <Text style={styles.headerTitle}>Add Friends</Text>
              <Text style={styles.headerSubtitle}>Find and connect with pickleball players</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, city, or skill level..."
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

          <View style={styles.filterContainer}>
            {[
              { key: 'all', label: 'All', icon: 'people' },
              { key: 'skill', label: 'Skill Level', icon: 'star' },
              { key: 'location', label: 'Location', icon: 'location' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.key && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedFilter(filter.key as any)}
              >
                <Ionicons 
                  name={filter.icon as any} 
                  size={16} 
                  color={selectedFilter === filter.key ? 'white' : theme.colors.textSecondary} 
                />
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.key && { color: 'white' }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search Results */}
        <View style={styles.resultsSection}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Searching for users...
              </Text>
            </View>
          ) : searchQuery.trim() && filteredResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No users found
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Try adjusting your search terms or filters
              </Text>
            </View>
          ) : !searchQuery.trim() ? (
            <View style={styles.initialContainer}>
              <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.initialTitle, { color: theme.colors.text }]}>
                Start searching for friends
              </Text>
              <Text style={[styles.initialText, { color: theme.colors.textSecondary }]}>
                Search by name, city, or skill level to find pickleball players near you
              </Text>
            </View>
          ) : (
            filteredResults.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarContainer}>
                    {user.photo ? (
                      <Image source={{ uri: user.photo }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                          {user.firstName[0]}{user.lastName[0]}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {user.firstName} {user.lastName}
                    </Text>
                    
                    <View style={styles.userMeta}>
                      {user.city && (
                        <View style={styles.metaItem}>
                          <Ionicons name="location" size={14} color={theme.colors.textSecondary} />
                          <Text style={styles.metaText}>{user.city}</Text>
                        </View>
                      )}
                      
                      {user.skillLevel && (
                        <View style={styles.metaItem}>
                          <View style={[
                            styles.skillLevelDot,
                            { backgroundColor: getSkillLevelColor(user.skillLevel) }
                          ]} />
                          <Text style={styles.metaText}>{user.skillLevel}</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                
                <View style={styles.userActions}>
                  {user.isAlreadyFriend ? (
                    <View style={[styles.actionButton, styles.friendButton]}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>
                        Already Friends
                      </Text>
                    </View>
                  ) : user.hasPendingRequest ? (
                    <View style={[styles.actionButton, styles.pendingButton]}>
                      <Ionicons name="time" size={16} color={theme.colors.warning} />
                      <Text style={[styles.actionButtonText, { color: theme.colors.warning }]}>
                        Request Sent
                      </Text>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.addButton]}
                        onPress={() => handleSendFriendRequest(user)}
                      >
                        <Ionicons name="person-add" size={16} color={theme.colors.primary} />
                        <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                          Add Friend
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.inviteButton]}
                        onPress={() => handleInviteToGame(user)}
                      >
                        <Ionicons name="game-controller" size={16} color={theme.colors.info} />
                        <Text style={[styles.actionButtonText, { color: theme.colors.info }]}>
                          Invite to Game
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Tips Section */}
        {searchQuery.trim() && filteredResults.length > 0 && (
          <View style={styles.tipsSection}>
            <View style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={24} color={theme.colors.warning} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Pro Tips</Text>
                <Text style={styles.tipText}>
                  • Send friend requests to players with similar skill levels{'\n'}
                  • Connect with players in your area for local games{'\n'}
                  • Invite new friends to games to build relationships
                </Text>
              </View>
            </View>
          </View>
        )}
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
  backButton: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
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
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
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
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  resultsSection: {
    paddingHorizontal: theme.spacing.lg,
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
  initialContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  initialTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  initialText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  userCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: theme.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  skillLevelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  userActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: 8,
    gap: 4,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addButton: {
    borderColor: theme.colors.primary,
  },
  inviteButton: {
    borderColor: theme.colors.info,
  },
  friendButton: {
    borderColor: theme.colors.success,
  },
  pendingButton: {
    borderColor: theme.colors.warning,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default AddFriendsScreen;
