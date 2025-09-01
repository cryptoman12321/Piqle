import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';

export const useDeepLinking = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Handle deep links when app is already running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep links when app is opened from a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {
    if (!url) return;

    const parsedUrl = Linking.parse(url);
    const { path, queryParams } = parsedUrl;

    // Handle different deep link paths
    if (path === 'game' && queryParams?.id) {
      navigation.navigate('GameDetails', { gameId: queryParams.id });
    } else if (path === 'tournament' && queryParams?.id) {
      navigation.navigate('TournamentDetails', { tournamentId: queryParams.id });
    } else if (path === 'profile' && queryParams?.id) {
      navigation.navigate('Profile', { userId: queryParams.id });
    } else if (path === 'match' && queryParams?.id) {
      // Navigate to game details if it's a match result
      navigation.navigate('GameDetails', { gameId: queryParams.id });
    }
  };

  return { handleDeepLink };
};
