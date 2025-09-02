import { create } from 'zustand';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  content: string;
  timestamp: Date;
  type: 'TEXT' | 'IMAGE' | 'GAME_INVITE' | 'TOURNAMENT_INVITE' | 'LOCATION';
  metadata?: {
    imageUrl?: string;
    gameId?: string;
    tournamentId?: string;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
  status: 'SENT' | 'DELIVERED' | 'READ';
  isEdited: boolean;
  editedAt?: Date;
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP' | 'GAME' | 'TOURNAMENT';
  participants: string[]; // User IDs
  participantNames: string[]; // User names for display
  participantPhotos: (string | undefined)[]; // User photos
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    gameId?: string;
    tournamentId?: string;
    groupName?: string;
    groupPhoto?: string;
  };
}

export interface ChatState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  isTyping: { [conversationId: string]: string[] }; // User IDs who are typing
}

interface ChatActions {
  // Conversation management
  createConversation: (conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt' | 'unreadCount'>) => string;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  deleteConversation: (conversationId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  
  // Message management
  sendMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp' | 'status' | 'isEdited'>) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  markMessageAsRead: (messageId: string) => void;
  
  // Real-time features
  setTypingStatus: (conversationId: string, userId: string, isTyping: boolean) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  
  // Data loading
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  searchMessages: (query: string) => Message[];
  
  // Utility
  getConversationById: (id: string) => Conversation | undefined;
  getMessagesByConversationId: (conversationId: string) => Message[];
  getUnreadCount: () => number;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  isLoading: false,
  error: null,
  isTyping: {},

  createConversation: (conversationData) => {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newConversation: Conversation = {
      ...conversationData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      unreadCount: 0,
    };

    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      messages: { ...state.messages, [id]: [] },
    }));

    return id;
  },

  updateConversation: (conversationId, updates) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, ...updates, updatedAt: new Date() }
          : conv
      ),
    }));
  },

  deleteConversation: (conversationId) => {
    set((state) => {
      const { [conversationId]: removed, ...remainingMessages } = state.messages;
      return {
        conversations: state.conversations.filter((conv) => conv.id !== conversationId),
        messages: remainingMessages,
        activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId,
      };
    });
  },

  markConversationAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    }));
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId });
  },

  sendMessage: (conversationId, messageData) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: Message = {
      ...messageData,
      id,
      timestamp: new Date(),
      status: 'SENT',
      isEdited: false,
    };

    set((state) => {
      const conversation = state.conversations.find((conv) => conv.id === conversationId);
      if (!conversation) return state;

      const updatedConversation = {
        ...conversation,
        lastMessage: newMessage,
        updatedAt: new Date(),
        unreadCount: conversation.unreadCount + 1,
      };

      return {
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? updatedConversation : conv
        ),
        messages: {
          ...state.messages,
          [conversationId]: [...(state.messages[conversationId] || []), newMessage],
        },
      };
    });
  },

  editMessage: (messageId, newContent) => {
    set((state) => ({
      messages: Object.keys(state.messages).reduce((acc, conversationId) => {
        acc[conversationId] = state.messages[conversationId].map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true, editedAt: new Date() }
            : msg
        );
        return acc;
      }, {} as { [key: string]: Message[] }),
    }));
  },

  deleteMessage: (messageId) => {
    set((state) => ({
      messages: Object.keys(state.messages).reduce((acc, conversationId) => {
        acc[conversationId] = state.messages[conversationId].filter((msg) => msg.id !== messageId);
        return acc;
      }, {} as { [key: string]: Message[] }),
    }));
  },

  markMessageAsRead: (messageId) => {
    set((state) => ({
      messages: Object.keys(state.messages).reduce((acc, conversationId) => {
        acc[conversationId] = state.messages[conversationId].map((msg) =>
          msg.id === messageId ? { ...msg, status: 'READ' } : msg
        );
        return acc;
      }, {} as { [key: string]: Message[] }),
    }));
  },

  setTypingStatus: (conversationId, userId, isTyping) => {
    set((state) => ({
      isTyping: {
        ...state.isTyping,
        [conversationId]: isTyping
          ? [...(state.isTyping[conversationId] || []).filter((id) => id !== userId), userId]
          : (state.isTyping[conversationId] || []).filter((id) => id !== userId),
      },
    }));
  },

  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: Object.keys(state.messages).reduce((acc, conversationId) => {
        acc[conversationId] = state.messages[conversationId].map((msg) =>
          msg.id === messageId ? { ...msg, status } : msg
        );
        return acc;
      }, {} as { [key: string]: Message[] }),
    }));
  },

  loadConversations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock conversations data - in real app this would come from API
      const mockConversations: Conversation[] = [
        {
          id: 'conv_1',
          type: 'DIRECT',
          participants: ['user1', 'user2'],
          participantNames: ['John Smith', 'Sarah Johnson'],
          participantPhotos: ['https://example.com/john.jpg', 'https://example.com/sarah.jpg'],
          lastMessage: {
            id: 'msg_1',
            conversationId: 'conv_1',
            senderId: 'user2',
            senderName: 'Sarah Johnson',
            senderPhoto: 'https://example.com/sarah.jpg',
            content: 'Hey! Are you up for a game tomorrow?',
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            type: 'TEXT',
            status: 'READ',
            isEdited: false,
          },
          unreadCount: 0,
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          id: 'conv_2',
          type: 'GROUP',
          participants: ['user1', 'user3', 'user4', 'user5'],
          participantNames: ['John Smith', 'Andrew Smith', 'Lisa Brown', 'David Lee'],
          participantPhotos: ['https://example.com/john.jpg', 'https://example.com/mike.jpg', 'https://example.com/lisa.jpg', 'https://example.com/david.jpg'],
          lastMessage: {
            id: 'msg_2',
            conversationId: 'conv_2',
            senderId: 'user3',
            senderName: 'Mike Wilson',
            senderPhoto: 'https://example.com/mike.jpg',
            content: 'Great game today everyone!',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            type: 'TEXT',
            status: 'READ',
            isEdited: false,
          },
          unreadCount: 2,
          isActive: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          metadata: {
            groupName: 'Weekend Warriors',
            groupPhoto: 'https://example.com/group.jpg',
          },
        },
        {
          id: 'conv_3',
          type: 'GAME',
          participants: ['user1', 'user6', 'user7'],
          participantNames: ['John Smith', 'Alex Chen', 'Emma Davis'],
          participantPhotos: ['https://example.com/john.jpg', 'https://example.com/alex.jpg', 'https://example.com/emma.jpg'],
          lastMessage: {
            id: 'msg_3',
            conversationId: 'conv_3',
            senderId: 'user6',
            senderName: 'Alex Chen',
            senderPhoto: 'https://example.com/alex.jpg',
            content: 'Court 3 is available at 3 PM',
            timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            type: 'LOCATION',
            status: 'DELIVERED',
            isEdited: false,
            metadata: {
              location: {
                latitude: 37.7749,
                longitude: -122.4194,
                address: 'Central Park Courts, Court 3',
              },
            },
          },
          unreadCount: 1,
          isActive: true,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          updatedAt: new Date(Date.now() - 15 * 60 * 1000),
          metadata: {
            gameId: 'game_123',
          },
        },
      ];
      
      // Initialize messages for each conversation
      const mockMessages: { [key: string]: Message[] } = {};
      mockConversations.forEach((conv) => {
        mockMessages[conv.id] = [
          {
            id: 'msg_init_1',
            conversationId: conv.id,
            senderId: conv.participants[0],
            senderName: conv.participantNames[0],
            senderPhoto: conv.participantPhotos[0],
            content: 'Conversation started',
            timestamp: conv.createdAt,
            type: 'TEXT',
            status: 'READ',
            isEdited: false,
          },
          ...(conv.lastMessage ? [conv.lastMessage] : []),
        ];
      });
      
      set({ 
        conversations: mockConversations, 
        messages: mockMessages,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load conversations', 
        isLoading: false 
      });
    }
  },

  loadMessages: async (conversationId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would load messages from API
      // For now, we'll use the messages already in state
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load messages', 
        isLoading: false 
      });
    }
  },

  searchMessages: (query) => {
    const { messages } = get();
    const results: Message[] = [];
    
    Object.values(messages).forEach((conversationMessages) => {
      conversationMessages.forEach((message) => {
        if (message.content.toLowerCase().includes(query.toLowerCase())) {
          results.push(message);
        }
      });
    });
    
    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  getConversationById: (id) => {
    const { conversations } = get();
    return conversations.find((conv) => conv.id === id);
  },

  getMessagesByConversationId: (conversationId) => {
    const { messages } = get();
    return messages[conversationId] || [];
  },

  getUnreadCount: () => {
    const { conversations } = get();
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
