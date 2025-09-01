import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useChatStore, Conversation } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';

const ChatListScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { 
    conversations, 
    isLoading, 
    loadConversations,
    markConversationAsRead,
    deleteConversation,
    getUnreadCount 
  } = useChatStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'DIRECT' | 'GROUP' | 'GAME' | 'TOURNAMENT'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const styles = createStyles(theme);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation: Conversation) => {
    // Mark as read when opening
    if (conversation.unreadCount > 0) {
      markConversationAsRead(conversation.id);
    }
    // Navigate to chat room
    navigation.navigate('ChatRoom', { conversationId: conversation.id });
  };

  const handleNewConversation = () => {
    navigation.navigate('NewConversation');
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete this ${conversation.type.toLowerCase()} conversation? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteConversation(conversation.id)
        },
      ]
    );
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'DIRECT': return 'person';
      case 'GROUP': return 'people';
      case 'GAME': return 'game-controller';
      case 'TOURNAMENT': return 'trophy';
      default: return 'chatbubble';
    }
  };

  const getConversationTypeColor = (type: string) => {
    switch (type) {
      case 'DIRECT': return theme.colors.primary;
      case 'GROUP': return theme.colors.info;
      case 'GAME': return theme.colors.success;
      case 'TOURNAMENT': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const getFilteredConversations = () => {
    let filtered = conversations;
    
    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(conv => conv.type === selectedFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(conv => 
        conv.participantNames.some(name => 
          name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (conv.metadata?.groupName && 
         conv.metadata.groupName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (conv.lastMessage && 
         conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered.sort((a, b) => {
      // Sort by unread count first, then by last message time
      if (a.unreadCount !== b.unreadCount) {
        return b.unreadCount - a.unreadCount;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes === 0 ? 'now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === 'GROUP' && conversation.metadata?.groupName) {
      return conversation.metadata.groupName;
    }
    
    if (conversation.type === 'DIRECT') {
      // For direct chats, show the other person's name
      const otherParticipantIndex = conversation.participants.findIndex(id => id !== user?.id);
      return conversation.participantNames[otherParticipantIndex] || 'Unknown User';
    }
    
    // For game/tournament chats, show participant names
    return conversation.participantNames.slice(0, 3).join(', ') + 
           (conversation.participantNames.length > 3 ? '...' : '');
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.type === 'GROUP' && conversation.metadata?.groupName) {
      return `${conversation.participantNames.length} members`;
    }
    
    if (conversation.type === 'GAME') {
      return 'Game Chat';
    }
    
    if (conversation.type === 'TOURNAMENT') {
      return 'Tournament Chat';
    }
    
    return 'Direct Chat';
  };

  const filteredConversations = getFilteredConversations();
  const totalUnreadCount = getUnreadCount();

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>
              {conversations.length} conversations • {totalUnreadCount} unread
            </Text>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
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

        {/* Filter Chips */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === 'all' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === 'all' && { color: 'white' }
              ]}>
                All ({conversations.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === 'DIRECT' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedFilter('DIRECT')}
            >
              <Ionicons 
                name="person" 
                size={16} 
                color={selectedFilter === 'DIRECT' ? 'white' : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.filterChipText,
                selectedFilter === 'DIRECT' && { color: 'white' }
              ]}>
                Direct ({conversations.filter(c => c.type === 'DIRECT').length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === 'GROUP' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedFilter('GROUP')}
            >
              <Ionicons 
                name="people" 
                size={16} 
                color={selectedFilter === 'GROUP' ? 'white' : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.filterChipText,
                selectedFilter === 'GROUP' && { color: 'white' }
              ]}>
                Groups ({conversations.filter(c => c.type === 'GROUP').length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === 'GAME' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedFilter('GAME')}
            >
              <Ionicons 
                name="game-controller" 
                size={16} 
                color={selectedFilter === 'GAME' ? 'white' : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.filterChipText,
                selectedFilter === 'GAME' && { color: 'white' }
              ]}>
                Games ({conversations.filter(c => c.type === 'GAME').length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === 'TOURNAMENT' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedFilter('TOURNAMENT')}
            >
              <Ionicons 
                name="trophy" 
                size={16} 
                color={selectedFilter === 'TOURNAMENT' ? 'white' : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.filterChipText,
                selectedFilter === 'TOURNAMENT' && { color: 'white' }
              ]}>
                Tournaments ({conversations.filter(c => c.type === 'TOURNAMENT').length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Conversations List */}
        <View style={styles.conversationsSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading conversations...
              </Text>
            </View>
          ) : filteredConversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {searchQuery 
                  ? 'Try adjusting your search or filters.'
                  : 'Start chatting with friends or join game conversations!'
                }
              </Text>
            </View>
          ) : (
            filteredConversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                style={styles.conversationCard}
                onPress={() => handleConversationPress(conversation)}
                onLongPress={() => handleDeleteConversation(conversation)}
                activeOpacity={0.7}
              >
                {/* Conversation Icon */}
                <View style={styles.conversationIcon}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: getConversationTypeColor(conversation.type) + '20' }
                  ]}>
                    <Ionicons 
                      name={getConversationIcon(conversation.type) as any} 
                      size={24} 
                      color={getConversationTypeColor(conversation.type)} 
                    />
                  </View>
                  
                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Conversation Info */}
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <Text style={[
                      styles.conversationTitle,
                      conversation.unreadCount > 0 && { fontWeight: '600' }
                    ]}>
                      {getConversationTitle(conversation)}
                    </Text>
                    <Text style={styles.timestamp}>
                      {conversation.lastMessage 
                        ? formatTimestamp(conversation.lastMessage.timestamp)
                        : formatTimestamp(conversation.updatedAt)
                      }
                    </Text>
                  </View>
                  
                  <Text style={styles.conversationSubtitle}>
                    {getConversationSubtitle(conversation)}
                  </Text>
                  
                  {conversation.lastMessage && (
                    <Text style={[
                      styles.lastMessage,
                      conversation.unreadCount > 0 && { fontWeight: '500' }
                    ]} numberOfLines={1}>
                      {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
                    </Text>
                  )}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteConversation(conversation)}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* New Chat Button */}
        <TouchableOpacity style={styles.newChatButton} onPress={handleNewConversation}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.newChatGradient}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.newChatText}>New Conversation</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  conversationsSection: {
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
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  conversationIcon: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  conversationInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  conversationSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  newChatButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  newChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: 16,
    gap: theme.spacing.sm,
  },
  newChatText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ChatListScreen;
