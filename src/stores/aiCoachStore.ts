import { create } from 'zustand';

export interface AIMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'tip' | 'drill' | 'analysis';
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  category: 'general' | 'technique' | 'strategy' | 'fitness' | 'mental';
}

interface AICoachState {
  conversations: AIConversation[];
  currentConversation: AIConversation | null;
  isLoading: boolean;
  error: string | null;
}

interface AICoachActions {
  // Conversations
  createConversation: (category: AIConversation['category']) => void;
  addMessage: (conversationId: string, message: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  updateConversation: (conversationId: string, updates: Partial<AIConversation>) => void;
  deleteConversation: (conversationId: string) => void;
  setCurrentConversation: (conversation: AIConversation | null) => void;
  
  // AI Responses
  generateAIResponse: (conversationId: string, userMessage: string) => Promise<void>;
  
  // State Management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Sample Data
  loadSampleData: () => void;
}

export const useAICoachStore = create<AICoachState & AICoachActions>((set, get) => ({
  // Initial State
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,

  // Actions
  createConversation: (category) => {
    const newConversation: AIConversation = {
      id: Date.now().toString(),
      title: `New ${category} conversation`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      category,
    };
    
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      currentConversation: newConversation,
    }));
  },

  addMessage: (conversationId, messageData) => {
    const newMessage: AIMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    set((state) => {
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              updatedAt: new Date(),
            }
          : conv
      );

      const updatedCurrentConversation = state.currentConversation?.id === conversationId
        ? {
            ...state.currentConversation,
            messages: [...state.currentConversation.messages, newMessage],
            updatedAt: new Date(),
          }
        : state.currentConversation;

      return {
        conversations: updatedConversations,
        currentConversation: updatedCurrentConversation,
      };
    });
  },

  updateConversation: (conversationId, updates) => {
    set((state) => {
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, ...updates, updatedAt: new Date() }
          : conv
      );

      const updatedCurrentConversation = state.currentConversation?.id === conversationId
        ? { ...state.currentConversation, ...updates, updatedAt: new Date() }
        : state.currentConversation;

      return {
        conversations: updatedConversations,
        currentConversation: updatedCurrentConversation,
      };
    });
  },

  deleteConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== conversationId),
      currentConversation: state.currentConversation?.id === conversationId ? null : state.currentConversation,
    }));
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },

  generateAIResponse: async (conversationId, userMessage) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate AI response delay
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Generate sample AI responses based on message content
      const aiResponse = generateSampleAIResponse(userMessage);
      
      get().addMessage(conversationId, {
        text: aiResponse,
        isUser: false,
        type: 'text',
      });

      // Update conversation title if it's the first AI response
      const conversation = get().conversations.find((conv) => conv.id === conversationId);
      if (conversation && conversation.messages.length === 2) { // User message + AI response
        const title = generateConversationTitle(userMessage);
        get().updateConversation(conversationId, { title });
      }
    } catch (error) {
      set({ error: 'Failed to generate AI response' });
    } finally {
      set({ isLoading: false });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  loadSampleData: () => {
    const sampleConversations: AIConversation[] = [
      {
        id: '1',
        title: 'Backhand technique improvement',
        category: 'technique',
        createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000), // 1 day ago
        messages: [
          {
            id: '1-1',
            text: 'I\'m struggling with my backhand. Any tips?',
            isUser: true,
            timestamp: new Date(Date.now() - 86400000 * 2),
            type: 'text',
          },
          {
            id: '1-2',
            text: 'Great question! For backhand improvement, focus on your grip and wrist position. Try keeping your wrist firm but not rigid, and practice the motion slowly before increasing speed.',
            isUser: false,
            timestamp: new Date(Date.now() - 86400000 * 2 + 60000),
            type: 'tip',
          },
        ],
      },
      {
        id: '2',
        title: 'Tournament strategy discussion',
        category: 'strategy',
        createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
        updatedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        messages: [
          {
            id: '2-1',
            text: 'What\'s the best strategy for playing against aggressive players?',
            isUser: true,
            timestamp: new Date(Date.now() - 86400000 * 5),
            type: 'text',
          },
          {
            id: '2-2',
            text: 'Against aggressive players, focus on consistency and placement over power. Use their pace against them with well-placed returns and force them to move around the court.',
            isUser: false,
            timestamp: new Date(Date.now() - 86400000 * 5 + 60000),
            type: 'tip',
          },
        ],
      },
      {
        id: '3',
        title: 'Fitness routine for pickleball',
        category: 'fitness',
        createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
        updatedAt: new Date(Date.now() - 86400000 * 6), // 6 days ago
        messages: [
          {
            id: '3-1',
            text: 'What exercises should I do to improve my pickleball game?',
            isUser: true,
            timestamp: new Date(Date.now() - 86400000 * 7),
            type: 'text',
          },
          {
            id: '3-2',
            text: 'Focus on leg strength, core stability, and agility. Squats, lunges, planks, and ladder drills are excellent. Also work on your cardio endurance for longer matches.',
            isUser: false,
            timestamp: new Date(Date.now() - 86400000 * 7 + 60000),
            type: 'tip',
          },
        ],
      },
    ];

    set({ conversations: sampleConversations });
  },
}));

// Helper functions
function generateSampleAIResponse(userMessage: string): string {
  const responses = [
    "That's a great question! Let me help you with that.",
    "I understand your concern. Here's what I recommend:",
    "Excellent point! Here are some strategies to consider:",
    "I'm glad you asked about that. Let me break it down:",
    "That's a common challenge. Here's how to approach it:",
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Add some context-specific advice
  if (userMessage.toLowerCase().includes('backhand')) {
    return `${randomResponse} For backhand improvement, focus on your grip position and practice the motion slowly. Try keeping your wrist firm but relaxed, and make sure your paddle face is square to the ball.`;
  } else if (userMessage.toLowerCase().includes('serve')) {
    return `${randomResponse} Serving effectively requires consistency and placement. Practice hitting specific targets on the court and vary your serve speed to keep opponents guessing.`;
  } else if (userMessage.toLowerCase().includes('strategy')) {
    return `${randomResponse} Strategic play involves reading your opponent's weaknesses and adapting your game plan. Focus on consistency first, then add variety to your shots.`;
  } else {
    return `${randomResponse} In pickleball, the key is to stay patient and wait for the right opportunity to attack. Focus on good positioning and communication with your partner.`;
  }
}

function generateConversationTitle(userMessage: string): string {
  if (userMessage.toLowerCase().includes('backhand')) {
    return 'Backhand technique improvement';
  } else if (userMessage.toLowerCase().includes('serve')) {
    return 'Serving strategy discussion';
  } else if (userMessage.toLowerCase().includes('strategy')) {
    return 'Game strategy tips';
  } else if (userMessage.toLowerCase().includes('fitness')) {
    return 'Fitness and training advice';
  } else if (userMessage.toLowerCase().includes('mental')) {
    return 'Mental game improvement';
  } else {
    return 'Pickleball coaching session';
  }
}

export default useAICoachStore;
