import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Ionicons } from '@expo/vector-icons';
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

interface WaitingListPlayer {
  id: string;
  firstName: string;
  lastName: string;
  position: number;
}

interface TournamentTableProps {
  tournament: any; // Турнир с матчами
  onDeletePlayer?: (playerId: string) => void;
  onViewProfile?: (playerId: string) => void;
  onPromoteFromWaitingList?: (playerId: string) => void;
  onDemoteToWaitingList?: (playerId: string) => void;
  isCreator?: boolean;
}

const TournamentTable: React.FC<TournamentTableProps> = ({ tournament, onDeletePlayer, onViewProfile, onPromoteFromWaitingList, onDemoteToWaitingList, isCreator }) => {
  const { theme } = useThemeStore();

  // Функция для получения имени игрока
  const getPlayerDisplayName = (playerId: string) => {
    if (playerId.startsWith('testBot')) {
      const botNumber = playerId.replace('testBot', '');
      const botNames = [
        'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
        'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi'
      ];
      
      if (botNumber) {
        const index = parseInt(botNumber) - 1;
        if (index >= 0 && index < botNames.length) {
          return `Bot ${botNames[index]}`;
        }
      }
      return `Bot ${botNumber || 'X'}`;
    } else {
      const knownUsers: { [key: string]: { firstName: string; lastName: string } } = {
        'currentUser': { firstName: 'John', lastName: 'Doe' },
        'user1': { firstName: 'Sol', lastName: 'Shats' },
        'user2': { firstName: 'Vlad', lastName: 'Shetinin' },
        'user3': { firstName: 'Andrew', lastName: 'Smith' },
        'user4': { firstName: 'Maria', lastName: 'Garcia' },
        'user5': { firstName: 'David', lastName: 'Brown' },
        'user6': { firstName: 'Sarah', lastName: 'Wilson' },
        'user7': { firstName: 'Michael', lastName: 'Davis' },
        'user8': { firstName: 'Emma', lastName: 'Taylor' },
      };
      
      const user = knownUsers[playerId];
      if (user) {
        return `${user.firstName} ${user.lastName}`;
      }
      return `${playerId} User`;
    }
  };

  // Вычисляем статистику игроков из матчей турнира
  const calculatePlayerStats = () => {
    console.log('=== TOURNAMENT TABLE DEBUG START ===');
    console.log('calculatePlayerStats called with tournament:', tournament);
    
    const playerStats: { [key: string]: TournamentPlayer } = {};
    
    if (!tournament) {
      console.log('ERROR: No tournament provided');
      console.log('=== TOURNAMENT TABLE DEBUG END ===');
      return [];
    }
    
    // Если турнир еще не запущен, показываем только список участников
    if (tournament.status === 'REGISTRATION_OPEN' || !tournament.brackets || tournament.brackets.length === 0) {
      console.log('Tournament not started yet, showing participants list');
      console.log('=== TOURNAMENT TABLE DEBUG END ===');
      return tournament.players.map((playerId: string) => ({
        id: playerId,
        firstName: getPlayerDisplayName(playerId).split(' ')[0],
        lastName: getPlayerDisplayName(playerId).split(' ')[1] || '',
        matchesWon: 0,
        matchesLost: 0,
        pointsWon: 0,
        pointsLost: 0,
      }));
    }
    
    const bracket = tournament.brackets[0];
    console.log('Bracket found:', bracket);
    
    if (!bracket.matches) {
      console.log('ERROR: No matches in bracket');
      console.log('=== TOURNAMENT TABLE DEBUG END ===');
      return [];
    }
    
    console.log('Players in tournament:', tournament.players);
    console.log('Matches in bracket:', bracket.matches);
    
    // Инициализируем статистику для всех игроков
    tournament.players.forEach((playerId: string) => {
      playerStats[playerId] = {
        id: playerId,
        firstName: getPlayerDisplayName(playerId).split(' ')[0],
        lastName: getPlayerDisplayName(playerId).split(' ')[1] || '',
        matchesWon: 0,
        matchesLost: 0,
        pointsWon: 0,
        pointsLost: 0,
      };
    });
    
    console.log('Initial player stats:', playerStats);
    
    // Подсчитываем статистику из матчей
    console.log('=== PROCESSING MATCHES ===');
    console.log('Total matches to process:', bracket.matches.length);
    
    bracket.matches.forEach((match: any, index: number) => {
      console.log(`Match ${index + 1}:`, match);
      console.log(`Match status: ${match.status}, score1: ${match.score1}, score2: ${match.score2}`);
      
      if ((match.status === 'completed' || match.status === 'COMPLETED') && match.score1 !== undefined && match.score2 !== undefined) {
        console.log('✅ Match is completed, updating stats');
        const player1 = playerStats[match.player1];
        const player2 = playerStats[match.player2];
        
        if (player1 && player2) {
          // Добавляем очки
          player1.pointsWon += match.score1;
          player1.pointsLost += match.score2;
          player2.pointsWon += match.score2;
          player2.pointsLost += match.score1;
          
          // Определяем победителя
          if (match.score1 > match.score2) {
            player1.matchesWon += 1;
            player2.matchesLost += 1;
            console.log(`🏆 ${match.player1} wins: ${match.score1}-${match.score2}`);
          } else {
            player2.matchesWon += 1;
            player1.matchesLost += 1;
            console.log(`🏆 ${match.player2} wins: ${match.score2}-${match.score1}`);
          }
          
          console.log(`Updated stats - ${match.player1}: ${player1.matchesWon}W/${player1.matchesLost}L, ${player1.pointsWon}-${player1.pointsLost}`);
          console.log(`Updated stats - ${match.player2}: ${player2.matchesWon}W/${player2.matchesLost}L, ${player2.pointsWon}-${player2.pointsLost}`);
        } else {
          console.log('❌ Player not found in playerStats:', match.player1, match.player2);
        }
      } else {
        console.log('❌ Match not completed or missing scores:', match.status, match.score1, match.score2);
      }
    });
    
    console.log('=== FINAL PLAYER STATS ===');
    Object.entries(playerStats).forEach(([playerId, stats]) => {
      console.log(`${playerId}: ${stats.matchesWon}W/${stats.matchesLost}L, ${stats.pointsWon}-${stats.pointsLost}`);
    });
    
    const result = Object.values(playerStats);
    console.log('Final player stats:', result);
    console.log('=== TOURNAMENT TABLE DEBUG END ===');
    return result;
  };

  const players = calculatePlayerStats();

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
      {/* Показываем заголовок только для завершенных турниров */}
      {tournament.status === 'COMPLETED' && (
        <Text style={styles.title}>Tournament Standings</Text>
      )}
      
      {/* Убираем подложку Main Roster - она не нужна */}
      
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.nameCell]}>Player</Text>
        {tournament.status === 'REGISTRATION_OPEN' ? (
          <>
            <Text style={[styles.headerCell, styles.matchesCell]}>Status</Text>
            <Text style={[styles.headerCell, styles.pointsCell]}>Actions</Text>
          </>
        ) : tournament.status === 'COMPLETED' ? (
          <>
            <Text style={[styles.headerCell, styles.matchesCell]}>Matches</Text>
            <Text style={[styles.headerCell, styles.pointsCell]}>Points</Text>
            <Text style={[styles.headerCell, styles.handicapCell]}>Diff</Text>
          </>
        ) : (
          <>
            <Text style={[styles.headerCell, styles.matchesCell]}>Matches</Text>
            <Text style={[styles.headerCell, styles.pointsCell]}>Points</Text>
            <Text style={[styles.headerCell, styles.handicapCell]}>Diff</Text>
          </>
        )}
      </View>

      {/* Players */}
      {sortedPlayers.length > 0 ? (
        <SwipeListView
          data={sortedPlayers}
          keyExtractor={(item) => item.id}
          renderItem={(data, index) => {
          const player = data.item;
          const matchesDiff = player.matchesWon - player.matchesLost;
          const pointsDiff = player.pointsWon - player.pointsLost;
          
          // Отладка для каждого игрока
          console.log('Rendering player:', player.id, 'matches:', player.matchesWon, '-', player.matchesLost, 'points:', player.pointsWon, '-', player.pointsLost);
          

          
          // Определяем позицию с учетом равных игроков
          let position = data.index + 1;
          
          // Для турниров в процессе - учитываем равные позиции
          if (tournament.status !== 'REGISTRATION_OPEN' && data.index > 0) {
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
          
          // Для REGISTRATION_OPEN - просто последовательная нумерация
          if (tournament.status === 'REGISTRATION_OPEN') {
            position = data.index + 1;
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
                
                {tournament.status === 'REGISTRATION_OPEN' ? (
                  <>
                    <View style={[styles.playerCell, styles.matchesCell]}>
                      <Text style={styles.statusText}>Registered</Text>
                    </View>
                    
                    <View style={[styles.playerCell, styles.pointsCell]}>
                      <Text style={styles.actionText}>Swipe →</Text>
                    </View>
                  </>
                ) : tournament.status === 'COMPLETED' ? (
                  <>
                    <View style={[styles.playerCell, styles.matchesCell]}>
                      <Text style={styles.matchesText}>
                        {player.matchesWon}-{player.matchesLost}
                      </Text>
                      <Text style={styles.matchesDiff}>
                        {matchesDiff > 0 ? `+${matchesDiff}` : matchesDiff < 0 ? `${matchesDiff}` : '0'}
                      </Text>
                    </View>
                    
                    <View style={[styles.playerCell, styles.pointsCell]}>
                      <Text style={styles.pointsText}>
                        {player.pointsWon}-{player.pointsLost}
                      </Text>
                      <Text style={styles.pointsDiff}>
                        {pointsDiff > 0 ? `+${pointsDiff}` : pointsDiff < 0 ? `${pointsDiff}` : '0'}
                      </Text>
                    </View>
                    
                    <View style={[styles.playerCell, styles.handicapCell]}>
                      <Text style={[
                        styles.handicapText,
                        { color: pointsDiff > 0 ? theme.colors.success : pointsDiff < 0 ? theme.colors.error : theme.colors.textSecondary }
                      ]}>
                        {pointsDiff > 0 ? `+${pointsDiff}` : pointsDiff < 0 ? `${pointsDiff}` : '0'}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={[styles.playerCell, styles.matchesCell]}>
                      <Text style={styles.matchesText}>
                        {player.matchesWon}-{player.matchesLost}
                      </Text>
                      <Text style={styles.matchesDiff}>
                        {matchesDiff > 0 ? `+${matchesDiff}` : matchesDiff < 0 ? `${matchesDiff}` : '0'}
                      </Text>
                    </View>
                    
                    <View style={[styles.playerCell, styles.pointsCell]}>
                      <Text style={styles.pointsText}>
                        {player.pointsWon}-{player.pointsLost}
                      </Text>
                      <Text style={styles.pointsDiff}>
                        {pointsDiff > 0 ? `+${pointsDiff}` : pointsDiff < 0 ? `${pointsDiff}` : '0'}
                      </Text>
                    </View>
                    
                    <View style={[styles.playerCell, styles.handicapCell]}>
                      <Text style={[
                        styles.handicapText,
                        { color: pointsDiff > 0 ? theme.colors.success : pointsDiff < 0 ? theme.colors.error : theme.colors.textSecondary }
                      ]}>
                        {pointsDiff > 0 ? `+${pointsDiff}` : pointsDiff < 0 ? `${pointsDiff}` : '0'}
                      </Text>
                    </View>
                  </>
                )}
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
                <>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDeletePlayer?.(player.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                  
                  {tournament.status === 'REGISTRATION_OPEN' && onDemoteToWaitingList && (
                    <TouchableOpacity
                      style={styles.demoteButton}
                      onPress={() => onDemoteToWaitingList(player.id)}
                    >
                      <Text style={styles.demoteButtonText}>Demote</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          );
        }}
        rightOpenValue={-180}
        disableRightSwipe
        closeOnRowPress
        closeOnScroll
        closeOnRowOpen
        swipeToOpenPercent={30}
      />
      ) : (
        <View style={styles.emptyTable}>
          <Text style={styles.emptyText}>No players to display</Text>
        </View>
      )}
      
      {/* Waiting List Section */}
      {tournament.waitingList && tournament.waitingList.length > 0 && (
        <>
          <View style={[styles.sectionHeader, styles.waitingListHeader]}>
            <View style={styles.waitingListTitleRow}>
              <Ionicons name="time" size={20} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>Waiting List</Text>
            </View>
            <Text style={styles.sectionSubtitle}>{tournament.waitingList.length} players waiting</Text>
          </View>
          
          {/* Waiting List Header */}
          <View style={[styles.headerRow, styles.waitingListHeaderRow]}>
            <Text style={[styles.waitingListHeaderCell, styles.nameCell]}>Player</Text>
            <Text style={[styles.waitingListHeaderCell, styles.matchesCell]}>Position</Text>
            <Text style={[styles.waitingListHeaderCell, styles.pointsCell]}>Actions</Text>
          </View>
          
          {/* Waiting List Players */}
          <SwipeListView
            data={tournament.waitingList.map((playerId: string, index: number) => ({
              id: playerId,
              firstName: getPlayerDisplayName(playerId).split(' ')[0],
              lastName: getPlayerDisplayName(playerId).split(' ')[1] || '',
              position: index + 1,
            }))}
            keyExtractor={(item) => item.id}
            renderItem={(data: { item: WaitingListPlayer }) => {
              const player = data.item;
              return (
                <View style={[styles.playerRow, styles.waitingListRow]}>
                  <View style={styles.playerContent}>
                    <View style={[styles.playerCell, styles.playerNameCell]}>
                      <Text style={styles.position}>#{player.position}</Text>
                      <View style={styles.nameContainer}>
                        <Text style={styles.playerName}>
                          {player.firstName} {player.lastName}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.playerCell, styles.matchesCell]}>
                      <Text style={styles.waitingListPositionText}>#{player.position}</Text>
                    </View>
                    
                    <View style={[styles.playerCell, styles.pointsCell]}>
                      <Text style={styles.actionText}>Swipe →</Text>
                    </View>
                  </View>
                </View>
              );
            }}
            renderHiddenItem={(data: { item: WaitingListPlayer }) => {
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
                      style={styles.promoteButton}
                      onPress={() => onPromoteFromWaitingList?.(player.id)}
                    >
                      <Text style={styles.promoteButtonText}>Promote</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
                      rightOpenValue={-180}
          disableRightSwipe
          closeOnRowPress
          closeOnScroll
          closeOnRowOpen
          swipeToOpenPercent={30}
          />
        </>
      )}
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
  // Специальный стиль для заголовка Waiting List
  waitingListHeaderCell: {
    flex: 1,
    color: theme.colors.text,
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
    marginVertical: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  matchesText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  matchesDiff: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  pointsDiff: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  handicapText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '600',
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  // Section header styles
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  // Waiting List specific styles
  waitingListHeader: {
    backgroundColor: theme.colors.warning + '20',
    borderColor: theme.colors.warning,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  waitingListTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  waitingListHeaderRow: {
    backgroundColor: theme.colors.warning + '80',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  waitingListRow: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.warning + '40',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  waitingListPositionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  promoteButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  promoteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  demoteButton: {
    backgroundColor: theme.colors.warning,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  demoteButtonText: {
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
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 180,
  },
  emptyTable: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default TournamentTable;
