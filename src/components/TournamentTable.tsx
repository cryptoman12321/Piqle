import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';

interface TournamentPlayer {
  id: string;
  firstName: string;
  lastName: string;
  isBot?: boolean;
  matchesWon: number;
  matchesLost: number;
  pointsWon: number;
  pointsLost: number;
}

interface TournamentTableProps {
  players: TournamentPlayer[];
}

const TournamentTable: React.FC<TournamentTableProps> = ({ players }) => {
  const { theme } = useThemeStore();

  // Простая сортировка по ID для отладки
  const sortedPlayers = [...players].sort((a, b) => a.id.localeCompare(b.id));

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tournament Standings</Text>
      
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.nameCell]}>Player</Text>
        <Text style={[styles.headerCell, styles.matchesCell]}>Matches</Text>
        <Text style={[styles.headerCell, styles.pointsCell]}>Points</Text>
        <Text style={[styles.headerCell, styles.handicapCell]}>Diff</Text>
      </View>

      {/* Players */}
      <ScrollView style={styles.playersContainer}>
        {sortedPlayers.map((player, index) => {
          const matchesDiff = player.matchesWon - player.matchesLost;
          const pointsDiff = player.pointsWon - player.pointsLost;
          
          return (
            <View key={player.id} style={styles.playerRow}>
              <View style={[styles.playerCell, styles.playerNameCell]}>
                <Text style={styles.position}>#{index + 1}</Text>
                <View style={styles.nameContainer}>
                  <Text style={styles.playerName}>
                    {player.firstName} {player.lastName}
                  </Text>
                  {player.isBot && (
                    <Text style={styles.botBadge}>🤖</Text>
                  )}
                </View>
              </View>
              
              <View style={[styles.playerCell, styles.matchesCell]}>
                <Text style={styles.matchesText}>
                  {player.matchesWon}-{player.matchesLost}
                </Text>
                <Text style={styles.matchesDiff}>
                  {matchesDiff > 0 ? `+${matchesDiff}` : matchesDiff}
                </Text>
              </View>
              
              <View style={[styles.playerCell, styles.pointsCell]}>
                <Text style={styles.pointsText}>
                  {player.pointsWon}-{player.pointsLost}
                </Text>
                <Text style={styles.pointsDiff}>
                  {pointsDiff > 0 ? `+${pointsDiff}` : pointsDiff}
                </Text>
              </View>
              
              <View style={[styles.playerCell, styles.handicapCell]}>
                <Text style={[
                  styles.handicapText,
                  { color: pointsDiff > 0 ? theme.colors.success : pointsDiff < 0 ? theme.colors.error : theme.colors.text }
                ]}>
                  {pointsDiff > 0 ? `+${pointsDiff}` : pointsDiff}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  headerCell: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  nameCell: {
    flex: 2,
    textAlign: 'left',
  },
  matchesCell: {
    flex: 1,
  },
  pointsCell: {
    flex: 1,
  },
  handicapCell: {
    flex: 1,
  },
  playersContainer: {
    marginTop: 16,
  },
  playerRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  playerCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerNameCell: {
    flex: 2,
    alignItems: 'flex-start',
  },
  position: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botBadge: {
    fontSize: 14,
    marginLeft: 4,
  },
  matchesText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  matchesDiff: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pointsDiff: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  handicapText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TournamentTable;
