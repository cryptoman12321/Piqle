import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useChatStore, Message, Conversation } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation, useRoute } from '@react-navigation/native';

interface ChatRoomRouteParams {
  conversationId: string;
}

const ChatRoomScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { 
    getConversationById,
    getMessagesByConversationId,
    sendMessage,
    editMessage,
    deleteMessage,
    markMessageAsRead,
    setTypingStatus,
    isTyping
  } = useChatStore();
  
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { conversationId } = route.params as ChatRoomRouteParams;
  
  const [messageText, setMessageText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showOptions, setShowOptions] = useState<string | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const styles = createStyles(theme);

  const conversation = getConversationById(conversationId);
  const messages = getMessagesByConversationId(conversationId);
  const typingUsers = isTyping[conversationId] || [];

  useEffect(() => {
    if (conversation) {
      // Mark conversation as read when entering
      markMessageAsRead(conversationId);
      
      // Set typing status to false when leaving
      return () => {
        if (user?.id) {
          setTypingStatus(conversationId, user.id, false);
        }
      };
    }
  }, [conversationId, user?.id]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !user) return;

    const messageData = {
      conversationId,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderPhoto: user.photo,
      content: messageText.trim(),
      type: 'TEXT' as const,
    };

    sendMessage(conversationId, messageData);
    setMessageText('');
    
    // Stop typing indicator
    setTypingStatus(conversationId, user.id, false);
  };

  const handleEditMessage = () => {
    if (!editingText.trim() || !editingMessageId) return;

    editMessage(editingMessageId, editingText.trim());
    setIsEditing(false);
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteMessage(messageId);
            setShowOptions(null);
          }
        },
      ]
    );
  };

  const handleStartEdit = (message: Message) => {
    setIsEditing(true);
    setEditingMessageId(message.id);
    setEditingText(message.content);
    setShowOptions(null);
    inputRef.current?.focus();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleBackToChatList = () => {
    navigation.navigate('ChatList');
  };

  const handleTyping = (text: string) => {
    setMessageText(text);
    
    if (user?.id) {
      setTypingStatus(conversationId, user.id, text.length > 0);
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (message: Message) => message.senderId === user?.id;

  const renderMessage = (message: Message) => {
    const ownMessage = isOwnMessage(message);
    
    return (
      <View key={message.id} style={styles.messageContainer}>
        <View style={[
          styles.messageBubble,
          ownMessage ? styles.ownMessage : styles.otherMessage
        ]}>
          {/* Message Header */}
          <View style={styles.messageHeader}>
            {!ownMessage && (
              <Text style={styles.senderName}>{message.senderName}</Text>
            )}
            <Text style={styles.messageTime}>
              {formatMessageTime(message.timestamp)}
              {message.isEdited && ' (edited)'}
            </Text>
          </View>
          
          {/* Message Content */}
          <Text style={[
            styles.messageText,
            ownMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
          
          {/* Message Status */}
          {ownMessage && (
            <View style={styles.messageStatus}>
              <Ionicons 
                name={message.status === 'READ' ? 'checkmark-done' : 'checkmark'} 
                size={16} 
                color={message.status === 'READ' ? theme.colors.info : theme.colors.textSecondary} 
              />
            </View>
          )}
        </View>
        
        {/* Message Options */}
        <TouchableOpacity
          style={styles.messageOptions}
          onPress={() => setShowOptions(showOptions === message.id ? null : message.id)}
        >
          <Ionicons name="ellipsis-horizontal" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        
        {/* Options Menu */}
        {showOptions === message.id && (
          <View style={styles.optionsMenu}>
            {ownMessage && (
              <>
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleStartEdit(message)}
                >
                  <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.optionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleDeleteMessage(message.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                  <Text style={[styles.optionText, { color: theme.colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
            
            {!ownMessage && (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  // In a real app, this would show user profile
                  Alert.alert('User Profile', `View ${message.senderName}'s profile`);
                  setShowOptions(null);
                }}
              >
                <Ionicons name="person-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.optionText}>View Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (!conversation) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Conversation Not Found</Text>
          <Text style={styles.errorText}>The conversation you're looking for doesn't exist.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.headerGradient}
      >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToChatList}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>
                {conversation.type === 'GROUP' && conversation.metadata?.groupName
                  ? conversation.metadata.groupName
                  : conversation.participantNames.filter(name => name !== `${user?.firstName} ${user?.lastName}`).join(', ')
                }
              </Text>
              <Text style={styles.headerSubtitle}>
                {conversation.type === 'GROUP' 
                  ? `${conversation.participantNames.length} members`
                  : conversation.type === 'GAME' 
                    ? 'Game Chat'
                    : conversation.type === 'TOURNAMENT'
                      ? 'Tournament Chat'
                      : 'Direct Chat'
                }
              </Text>
            </View>
            
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="ellipsis-vertical" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>Start the conversation by sending a message!</Text>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>
                  {typingUsers.length === 1 ? 'Someone is typing...' : 'People are typing...'}
                </Text>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, { backgroundColor: theme.colors.textSecondary }]} />
                  <View style={[styles.typingDot, { backgroundColor: theme.colors.textSecondary }]} />
                  <View style={[styles.typingDot, { backgroundColor: theme.colors.textSecondary }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <Text style={styles.editLabel}>Editing message:</Text>
              <View style={styles.editInputRow}>
                <TextInput
                  ref={inputRef}
                  style={styles.editInput}
                  value={editingText}
                  onChangeText={setEditingText}
                  placeholder="Edit your message..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                />
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditMessage}
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.messageInput}
                value={messageText}
                onChangeText={handleTyping}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                maxLength={1000}
              />
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !messageText.trim() && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={messageText.trim() ? "white" : theme.colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: theme.spacing.xl, // Add top padding for status bar
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerAction: {
    padding: theme.spacing.sm,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
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
  messageContainer: {
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 20,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  messageTime: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: theme.colors.text,
  },
  messageStatus: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageOptions: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
  },
  optionsMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  typingIndicator: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  typingBubble: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  typingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  inputContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  editContainer: {
    marginBottom: theme.spacing.sm,
  },
  editLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  editInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  editInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 100,
  },
  editButton: {
    backgroundColor: theme.colors.success,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  messageInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.primary,
  },
});

export default ChatRoomScreen;
