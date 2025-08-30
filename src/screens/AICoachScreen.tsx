import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useAICoachStore, AIMessage, AIConversation } from '../stores/aiCoachStore';

const AICoachScreen: React.FC = () => {
  const { getCurrentTheme } = useThemeStore();
  const {
    currentConversation,
    conversations,
    isLoading,
    error,

    createConversation,
    setCurrentConversation,
    deleteConversation,
    clearError,
  } = useAICoachStore();
  
  const theme = getCurrentTheme();

  const [inputText, setInputText] = useState('');
  const [showConversations, setShowConversations] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const styles = createStyles(theme);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (currentConversation && currentConversation.messages && currentConversation.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentConversation?.messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText('');
    await sendMessage(message);
  };

  const handleNewConversation = () => {
    const title = `Chat ${conversations.length + 1}`;
    createConversation('general');
    setShowConversations(false);
  };

  const handleSelectConversation = (conversation: AIConversation) => {
    setCurrentConversation(conversation);
    setShowConversations(false);
  };

  const handleDeleteConversation = (conversationId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteConversation(conversationId) },
      ]
    );
  };

  const renderMessage = ({ item }: { item: AIMessage }) => {
    // Safety check for timestamp
    const safeTimestamp = item.timestamp instanceof Date ? item.timestamp : new Date();
    
    return (
      <View style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage
      ]}>
        <View style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.aiBubble
        ]}>
          <Text style={[
            styles.messageText,
            item.isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={styles.messageTime}>
            {safeTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {!item.isUser && (
          <View style={styles.messageType}>
            <Ionicons 
              name={getMessageTypeIcon(item.type)} 
              size={16} 
              color={theme.colors.primary} 
            />
            <Text style={styles.messageTypeText}>
              {getMessageTypeLabel(item.type)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const getMessageTypeIcon = (type: AIMessage['type']) => {
    switch (type) {
              case 'tip': return 'bulb';
        case 'drill': return 'calendar';
      case 'analysis': return 'analytics';
      default: return 'chatbubble';
    }
  };

  const getMessageTypeLabel = (type: AIMessage['type']) => {
    switch (type) {
              case 'tip': return 'Tip';
        case 'drill': return 'Drill';
      case 'analysis': return 'Analysis';
      default: return 'Message';
    }
  };

  const renderConversationItem = ({ item }: { item: AIConversation }) => {
    // Safety check for dates
    const safeUpdatedAt = item.updatedAt instanceof Date ? item.updatedAt : new Date();
    
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          currentConversation?.id === item.id && styles.activeConversationItem
        ]}
        onPress={() => handleSelectConversation(item)}
      >
        <View style={styles.conversationContent}>
          <Text style={styles.conversationTitle}>{item.title}</Text>
          <Text style={styles.conversationPreview}>
            {item.messages && item.messages.length > 0 
                              ? item.messages[item.messages.length - 1].text.substring(0, 50) + '...'
              : 'No messages yet'
            }
          </Text>
          <Text style={styles.conversationTime}>
            {safeUpdatedAt.toLocaleDateString()}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteConversation(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.conversationsButton}
              onPress={() => setShowConversations(!showConversations)}
            >
              <Ionicons name="list" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>AI Coach</Text>
              <Text style={styles.headerSubtitle}>Your Personal Pickleball Mentor</Text>
            </View>
            
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={handleNewConversation}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Conversations Sidebar */}
      {showConversations && (
        <View style={styles.conversationsSidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Conversations</Text>
            <TouchableOpacity onPress={() => setShowConversations(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={conversations || []}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            style={styles.conversationsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Chat Area */}
      <View style={styles.chatContainer}>
        {currentConversation ? (
          <>
            {/* Messages */}
            <FlatList
              ref={flatListRef}
              data={currentConversation.messages || []}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesContent}
            />

            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>AI Coach is thinking...</Text>
              </View>
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.inputContainer}
            >
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Ask your AI Coach anything..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !inputText.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={inputText.trim() ? 'white' : theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>Start a Conversation</Text>
            <Text style={styles.emptyStateText}>
              Begin chatting with your AI Coach to get personalized tips and training advice!
            </Text>
            <TouchableOpacity style={styles.startChatButton} onPress={handleNewConversation}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.startChatButtonGradient}
              >
                <Text style={styles.startChatButtonText}>Start Chatting</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerGradient: {
    padding: theme.spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversationsButton: {
    padding: theme.spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  newChatButton: {
    padding: theme.spacing.sm,
  },
  conversationsSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  conversationsList: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activeConversationItem: {
    backgroundColor: theme.colors.primary + '20',
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: theme.colors.text,
  },
  messageTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  messageType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTypeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  startChatButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startChatButtonGradient: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  startChatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AICoachScreen;
