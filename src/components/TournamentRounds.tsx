import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import ScoreInputBottomSheet from './ScoreInputBottomSheet';

interface TournamentRoundsProps {
  tournament: any;
  onUpdateScore: (matchId: string, scores: { game1: { score1: number; score2: number }[] }) => void;
}

const TournamentRounds: React.FC<TournamentRoundsProps> = ({ 
  tournament, 
  onUpdateScore 
}) => {
  const { theme } = useThemeStore();
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([1])); // Первый раунд открыт по умолчанию
  
  // Состояние для шторки ввода счета
  const [showScoreSheet, setShowScoreSheet] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  // Генерируем раунды на основе сохраненных матчей из турнира
  const generateRounds = () => {
    const players = tournament.players;
    const courtsCount = tournament.courtsCount || 2;
    
    // Берем сохраненные матчи из bracket турнира
    let allMatches: any[] = [];
    
    if (tournament.brackets && tournament.brackets.length > 0) {
      const bracket = tournament.brackets[0];
      if (bracket.matches && bracket.matches.length > 0) {
        // Используем сохраненные матчи
        allMatches = bracket.matches.map((match: any) => ({
          ...match,
          // Убеждаемся что все поля есть
          score1: match.score1 || 0,
          score2: match.score2 || 0,
          status: match.status || 'pending',
          winner: match.winner || null,
        }));
        console.log('Using saved matches from tournament:', allMatches.length);
      }
    }
    
    // Если сохраненных матчей нет, генерируем новые
    if (allMatches.length === 0) {
      console.log('No saved matches, generating new ones');
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          allMatches.push({
            id: `match_${players[i]}_${players[j]}`,
            player1: players[i],
            player2: players[j],
            status: 'pending',
            score1: 0,
            score2: 0,
            winner: null,
          });
        }
      }
    }

    // Алгоритм равномерного распределения: сначала игроки с минимальным количеством матчей
    const rounds: any[] = [];
    const matchesPerRound = courtsCount;
    const totalRounds = Math.ceil(allMatches.length / matchesPerRound);

    // Создаем массив для отслеживания игроков в каждом раунде
    const playersInRounds: Set<string>[] = Array.from({ length: totalRounds }, () => new Set());
    
    // Создаем массив для отслеживания количества матчей каждого игрока
    const playerMatchCounts: { [key: string]: number } = {};
    players.forEach((playerId: string) => {
      playerMatchCounts[playerId] = 0;
    });

    // Создаем копию матчей для работы
    const availableMatches = [...allMatches];
    
    // Заполняем раунды по одному
    for (let round = 1; round <= totalRounds; round++) {
      // Создаем раунд
      rounds[round - 1] = {
        roundNumber: round,
        matches: [],
        status: round === 1 ? 'in_progress' : 'pending',
        isActive: round === 1,
      };
      
      // Ищем матчи для текущего раунда
      let matchesInRound = 0;
      
      while (matchesInRound < matchesPerRound && availableMatches.length > 0) {
        // Ищем матч с минимальной суммой матчей у игроков
        let bestMatchIndex = 0;
        let bestScore = Infinity;
        
        for (let i = 0; i < availableMatches.length; i++) {
          const match = availableMatches[i];
          const player1Matches = playerMatchCounts[match.player1];
          const player2Matches = playerMatchCounts[match.player2];
          
          // Проверяем, не участвуют ли уже игроки в этом раунде
          if (playersInRounds[round - 1].has(match.player1) || playersInRounds[round - 1].has(match.player2)) {
            continue;
          }
          
          // Считаем score: чем меньше матчей у игроков, тем лучше
          const score = player1Matches + player2Matches;
          
          if (score < bestScore) {
            bestScore = score;
            bestMatchIndex = i;
          }
        }
        
        // Если нашли подходящий матч
        if (bestScore < Infinity) {
          const bestMatch = availableMatches[bestMatchIndex];
          
          // Добавляем матч в раунд
          rounds[round - 1].matches.push(bestMatch);
          
          // Отмечаем игроков как участвующих в этом раунде
          playersInRounds[round - 1].add(bestMatch.player1);
          playersInRounds[round - 1].add(bestMatch.player2);
          
          // Увеличиваем счетчик матчей для игроков
          playerMatchCounts[bestMatch.player1]++;
          playerMatchCounts[bestMatch.player2]++;
          
          // Убираем матч из доступных
          availableMatches.splice(bestMatchIndex, 1);
          
          matchesInRound++;
        } else {
          // Если не нашли подходящий матч, берем любой
          const anyMatch = availableMatches.shift();
          if (anyMatch) {
            rounds[round - 1].matches.push(anyMatch);
            playersInRounds[round - 1].add(anyMatch.player1);
            playersInRounds[round - 1].add(anyMatch.player2);
            playerMatchCounts[anyMatch.player1]++;
            playerMatchCounts[anyMatch.player2]++;
            matchesInRound++;
          }
        }
      }
    }

    return rounds;
  };

  const rounds = generateRounds();

  const toggleRound = (roundNumber: number) => {
    const newExpanded = new Set(expandedRounds);
    if (newExpanded.has(roundNumber)) {
      newExpanded.delete(roundNumber);
    } else {
      newExpanded.add(roundNumber);
    }
    setExpandedRounds(newExpanded);
  };



  const getPlayerDisplayName = (playerId: string) => {
    if (playerId.startsWith('testBot')) {
      // Извлекаем номер из ID бота
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
      // Для реальных игроков используем те же данные что и в SinglesRoundRobinScreen
      const knownUsers: { [key: string]: { firstName: string; lastName: string } } = {
        'currentUser': { firstName: 'John', lastName: 'Doe' },
        'user1': { firstName: 'Sol', lastName: 'Shats' },
        'user2': { firstName: 'Vlad', lastName: 'Shetinin' },
        'user3': { firstName: 'Alex', lastName: 'Johnson' },
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
      
      // Fallback для неизвестных пользователей
      return `${playerId} User`;
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tournament Rounds</Text>
      
      <ScrollView style={styles.roundsContainer} showsVerticalScrollIndicator={false}>
        {rounds.map((round) => (
          <View key={round.roundNumber} style={styles.roundSection}>
            {/* Заголовок раунда */}
            <TouchableOpacity
              style={styles.roundHeader}
              onPress={() => toggleRound(round.roundNumber)}
              activeOpacity={0.7}
            >
              <View style={styles.roundHeaderLeft}>
                <Text style={styles.roundTitle}>Round {round.roundNumber}</Text>
                <Text style={[
                  styles.roundStatus,
                  { 
                    color: round.status === 'completed' ? theme.colors.success : 
                           round.status === 'in_progress' ? theme.colors.warning : 
                           theme.colors.textSecondary 
                  }
                ]}>
                  {round.status === 'completed' ? 'Completed' :
                   round.status === 'in_progress' ? 'In Progress' : 'Pending'}
                </Text>
              </View>
              
              <Ionicons
                name={expandedRounds.has(round.roundNumber) ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Матчи раунда (раскрывающиеся) */}
            {expandedRounds.has(round.roundNumber) && (
              <View style={styles.matchesContainer}>
                {round.matches.map((match: any) => (
                  <View key={match.id} style={styles.matchRow}>
                    {/* Имена игроков */}
                    <View style={styles.playerRow}>
                      <View style={styles.playerNameContainer}>
                        <Text style={styles.playerName}>
                          {getPlayerDisplayName(match.player1)}
                        </Text>
                      </View>
                      <Text style={styles.vs}>vs</Text>
                      <View style={styles.playerNameContainer}>
                        <Text style={styles.playerName}>
                          {getPlayerDisplayName(match.player2)}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Счет */}
                    <View style={styles.scoreRow}>
                      <Text style={styles.score}>{match.score1}</Text>
                      <Text style={styles.scoreSeparator}>-</Text>
                      <Text style={styles.score}>{match.score2}</Text>
                    </View>
                    
                    {/* Статус и кнопка обновления */}
                    <View style={styles.matchActions}>
                      <Text style={[
                        styles.statusText,
                        { 
                          color: match.status === 'completed' ? theme.colors.success : 
                                 match.status === 'in_progress' ? theme.colors.warning : 
                                 theme.colors.textSecondary 
                        }
                      ]}>
                        {match.status === 'completed' ? 'Completed' :
                         match.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </Text>
                      
                      {match.status === 'pending' && (
                        <TouchableOpacity
                          style={styles.updateScoreButton}
                          onPress={() => {
                            setSelectedMatch(match);
                            setShowScoreSheet(true);
                          }}
                        >
                          <Text style={styles.updateScoreButtonText}>Update Score</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Шторка для ввода счета */}
      <ScoreInputBottomSheet
        visible={showScoreSheet}
        onClose={() => {
          setShowScoreSheet(false);
          setSelectedMatch(null);
        }}
        onSave={(matchId, scores) => {
          onUpdateScore(matchId, scores);
        }}
        match={selectedMatch}
        getPlayerDisplayName={getPlayerDisplayName}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: 20,
  },
  roundsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  roundSection: {
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.primary,
  },
  roundHeaderLeft: {
    flex: 1,
  },
  roundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  roundStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  matchesContainer: {
    padding: 16,
  },
  matchRow: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  playerNameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  vs: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -10 }], // Примерно половина ширины "vs"
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  scoreSeparator: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginHorizontal: 12,
    fontWeight: '500',
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  updateScoreButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  updateScoreButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

});

export default TournamentRounds;
