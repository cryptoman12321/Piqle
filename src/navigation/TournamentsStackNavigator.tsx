import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeStore } from '../stores/themeStore';
import { TournamentsStackParamList } from '../types';
import TournamentsScreen from '../screens/TournamentsScreen';
import TournamentDetailsScreen from '../screens/TournamentDetailsScreen';
import CreateTournamentScreen from '../screens/CreateTournamentScreen';
import SinglesRoundRobinScreen from '../screens/SinglesRoundRobinScreen';

const TournamentsStack = createNativeStackNavigator<TournamentsStackParamList>();

const TournamentsStackNavigator: React.FC = () => {
  const { theme } = useThemeStore();
  
  return (
    <TournamentsStack.Navigator
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
      <TournamentsStack.Screen 
        name="TournamentsList" 
        component={TournamentsScreen}
        options={{ title: 'Tournaments' }}
      />
      <TournamentsStack.Screen 
        name="TournamentDetails" 
        component={TournamentDetailsScreen}
        options={{ title: 'Tournament Details' }}
      />
      <TournamentsStack.Screen 
        name="CreateTournament" 
        component={CreateTournamentScreen}
        options={{ title: 'Create Tournament' }}
      />
      <TournamentsStack.Screen 
        name="SinglesRoundRobin" 
        component={SinglesRoundRobinScreen}
        options={{ title: 'Round Robin Tournament' }}
      />
    </TournamentsStack.Navigator>
  );
};

export default TournamentsStackNavigator;


