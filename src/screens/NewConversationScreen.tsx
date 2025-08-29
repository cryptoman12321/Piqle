import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useFriendsStore } from '../stores/friendsStore';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';

const NewConversationScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { friends } = useFriendsStore();
  const { createConversation } = useChatStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [conversationName, setConversationName] = useState('');
  const [conversationType, setConversationType] = useState<'DIRECT' | 'GROUP'>('DIRECT');

  const styles = createStyles(theme);

  const filteredFriends = friends.filter(friend => 
    `${friend.friend.firstName} ${friend.friend.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactToggle = (friendId: string) => {
    if (conversationType === 'DIRECT') {
      // For direct chats, only allow one contact
      setSelectedContacts([friendId]);
    } else {
      // For group chats, allow multiple contacts
      setSelectedContacts(prev => 
        prev.includes(friendId) 
          ? prev.filter(id => id !== friendId)
          : [...prev, friendId]
      );
    }
  };

  const handleCreateConversation = () => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Contacts Selected', 'Please select at least one contact to start a conversation.');
      return;
    }

    if (conversationType === 'GROUP' && !conversationName.trim()) {
      Alert.alert('Group Name Required', 'Please enter a name for the group conversation.');
      return;
    }

    try {
      // Get selected friends' information
      const selectedFriends = friends.filter(friend => selectedContacts.includes(friend.friendId));
      
      // Create conversation data
      const conversationData = {
        type: conversationType,
        participants: [user!.id, ...selectedContacts],
        participantNames: [
          `${user!.firstName} ${user!.lastName}`,
          ...selectedFriends.map(friend => `${friend.friend.firstName} ${friend.friend.lastName}`)
        ],
        participantPhotos: [
          user!.photo,
          ...selectedFriends.map(friend => friend.friend.photo)
        ],
        isActive: true,
        metadata: conversationType === 'GROUP' ? {
          groupName: conversationName.trim(),
          groupPhoto: undefined, // Could add group photo selection later
        } : undefined,
      };

      // Create the conversation
      const conversationId = createConversation(conversationData);
      
      // Navigate to the new chat room
      navigation.replace('ChatRoom', { conversationId });
      
      // Show success message
      Alert.alert(
        'Conversation Created!',
        `${conversationType === 'GROUP' ? 'Group' : 'Direct'} conversation started successfully.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create conversation. Please try again.');
    }
  };

  const getContactDisplayName = (friend: any) => {
    return `${friend.friend.firstName} ${friend.friend.lastName}`;
  };

  const renderContactItem = (friend: any) => {
    const isSelected = selectedContacts.includes(friend.friendId);
    
    return (
      <TouchableOpacity
        key={friend.friendId}
        style={[
          styles.contactItem,
          isSelected && styles.contactItemSelected
        ]}
        onPress={() => handleContactToggle(friend.friendId)}
        activeOpacity={0.7}
      >
        {/* Contact Photo */}
        <View style={styles.contactPhoto}>
          {friend.friend.photo ? (
            <Image source={{ uri: friend.friend.photo }} style={styles.contactImage} />
          ) : (
            <View style={[styles.contactImagePlaceholder, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name="person" size={24} color={theme.colors.primary} />
            </View>
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{getContactDisplayName(friend)}</Text>
          <Text style={styles.contactStatus}>
            {friend.friend.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        {/* Selection Indicator */}
        <View style={styles.selectionIndicator}>
          {isSelected && (
            <View style={styles.selectedCircle}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>New Conversation</Text>
              
              <View style={styles.headerSpacer} />
            </View>
          </LinearGradient>
        </View>

        {/* Conversation Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              conversationType === 'DIRECT' && styles.typeButtonActive
            ]}
            onPress={() => {
              setConversationType('DIRECT');
              setSelectedContacts([]);
              setConversationName('');
            }}
          >
            <Ionicons 
              name="person" 
              size={20} 
              color={conversationType === 'DIRECT' ? 'white' : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.typeButtonText,
              conversationType === 'DIRECT' && styles.typeButtonTextActive
            ]}>
              Direct Chat
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              conversationType === 'GROUP' && styles.typeButtonActive
            ]}
            onPress={() => {
              setConversationType('GROUP');
              setSelectedContacts([]);
              setConversationName('');
            }}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={conversationType === 'GROUP' ? 'white' : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.typeButtonText,
              conversationType === 'GROUP' && styles.typeButtonTextActive
            ]}>
              Group Chat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Group Name Input (for group chats) */}
        {conversationType === 'GROUP' && (
          <View style={styles.groupNameSection}>
            <Text style={styles.groupNameLabel}>Group Name</Text>
            <TextInput
              style={styles.groupNameInput}
              value={conversationName}
              onChangeText={setConversationName}
              placeholder="Enter group name..."
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={50}
            />
          </View>
        )}

        {/* Search Bar */}
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
        </View>

        {/* Selected Contacts Summary */}
        {selectedContacts.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedTitle}>
              {conversationType === 'DIRECT' ? 'Selected Contact' : `Selected Contacts (${selectedContacts.length})`}
            </Text>
            <View style={styles.selectedContacts}>
              {friends
                .filter(friend => selectedContacts.includes(friend.friendId))
                .map(friend => (
                  <View key={friend.friendId} style={styles.selectedContact}>
                    <Text style={styles.selectedContactName}>
                      {getContactDisplayName(friend)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleContactToggle(friend.friendId)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Friends List */}
        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>
            Friends ({filteredFriends.length})
          </Text>
          
          {filteredFriends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No friends found' : 'No friends yet'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'Try adjusting your search.'
                  : 'Add some friends to start conversations!'
                }
              </Text>
            </View>
          ) : (
            filteredFriends.map(renderContactItem)
          )}
        </View>

        {/* Create Conversation Button */}
        {selectedContacts.length > 0 && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateConversation}
            disabled={conversationType === 'GROUP' && !conversationName.trim()}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.createButtonGradient}
            >
              <Ionicons name="chatbubble" size={24} color="white" />
              <Text style={styles.createButtonText}>
                {conversationType === 'DIRECT' ? 'Start Chat' : 'Create Group'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    flex: 1,
  },
  headerSpacer: {
    width: 48, // Same width as back button for centering
  },
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  groupNameSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  groupNameLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  groupNameInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
  selectedSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  selectedContacts: {
    gap: theme.spacing.sm,
  },
  selectedContact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary + '20',
    padding: theme.spacing.sm,
    borderRadius: 12,
  },
  selectedContactName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  removeButton: {
    padding: 4,
  },
  contactsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  contactPhoto: {
    marginRight: theme.spacing.md,
  },
  contactImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contactImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  contactStatus: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: 16,
    gap: theme.spacing.sm,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});

export default NewConversationScreen;
