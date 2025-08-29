import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeStore } from '../stores/themeStore';
import { ChatStackParamList } from '../types';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import NewConversationScreen from '../screens/NewConversationScreen';

const ChatStack = createNativeStackNavigator<ChatStackParamList>();

const ChatStackNavigator: React.FC = () => {
  const { theme } = useThemeStore();
  
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <ChatStack.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{ title: 'Chat' }}
      />
      <ChatStack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen}
        options={{ title: 'Chat' }}
      />
      <ChatStack.Screen 
        name="NewConversation" 
        component={NewConversationScreen}
        options={{ title: 'New Conversation' }}
      />
    </ChatStack.Navigator>
  );
};

export default ChatStackNavigator;


