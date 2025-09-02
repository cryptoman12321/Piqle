import React, { useEffect } from 'react';
import { useTournamentStore } from '../stores/tournamentStore';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';

const DataInitializer: React.FC = () => {
  const { loadTournaments } = useTournamentStore();
  const { getUpcomingGames } = useGameStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      const initializeData = async () => {
        try {
          // Load tournaments from AsyncStorage
          await loadTournaments();
          
          // Load games for calendar
          await getUpcomingGames();
        } catch (error) {
          console.error('Failed to initialize data:', error);
        }
      };

      initializeData();
    }
  }, [isAuthenticated, loadTournaments, getUpcomingGames]);

  // This component doesn't render anything
  return null;
};

export default DataInitializer;
