import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeStore } from '../stores/themeStore';
import { ClubsStackParamList } from '../types';
import ClubsScreen from '../screens/ClubsScreen';
import ClubDetailsScreen from '../screens/ClubDetailsScreen';
import CreateClubScreen from '../screens/CreateClubScreen';

const ClubsStack = createNativeStackNavigator<ClubsStackParamList>();

const ClubsStackNavigator: React.FC = () => {
  const { theme } = useThemeStore();
  
  return (
    <ClubsStack.Navigator
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
      <ClubsStack.Screen 
        name="ClubsList" 
        component={ClubsScreen}
        options={{ title: 'Clubs' }}
      />
      <ClubsStack.Screen 
        name="ClubDetails" 
        component={ClubDetailsScreen}
        options={{ title: 'Club Details' }}
      />
      <ClubsStack.Screen 
        name="CreateClub" 
        component={CreateClubScreen}
        options={{ title: 'Create Club' }}
      />
    </ClubsStack.Navigator>
  );
};

export default ClubsStackNavigator;
