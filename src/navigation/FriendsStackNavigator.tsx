import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeStore } from '../stores/themeStore';
import { FriendsStackParamList } from '../types';
import FriendsScreen from '../screens/FriendsScreen';
import AddFriendsScreen from '../screens/AddFriendsScreen';

const FriendsStack = createNativeStackNavigator<FriendsStackParamList>();

const FriendsStackNavigator: React.FC = () => {
  const { theme } = useThemeStore();
  
  return (
    <FriendsStack.Navigator
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
      <FriendsStack.Screen 
        name="FriendsList" 
        component={FriendsScreen}
        options={{ title: 'Friends' }}
      />
      <FriendsStack.Screen 
        name="AddFriends" 
        component={AddFriendsScreen}
        options={{ title: 'Add Friends' }}
      />
    </FriendsStack.Navigator>
  );
};

export default FriendsStackNavigator;


