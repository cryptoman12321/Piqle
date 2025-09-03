import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useThemeStore } from '../stores/themeStore';

interface TournamentPlayer {
  id: string;
  firstName: string;
  lastName: string;
  matchesWon: number;
  matchesLost: number;
  pointsWon: number;
  pointsLost: number;
}

interface TournamentTableProps {
  players: TournamentPlayer[];
  onDeletePlayer?: (playerId: string) => void;
  onViewProfile?: (playerId: string) => void;
  isCreator?: boolean;
}

const TournamentTable: React.FC<TournamentTableProps> = ({ players, onDeletePlayer, onViewProfile, isCreator }) => {
  const { theme } = useThemeStore();

  // Умная сортировка по турнирным правилам
  const sortedPlayers = [...players].sort((a, b) => {
    // 1. Сортируем по разнице очков (по убыванию) - ОСНОВНОЙ КРИТЕРИЙ
    const aDiff = a.pointsWon - a.pointsLost;
    const bDiff = b.pointsWon - b.pointsLost;
    if (aDiff !== bDiff) {
      return bDiff - aDiff;
    }
    
    // 2. При равной разнице - по выигранным матчам (по убыванию)
    if (a.matchesWon !== b.matchesWon) {
      return b.matchesWon - a.matchesWon;
    }
    
    // 3. При равных матчах - по проигранным матчам (по возрастанию)
    if (a.matchesLost !== b.matchesLost) {
      return a.matchesLost - b.matchesLost;
    }
    
    // 4. При равных матчах - по выигранным очкам (по убыванию)
    if (a.pointsWon !== b.pointsWon) {
      return b.pointsWon - a.pointsWon;
    }
    
    // 5. При равных очках - по проигранным очкам (по возрастанию)
    if (a.pointsLost !== b.pointsLost) {
      return a.pointsLost - b.pointsLost;
    }
    
    // 6. При абсолютном равенстве - игроки делят место (возвращаем 0)
    return 0;
  });

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
      <SwipeListView
        data={sortedPlayers}
        keyExtractor={(item) => item.id}
        renderItem={(data, index) => {
          const player = data.item;
          const matchesDiff = player.matchesWon - player.matchesLost;
          const pointsDiff = player.pointsWon - player.pointsLost;
          
          // Определяем позицию с учетом равных игроков
          let position = data.index + 1;
          if (data.index > 0) {
            const prevPlayer = sortedPlayers[data.index - 1];
            const prevMatchesDiff = prevPlayer.matchesWon - prevPlayer.matchesLost;
            const prevPointsDiff = prevPlayer.pointsWon - prevPlayer.pointsLost;
            
            // Если текущий игрок равен предыдущему по всем критериям, то позиция та же
            if (pointsDiff === prevPointsDiff && 
                player.matchesWon === prevPlayer.matchesWon && 
                player.matchesLost === prevPlayer.matchesLost &&
                player.pointsWon === prevPlayer.pointsWon &&
                player.pointsLost === prevPlayer.pointsLost) {
              position = data.index; // Та же позиция что и у предыдущего
            }
          }
          
          return (
            <View style={styles.playerRow}>
              <View style={styles.playerContent}>
                <View style={[styles.playerCell, styles.playerNameCell]}>
                  <Text style={styles.position}>#{position}</Text>
                  <View style={styles.nameContainer}>
                    <Text style={styles.playerName}>
                      {player.firstName} {player.lastName}
                    </Text>
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
            </View>
          );
        }}
        renderHiddenItem={(data, index) => {
          const player = data.item;
          return (
            <View style={styles.hiddenItem}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => onViewProfile?.(player.id)}
              >
                <Text style={styles.profileButtonText}>Profile</Text>
              </TouchableOpacity>
              
              {isCreator && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeletePlayer?.(player.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        rightOpenValue={-120}
        disableRightSwipe
        closeOnRowPress
        closeOnScroll
        closeOnRowOpen
        swipeToOpenPercent={30}
      />
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
  playerContent: {
    flex: 1,
    flexDirection: 'row',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: theme.colors.error || '#ff4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  hiddenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.surface,
    paddingRight: 16,
    height: '100%',
  },
});

export default TournamentTable;
