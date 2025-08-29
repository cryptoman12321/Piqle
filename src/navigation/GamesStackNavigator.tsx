import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeStore } from '../stores/themeStore';
import { GamesStackParamList } from '../types';
import GamesScreen from '../screens/GamesScreen';
import GameDetailsScreen from '../screens/GameDetailsScreen';
import CreateGameScreen from '../screens/CreateGameScreen';

const GamesStack = createNativeStackNavigator<GamesStackParamList>();

const GamesStackNavigator: React.FC = () => {
  const { theme } = useThemeStore();
  
  return (
    <GamesStack.Navigator
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
      <GamesStack.Screen 
        name="GamesList" 
        component={GamesScreen}
        options={{ title: 'Games' }}
      />
      <GamesStack.Screen 
        name="GameDetails" 
        component={GameDetailsScreen}
        options={{ title: 'Game Details' }}
      />
      <GamesStack.Screen 
        name="CreateGame" 
        component={CreateGameScreen}
        options={{ title: 'Create Game' }}
      />
    </GamesStack.Navigator>
  );
};

export default GamesStackNavigator;


