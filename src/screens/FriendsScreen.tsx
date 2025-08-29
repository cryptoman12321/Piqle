import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useFriendsStore, Friend } from '../stores/friendsStore';
import { useNavigation } from '@react-navigation/native';
import { SkillLevel } from '../types';

const FriendsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { friends, isLoading, loadFriends, removeFriend } = useFriendsStore();
  const navigation = useNavigation<any>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'recent'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const handleRemoveFriend = (friend: Friend) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.friend.firstName} ${friend.friend.lastName} from your friends list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeFriend(friend.friendId);
            Alert.alert('Friend Removed', `${friend.friend.firstName} has been removed from your friends list.`);
          },
        },
      ]
    );
  };

  const handleInviteToGame = (friend: Friend) => {
    Alert.alert(
      'Invite to Game',
      `Invite ${friend.friend.firstName} to play?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Invite',
          onPress: () => {
            // Navigate to create game with friend pre-selected
            navigation.navigate('CreateGame' as any);
            Alert.alert('Invitation Sent', `Game invitation sent to ${friend.friend.firstName}!`);
          },
        },
      ]
    );
  };

  const handleViewProfile = (friend: Friend) => {
    // In a real app, this would navigate to the friend's profile
    Alert.alert(
      'View Profile',
      `View ${friend.friend.firstName}'s profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View',
          onPress: () => {
            Alert.alert('Profile', `${friend.friend.firstName} ${friend.friend.lastName}\nCity: ${friend.friend.city || 'Not specified'}\nSkill Level: ${friend.friend.skillLevel || 'Not specified'}`);
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

  const getFilteredFriends = () => {
    let filtered = friends;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(friend =>
        friend.friend.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.friend.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.friend.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'online':
        filtered = filtered.filter(friend => friend.friend.isOnline);
        break;
      case 'recent':
        filtered = filtered.filter(friend => 
          friend.lastInteraction && 
          (Date.now() - friend.lastInteraction.getTime()) < 7 * 24 * 60 * 60 * 1000
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredFriends = getFilteredFriends();

  const getOnlineStatusText = (friend: Friend) => {
    if (friend.friend.isOnline) {
      return 'Online now';
    }
    if (friend.friend.lastOnlineTime) {
      const timeDiff = Date.now() - friend.friend.lastOnlineTime.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return `Last seen ${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        return `Last seen ${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        return 'Last seen recently';
      }
    }
    return 'Never seen';
  };

  const getFriendshipDuration = (friend: Friend) => {
    const timeDiff = Date.now() - friend.friendshipDate.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (days > 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else if (days > 7) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

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
              <Text style={styles.headerTitle}>Friends</Text>
              <Text style={styles.headerSubtitle}>
                {friends.length} friend{friends.length !== 1 ? 's' : ''} • {friends.filter(f => f.friend.isOnline).length} online
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
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
              { key: 'online', label: 'Online', icon: 'radio-button-on' },
              { key: 'recent', label: 'Recent', icon: 'time' },
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

        {/* Friends List */}
        <View style={styles.friendsSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading friends...
              </Text>
            </View>
          ) : filteredFriends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                {searchQuery.trim() ? 'No friends found' : 'No friends yet'}
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {searchQuery.trim() 
                  ? 'Try adjusting your search terms'
                  : 'Start building your pickleball community by adding friends!'
                }
              </Text>
              {!searchQuery.trim() && (
                <TouchableOpacity 
                  style={[styles.addFriendButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => navigation.navigate('AddFriends' as any)}
                >
                  <Ionicons name="person-add" size={20} color="white" />
                  <Text style={styles.addFriendButtonText}>Add Friends</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredFriends.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                <View style={styles.friendInfo}>
                  <TouchableOpacity 
                    style={styles.avatarContainer}
                    onPress={() => handleViewProfile(friend)}
                  >
                    {friend.friend.photo ? (
                      <Image source={{ uri: friend.friend.photo }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                          {friend.friend.firstName[0]}{friend.friend.lastName[0]}
                        </Text>
                      </View>
                    )}
                    <View style={[
                      styles.onlineIndicator,
                      { backgroundColor: friend.friend.isOnline ? theme.colors.success : theme.colors.textSecondary }
                    ]} />
                  </TouchableOpacity>
                  
                  <View style={styles.friendDetails}>
                    <TouchableOpacity onPress={() => handleViewProfile(friend)}>
                      <Text style={styles.friendName}>
                        {friend.friend.firstName} {friend.friend.lastName}
                      </Text>
                    </TouchableOpacity>
                    
                    <View style={styles.friendMeta}>
                      {friend.friend.city && (
                        <View style={styles.metaItem}>
                          <Ionicons name="location" size={14} color={theme.colors.textSecondary} />
                          <Text style={styles.metaText}>{friend.friend.city}</Text>
                        </View>
                      )}
                      
                      {friend.friend.skillLevel && (
                        <View style={styles.metaItem}>
                          <View style={[
                            styles.skillLevelDot,
                            { backgroundColor: getSkillLevelColor(friend.friend.skillLevel as SkillLevel) }
                          ]} />
                          <Text style={styles.metaText}>{friend.friend.skillLevel}</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.statusText}>
                      {getOnlineStatusText(friend)}
                    </Text>
                    
                    <Text style={styles.friendshipText}>
                      Friends for {getFriendshipDuration(friend)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.friendActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.inviteButton]}
                    onPress={() => handleInviteToGame(friend)}
                  >
                    <Ionicons name="game-controller" size={16} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Invite</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.messageButton]}
                    onPress={() => Alert.alert('Message', `Message ${friend.friend.firstName}?`)}
                  >
                    <Ionicons name="chatbubble" size={16} color={theme.colors.info} />
                    <Text style={styles.actionButtonText}>Message</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveFriend(friend)}
                  >
                    <Ionicons name="person-remove" size={16} color={theme.colors.error} />
                    <Text style={styles.actionButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add Friends Button */}
        {!isLoading && friends.length > 0 && (
          <View style={styles.addFriendsSection}>
            <TouchableOpacity 
              style={[styles.addFriendsButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('AddFriends' as any)}
            >
              <Ionicons name="person-add" size={24} color="white" />
              <Text style={styles.addFriendsButtonText}>Add More Friends</Text>
            </TouchableOpacity>
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
  friendsSection: {
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
    marginBottom: theme.spacing.lg,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    gap: 8,
  },
  addFriendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  friendCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  friendInfo: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  friendMeta: {
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
  statusText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  friendshipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  friendActions: {
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
  inviteButton: {
    borderColor: theme.colors.primary,
  },
  messageButton: {
    borderColor: theme.colors.info,
  },
  removeButton: {
    borderColor: theme.colors.error,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  addFriendsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    gap: 8,
  },
  addFriendsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendsScreen;
