import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { RootStackParamList } from '../types';

// Import screens
import AuthScreen from '../screens/AuthScreen';
import MainTabNavigator from './MainTabNavigator';
import CourtDetailsScreen from '../screens/CourtDetailsScreen';
import ClubDetailsScreen from '../screens/ClubDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateGameScreen from '../screens/CreateGameScreen';
import CreateTournamentScreen from '../screens/CreateTournamentScreen';
import CreateClubScreen from '../screens/CreateClubScreen';
import TournamentsListScreen from '../screens/TournamentsListScreen';
import ClubsListScreen from '../screens/ClubsListScreen';
import GamesScreen from '../screens/GamesScreen';
import GameDetailsScreen from '../screens/GameDetailsScreen';
import AICoachScreen from '../screens/AICoachScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TournamentDetailsScreen from '../screens/TournamentDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="CourtDetails" 
              component={CourtDetailsScreen}
              options={{ headerShown: true, title: 'Court Details' }}
            />
            <Stack.Screen 
              name="ClubDetails" 
              component={ClubDetailsScreen}
              options={{ headerShown: true, title: 'Club Details' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ headerShown: true, title: 'Profile' }}
            />
            <Stack.Screen 
              name="CreateGame" 
              component={CreateGameScreen}
              options={{ headerShown: true, title: 'Create Game' }}
            />
            <Stack.Screen 
              name="CreateTournament" 
              component={CreateTournamentScreen}
              options={{ headerShown: true, title: 'Create Tournament' }}
            />
            <Stack.Screen 
              name="CreateClub" 
              component={CreateClubScreen}
              options={{ headerShown: true, title: 'Create Club' }}
            />
            <Stack.Screen 
              name="TournamentsList" 
              component={TournamentsListScreen}
              options={{ headerShown: true, title: 'Tournaments' }}
            />
            <Stack.Screen 
              name="ClubsList" 
              component={ClubsListScreen}
              options={{ headerShown: true, title: 'Clubs' }}
            />
            <Stack.Screen 
              name="Games" 
              component={GamesScreen}
              options={{ headerShown: true, title: 'Find Games' }}
            />
            <Stack.Screen 
              name="GameDetails" 
              component={GameDetailsScreen}
              options={{ headerShown: true, title: 'Game Details' }}
            />
            <Stack.Screen 
              name="AICoach" 
              component={AICoachScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ headerShown: true, title: 'Settings' }}
            />
            <Stack.Screen 
              name="Calendar" 
              component={CalendarScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="TournamentDetails" 
              component={TournamentDetailsScreen}
              options={{ headerShown: true, title: 'Tournament Details' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
