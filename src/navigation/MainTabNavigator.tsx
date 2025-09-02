import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import HomeScreen from '../screens/HomeScreen';
import SimpleMapScreen from '../screens/SimpleMapScreen';
import DataInitializer from '../components/DataInitializer';

import ChatStackNavigator from './ChatStackNavigator';

import ProfileScreen from '../screens/ProfileScreen';
import AICoachScreen from '../screens/AICoachScreen';
import CalendarScreen from '../screens/CalendarScreen';


const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  const { getCurrentTheme } = useThemeStore();
  
  const theme = getCurrentTheme();

  return (
    <>
      <DataInitializer />
      <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'AICoach':
              iconName = focused ? 'bulb' : 'bulb-outline';
              break;
            case 'Map':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
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
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'android' ? 32 : 8,
          paddingTop: 8,
          height: Platform.OS === 'android' ? 100 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
        <Tab.Screen name="Map" component={SimpleMapScreen} options={{ title: 'Map' }} />
        <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
        <Tab.Screen name="AICoach" component={AICoachScreen} options={{ title: 'AI Coach' }} />
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="Chat" component={ChatStackNavigator} options={{ title: 'Chat' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </>
  );
};

export default MainTabNavigator;
