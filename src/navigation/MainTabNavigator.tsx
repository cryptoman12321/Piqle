import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, GamesStackParamList, TournamentsStackParamList, FriendsStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import GamesScreen from '../screens/GamesScreen';
import GameDetailsScreen from '../screens/GameDetailsScreen';
import TournamentsScreen from '../screens/TournamentsScreen';
import TournamentDetailsScreen from '../screens/TournamentDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FriendsScreen from '../screens/FriendsScreen';
import AddFriendsScreen from '../screens/AddFriendsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const GamesStack = createNativeStackNavigator<GamesStackParamList>();
const TournamentsStack = createNativeStackNavigator<TournamentsStackParamList>();
const FriendsStack = createNativeStackNavigator<FriendsStackParamList>();

// Games Stack Navigator
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
    </GamesStack.Navigator>
  );
};

// Tournaments Stack Navigator
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
    </TournamentsStack.Navigator>
  );
};

// Friends Stack Navigator
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

const MainTabNavigator: React.FC = () => {
  const { theme } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Map':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Games':
              iconName = focused ? 'game-controller' : 'game-controller-outline';
              break;
            case 'Tournaments':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Friends':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Achievements':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        headerShown: false, // Hide headers since stack navigators handle them
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ title: 'Map' }}
      />
      <Tab.Screen 
        name="Games" 
        component={GamesStackNavigator}
        options={{ title: 'Games' }}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsStackNavigator}
        options={{ title: 'Tournaments' }}
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsStackNavigator}
        options={{ title: 'Friends' }}
      />
      <Tab.Screen 
        name="Achievements" 
        component={AchievementsScreen}
        options={{ title: 'Achievements' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
