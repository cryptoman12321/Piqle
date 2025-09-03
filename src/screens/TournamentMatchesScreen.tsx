import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeStore } from '../stores/themeStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import { Tournament, TournamentStatus } from '../types';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

// Функция для получения данных игрока из tournament store
const getPlayerData = (playerId: string) => {
  // TODO: В реальном приложении здесь будет API вызов для получения данных пользователя
  // Пока используем mock данные для известных пользователей (как в SinglesRoundRobinScreen)
  const knownUsers: { [key: string]: { firstName: string; lastName: string } } = {
    'currentUser': { firstName: 'John', lastName: 'Doe' },
    'user1': { firstName: 'Sol', lastName: 'Shats' },
    'user2': { firstName: 'Vlad', lastName: 'Shetinin' },
    'user3': { firstName: 'Andrew', lastName: 'Smith' },
    'user4': { firstName: 'John', lastName: 'Doe' },
    'user5': { firstName: 'Jane', lastName: 'Smith' },
    'user6': { firstName: 'Mike', lastName: 'Johnson' },
    'user7': { firstName: 'Sarah', lastName: 'Wilson' },
    'user8': { firstName: 'Alex', lastName: 'Chen' },
    'user9': { firstName: 'Emma', lastName: 'Davis' },
    'user10': { firstName: 'David', lastName: 'Lee' },
    'user11': { firstName: 'Lisa', lastName: 'Brown' },
    'user12': { firstName: 'Michael', lastName: 'Garcia' },
    'user13': { firstName: 'Tom', lastName: 'Wilson' },
    'user14': { firstName: 'Anna', lastName: 'Taylor' },
    'user15': { firstName: 'Chris', lastName: 'Anderson' },
    'user16': { firstName: 'Maria', lastName: 'Martinez' },
    'user17': { firstName: 'James', lastName: 'Thompson' },
    'user18': { firstName: 'Sophie', lastName: 'Clark' },
    'user19': { firstName: 'Daniel', lastName: 'White' },
    'user20': { firstName: 'Olivia', lastName: 'Hall' },
    'user21': { firstName: 'Robert', lastName: 'Lewis' },
    'user22': { firstName: 'Grace', lastName: 'Young' },
    'user23': { firstName: 'William', lastName: 'King' },
    'user24': { firstName: 'Chloe', lastName: 'Scott' },
  };
  
  return knownUsers[playerId] || { firstName: `Player${playerId}`, lastName: 'Unknown' };
};

// Функция для генерации уникальных названий ботов
const getBotName = (playerId: string) => {
  if (!playerId.startsWith('testBot')) return null;
  
  // Извлекаем номер из ID бота
  const botNumber = playerId.replace('testBot', '');
  
  // Создаем уникальные имена для ботов
  const botNames = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
    'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi'
  ];
  
  // Используем номер для выбора имени, если номер есть
  if (botNumber) {
    const index = parseInt(botNumber) - 1;
    if (index >= 0 && index < botNames.length) {
      return `Bot ${botNames[index]}`;
    }
  }
  
  // Fallback: используем номер
  return `Bot ${botNumber || 'X'}`;
};

// Функция для получения имени любого игрока (реального или бота)
const getPlayerDisplayName = (playerId: string) => {
  if (playerId.startsWith('testBot')) {
    return getBotName(playerId);
  } else {
    const playerData = getPlayerData(playerId);
    return `${playerData.firstName} ${playerData.lastName}`;
  }
};

type TournamentMatchesRouteProp = RouteProp<{
  TournamentMatches: { tournamentId: string };
}, 'TournamentMatches'>;

const TournamentMatchesScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { getTournamentById, updateTournament, loadTournaments } = useTournamentStore();
  const { user } = useAuthStore();
  const route = useRoute<TournamentMatchesRouteProp>();
  const navigation = useNavigation();
  const { tournamentId } = route.params;
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<any[]>([]);

  const styles = createStyles(theme);

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  const loadTournament = () => {
    const foundTournament = getTournamentById(tournamentId);
    if (foundTournament) {
      setTournament(foundTournament);
      generateMatches(foundTournament);
    }
  };

  const generateMatches = (tournament: Tournament) => {
    const players = tournament.players;
    const courtsCount = tournament.courtsCount || 2;
    
    // Генерируем все возможные пары игроков
    const allMatches = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        allMatches.push({
          id: `match_${players[i]}_${players[j]}`,
          player1: players[i],
          player2: players[j],
          status: 'pending', // pending, in_progress, completed
          score1: 0,
          score2: 0,
          winner: null,
        });
      }
    }

    setMatches(allMatches);
    
    // Новая логика: равномерно распределяем игроков по запускам
    const roundsData = distributeMatchesEvenly(allMatches, players, courtsCount);
    setRounds(roundsData);
  };

  // Функция для равномерного распределения матчей
  const distributeMatchesEvenly = (matches: any[], players: string[], courtsCount: number) => {
    const rounds: any[] = [];
    const matchesPerRound = courtsCount;
    const totalRounds = Math.ceil(matches.length / matchesPerRound);
    
    // Создаем массив для отслеживания игроков в каждом раунде
    const playerRounds = new Map<string, number[]>();
    players.forEach(player => playerRounds.set(player, []));
    
    // Сортируем матчи по приоритету (максимально равномерное распределение)
    const sortedMatches = [...matches].sort((a, b) => {
      const aPlayer1Rounds = playerRounds.get(a.player1)?.length || 0;
      const aPlayer2Rounds = playerRounds.get(a.player2)?.length || 0;
      const bPlayer1Rounds = playerRounds.get(b.player1)?.length || 0;
      const bPlayer2Rounds = playerRounds.get(b.player2)?.length || 0;
      
      // Приоритет: матчи с игроками, которые играли меньше всего
      const aTotalRounds = aPlayer1Rounds + aPlayer2Rounds;
      const bTotalRounds = bPlayer1Rounds + bPlayer2Rounds;
      
      if (aTotalRounds !== bTotalRounds) {
        return aTotalRounds - bTotalRounds;
      }
      
      // Если общее количество одинаково, выбираем матч с максимальной разницей
      const aMaxRounds = Math.max(aPlayer1Rounds, aPlayer2Rounds);
      const bMaxRounds = Math.max(bPlayer1Rounds, bPlayer2Rounds);
      
      return aMaxRounds - bMaxRounds;
    });
    
    // Распределяем матчи по раундам
    for (let round = 1; round <= totalRounds; round++) {
      const roundMatches: any[] = [];
      const roundPlayers = new Set<string>();
      
      // Ищем матчи для текущего раунда
      for (let i = 0; i < sortedMatches.length && roundMatches.length < matchesPerRound; i++) {
        const match = sortedMatches[i];
        
        // Проверяем, не играет ли уже кто-то из игроков в этом раунде
        if (!roundPlayers.has(match.player1) && !roundPlayers.has(match.player2)) {
          // Проверяем, не слишком ли часто играет игрок
          const player1Rounds = playerRounds.get(match.player1) || [];
          const player2Rounds = playerRounds.get(match.player2) || [];
          
          // Игрок не должен играть в каждом втором раунде
          if (player1Rounds.length < Math.ceil(round / 2) && 
              player2Rounds.length < Math.ceil(round / 2)) {
            
            roundMatches.push({
              ...match,
              court: roundMatches.length + 1,
            });
            
            roundPlayers.add(match.player1);
            roundPlayers.add(match.player2);
            
            // Обновляем отслеживание раундов для игроков
            playerRounds.get(match.player1)?.push(round);
            playerRounds.get(match.player2)?.push(round);
            
            // Убираем матч из доступных
            sortedMatches.splice(i, 1);
            i--;
          }
        }
      }
      
      // Если не нашли подходящих матчей, берем любые доступные
      while (roundMatches.length < matchesPerRound && sortedMatches.length > 0) {
        const match = sortedMatches.shift();
        if (match) {
          roundMatches.push({
            ...match,
            court: roundMatches.length + 1,
          });
        }
      }
      
      rounds.push({
        roundNumber: round,
        matches: roundMatches,
        status: round === 1 ? 'in_progress' : 'pending',
        isActive: round === 1,
      });
    }
    
    return rounds;
  };

  const handleUpdateScore = (matchId: string) => {
    // TODO: Открыть модальное окно для ввода счета
    showSuccess('Score update coming soon!');
  };





  const isCreator = tournament?.createdBy === user?.id;

  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Tournament not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={hideToast}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{tournament.name}</Text>
              <Text style={styles.headerSubtitle}>Tournament Matches</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tournament Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{tournament.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Courts:</Text>
            <Text style={styles.infoValue}>{tournament.courtsCount || 2}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Matches:</Text>
            <Text style={styles.infoValue}>{matches.length}</Text>
          </View>
        </View>

                {/* All Rounds */}
        {rounds.map((round: any) => (
          <View key={round.roundNumber} style={styles.roundSection}>
            <View style={styles.roundHeader}>
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
            
            {round.matches.map((match: any, index: number) => (
              <View key={match.id} style={styles.matchRow}>
                {/* Имена игроков на всю ширину */}
                <View style={styles.playerRow}>
                  <Text style={styles.playerName}>
                    {getPlayerDisplayName(match.player1)}
                  </Text>
                  <Text style={styles.vs}>vs</Text>
                  <Text style={styles.playerName}>
                    {getPlayerDisplayName(match.player2)}
                  </Text>
                </View>
                
                {/* Счет снизу - кликабельный для активного запуска */}
                <View style={styles.scoreRow}>
                  {round.isActive && isCreator ? (
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => handleUpdateScore(match.id)}
                    >
                      <Text style={styles.scoreButtonText}>{match.score1}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.score}>{match.score1}</Text>
                  )}
                  
                  <Text style={styles.scoreSeparator}>-</Text>
                  
                  {round.isActive && isCreator ? (
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => handleUpdateScore(match.id)}
                    >
                      <Text style={styles.scoreButtonText}>{match.score2}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.score}>{match.score2}</Text>
                  )}
                </View>
                
                {/* Статус справа */}
                <View style={styles.matchStatus}>
                  <Text style={[
                    styles.statusText,
                    { color: match.status === 'completed' ? theme.colors.success : 
                             match.status === 'in_progress' ? theme.colors.warning : 
                             theme.colors.textSecondary }
                  ]}>
                    {match.status === 'completed' ? 'Completed' :
                     match.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  roundSection: {
    marginBottom: 24,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  roundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  roundStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
    textTransform: 'uppercase',
  },
  matchRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  vs: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  scoreButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  scoreButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreSeparator: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    marginHorizontal: 12,
    fontWeight: '500',
  },
  matchStatus: {
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: theme.colors.text,
  },

});

export default TournamentMatchesScreen;
