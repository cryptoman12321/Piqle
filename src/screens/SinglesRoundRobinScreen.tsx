import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import TournamentTable from '../components/TournamentTable';
import TournamentRounds from '../components/TournamentRounds';
import { Tournament, TournamentStatus, BracketType, MatchStatus } from '../types';
import { TournamentsStackParamList } from '../types';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

type SinglesRoundRobinRouteProp = RouteProp<TournamentsStackParamList, 'SinglesRoundRobin'>;

const SinglesRoundRobinScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { getTournamentById, updateTournament, deleteTournament, loadTournaments } = useTournamentStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const route = useRoute<SinglesRoundRobinRouteProp>();
  const { tournamentId } = route.params;
  const { toast, showSuccess, showError, hideToast } = useToast();

  const styles = createStyles(theme);

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<'standings' | 'rounds'>('standings'); // Активная вкладка
  const [testBots, setTestBots] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  useEffect(() => {
    console.log('useEffect triggered with tournamentId:', tournamentId);
    loadTournament();
  }, [tournamentId]);

  // Reload tournaments from store when component mounts
  useEffect(() => {
    const loadAllTournaments = async () => {
      try {
        await loadTournaments();
      } catch (error) {
        console.error('Failed to load tournaments:', error);
      }
    };
    loadAllTournaments();
  }, []);

  const loadTournament = () => {
    const foundTournament = getTournamentById(tournamentId);
    console.log('Loading tournament:', { tournamentId, foundTournament });
    console.log('All tournaments in store:', useTournamentStore.getState().tournaments);
    if (foundTournament) {
      setTournament(foundTournament);
    } else {
      console.error('Tournament not found:', tournamentId);
      // Try to reload tournaments and search again
      loadTournaments().then(() => {
        const retryTournament = getTournamentById(tournamentId);
        console.log('Retry loading tournament:', { tournamentId, retryTournament });
        if (retryTournament) {
          setTournament(retryTournament);
        }
      });
    }
  };

  const handleJoinTournament = async () => {
    if (!tournament || !user) return;

    // Проверяем, не присоединился ли уже пользователь
    if (tournament.players.includes(user.id)) {
      showError('You are already a participant in this tournament.');
      return;
    }

    // Проверяем, есть ли место
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      showError('This tournament has reached its maximum capacity.');
      return;
    }

    setIsJoining(true);

    try {
      // Добавляем пользователя к турниру
      const updatedPlayers = [...tournament.players, user.id];
      const updatedCurrentParticipants = tournament.currentParticipants + 1;

      await updateTournament(tournament.id, {
        players: updatedPlayers,
        currentParticipants: updatedCurrentParticipants,
      });

      // Обновляем локальное состояние
      setTournament({
        ...tournament,
        players: updatedPlayers,
        currentParticipants: updatedCurrentParticipants,
      });

      // Reload tournaments to ensure fresh data
      await loadTournaments();

      showSuccess('You have successfully joined the tournament!');
    } catch (error) {
      showError('Failed to join tournament. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const formatTimeUntilTournament = (startDate: Date) => {
    const now = new Date();
    const timeDiff = startDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return 'Tournament time has arrived!';
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 1) {
      return `${days} days until tournament`;
    } else if (days === 1) {
      return `1 day and ${hours} hours until tournament`;
    } else if (hours > 0) {
      return `${hours} hours and ${minutes} minutes until tournament`;
    } else {
      return `${minutes} minutes until tournament`;
    }
  };

  const handleStartTournament = () => {
    if (!tournament) return;
    
    const now = new Date();
    const tournamentStartTime = tournament.startDate;
    
    if (now < tournamentStartTime) {
      // Tournament hasn't started yet - ask for confirmation
      const timeUntil = formatTimeUntilTournament(tournamentStartTime);
      Alert.alert(
        'Start Tournament Early?',
        `${timeUntil}\n\nAre you sure you want to start the tournament now?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Now',
            style: 'destructive',
            onPress: () => {
              console.log('Starting tournament early...');
              startTournamentAndNavigate();
            }
          }
        ]
      );
    } else {
      // Tournament time has arrived - start normally
      console.log('Starting tournament on time...');
      startTournamentAndNavigate();
    }
  };

  const startTournamentAndNavigate = () => {
    if (!tournament) return;
    
    console.log('Starting tournament with players:', tournament.players);
    console.log('Tournament before update:', tournament);
    
    try {
      // Создаем все матчи для Round Robin турнира
      const allMatches: any[] = [];
      const players = tournament.players;
      
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          allMatches.push({
            id: `match_${players[i]}_${players[j]}`,
            player1: players[i],
            player2: players[j],
            score1: 0,
            score2: 0,
            status: 'pending',
            winner: null,
          });
        }
      }
      
      // Создаем bracket для Round Robin
      const roundRobinBracket = {
        id: 'round_robin_bracket',
        name: 'Round Robin',
        type: BracketType.ROUND_ROBIN,
        participants: players,
        matches: allMatches,
        winner: undefined,
      };
      
      // Обновляем турнир: статус + bracket с матчами
      updateTournament(tournament.id, {
        status: TournamentStatus.IN_PROGRESS,
        brackets: [roundRobinBracket],
      });
      
      // Показываем успешное сообщение
      showSuccess('Tournament started successfully!');
      
      // Показываем раунды вместо перехода на другой экран
      setActiveTab('rounds');
      
    } catch (error) {
      console.error('Failed to start tournament:', error);
      showError('Failed to start tournament. Please try again.');
    }
  };

  const handleUpdateScore = (matchId: string, scores: { game1: { score1: number; score2: number }[] }) => {
    if (!tournament) return;
    
    const gameScores = scores.game1;
    const totalScore1 = gameScores.reduce((sum, game) => sum + game.score1, 0);
    const totalScore2 = gameScores.reduce((sum, game) => sum + game.score2, 0);
    
    try {
      // Обновляем матч в bracket турнира
      const updatedTournament = { ...tournament };
      const bracket = updatedTournament.brackets?.[0];
      
      if (bracket && bracket.matches) {
        const matchToUpdate = bracket.matches.find((m: any) => m.id === matchId);
        
        if (matchToUpdate) {
          matchToUpdate.score1 = totalScore1;
          matchToUpdate.score2 = totalScore2;
          matchToUpdate.status = MatchStatus.COMPLETED;
          matchToUpdate.winner = totalScore1 > totalScore2 ? matchToUpdate.player1 : matchToUpdate.player2;
          
          // Обновляем турнир в сторе
          updateTournament(tournament.id, updatedTournament);
          
          // Обновляем локальное состояние
          setTournament(updatedTournament);
          
          showSuccess(`Score updated: ${totalScore1} - ${totalScore2} (${gameScores.length} games)`);
        } else {
          showError('Match not found in tournament');
        }
      } else {
        showError('Tournament bracket not found');
      }
    } catch (error) {
      console.error('Failed to update match score:', error);
      showError('Failed to update score. Please try again.');
    }
  };

  const handleEditScore = (matchId: string, scores: { game1: { score1: number; score2: number }[] }) => {
    if (!tournament) return;
    
    const gameScores = scores.game1;
    const totalScore1 = gameScores.reduce((sum, game) => sum + game.score1, 0);
    const totalScore2 = gameScores.reduce((sum, game) => sum + game.score2, 0);
    
    try {
      // Обновляем матч в bracket турнира
      const updatedTournament = { ...tournament };
      const bracket = updatedTournament.brackets?.[0];
      
      if (bracket && bracket.matches) {
        const matchToUpdate = bracket.matches.find((m: any) => m.id === matchId);
        
        if (matchToUpdate) {
          matchToUpdate.score1 = totalScore1;
          matchToUpdate.score2 = totalScore2;
          matchToUpdate.status = MatchStatus.COMPLETED;
          matchToUpdate.winner = totalScore1 > totalScore2 ? matchToUpdate.player1 : matchToUpdate.player2;
          
          // Обновляем турнир в сторе
          updateTournament(tournament.id, updatedTournament);
          
          // Обновляем локальное состояние
          setTournament(updatedTournament);
          
          showSuccess(`Score edited: ${totalScore1} - ${totalScore2} (${gameScores.length} games)`);
        } else {
          showError('Match not found in tournament');
        }
      } else {
        showError('Tournament bracket not found');
      }
    } catch (error) {
      console.error('Failed to edit match score:', error);
      showError('Failed to edit score. Please try again.');
    }
  };

  // Функция для отображения имени игрока
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
      // Для реальных игроков используем те же данные что и в TournamentRounds
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
      
      // Fallback для неизвестных пользователей
      return `${playerId} User`;
    }
  };

  // Функция для перевода игрока из waiting list в основной список
  const handlePromoteFromWaitingList = (playerId: string) => {
    if (!tournament) return;
    
    try {
      const updatedTournament = { ...tournament };
      
      // Убираем игрока из waiting list
      updatedTournament.waitingList = updatedTournament.waitingList.filter(id => id !== playerId);
      
      // Добавляем игрока в основной список
      updatedTournament.players.push(playerId);
      updatedTournament.currentParticipants = updatedTournament.players.length;
      
      // Обновляем турнир
      updateTournament(tournament.id, updatedTournament);
      setTournament(updatedTournament);
      
      showSuccess(`${getPlayerDisplayName(playerId)} promoted from waiting list!`);
    } catch (error) {
      console.error('Failed to promote player:', error);
      showError('Failed to promote player. Please try again.');
    }
  };

  // Функция для присоединения к waiting list
  const handleJoinWaitingList = () => {
    if (!tournament || !user) return;
    
    try {
      const updatedTournament = { ...tournament };
      
      // Инициализируем waiting list если его нет
      if (!updatedTournament.waitingList) {
        updatedTournament.waitingList = [];
      }
      
      // Проверяем, не находится ли пользователь уже в waiting list
      if (updatedTournament.waitingList.includes(user.id)) {
        showError('You are already on the waiting list!');
        return;
      }
      
      // Добавляем пользователя в waiting list
      updatedTournament.waitingList.push(user.id);
      
      // Обновляем турнир
      updateTournament(tournament.id, updatedTournament);
      setTournament(updatedTournament);
      
      showSuccess('You have been added to the waiting list!');
    } catch (error) {
      console.error('Failed to join waiting list:', error);
      showError('Failed to join waiting list. Please try again.');
    }
  };

  const handleLeaveTournament = async () => {
    if (!tournament || !user) return;

    const isCreator = tournament.createdBy === user.id;
    const alertTitle = isCreator ? 'Leave Tournament (Creator)' : 'Leave Tournament';
    const alertMessage = isCreator 
      ? 'You are the tournament creator. If you leave, you will no longer be able to manage this tournament. Are you sure you want to leave?'
      : 'Are you sure you want to leave this tournament?';

    // Показываем подтверждение через Alert, но успех/ошибку через тост
    Alert.alert(
      alertTitle,
      alertMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPlayers = tournament.players.filter(id => id !== user.id);
              const updatedCurrentParticipants = tournament.currentParticipants - 1;

              await updateTournament(tournament.id, {
                players: updatedPlayers,
                currentParticipants: updatedCurrentParticipants,
              });

              setTournament({
                ...tournament,
                players: updatedPlayers,
                currentParticipants: updatedCurrentParticipants,
              });

              // Reload tournaments to ensure fresh data
              await loadTournaments();

              const successMessage = isCreator 
                ? 'You have left the tournament as creator. You can still view it but cannot manage it.'
                : 'You have left the tournament.';
              
              showSuccess(successMessage);
            } catch (error) {
              showError('Failed to leave tournament. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (!tournament) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Tournament not found
        </Text>
      </SafeAreaView>
    );
  }

  // Получаем реальные данные пользователей
  const getPlayerData = (playerId: string) => {
    // TODO: В реальном приложении здесь будет API вызов для получения данных пользователя
    // Пока используем mock данные для известных пользователей
    const knownUsers: { [key: string]: { firstName: string; lastName: string } } = {
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

  // Используем только реальных участников (без ботов)
  const allPlayers = tournament.players;

  // Bot management functions (Dev/Test Only)
  const addTestBot = async () => {
    if (!tournament) return;
    
    const botNumber = getBotCount() + 1;
    const newBotId = `testBot${Date.now()}_${botNumber}`;
    
    console.log('Adding bot with ID:', newBotId);
    console.log('Current tournament players:', tournament.players);
    console.log('Current participants:', tournament.currentParticipants);
    
    try {
      let updatedTournament = { ...tournament };
      
      if (allPlayers.length < tournament.maxParticipants) {
        // Если есть место в основном списке, добавляем туда
        updatedTournament.players = [...tournament.players, newBotId];
        updatedTournament.currentParticipants = tournament.currentParticipants + 1;
      } else {
        // Если основное место заполнено, добавляем в waiting list
        if (!updatedTournament.waitingList) {
          updatedTournament.waitingList = [];
        }
        updatedTournament.waitingList.push(newBotId);
        showSuccess(`Bot added to waiting list! (${updatedTournament.waitingList.length} in queue)`);
      }
      
      await updateTournament(tournament.id, updatedTournament);
      setTournament(updatedTournament);
      
      console.log('Updated tournament:', updatedTournament);
      
      if (allPlayers.length < tournament.maxParticipants) {
        showSuccess('Bot added successfully!');
      }
    } catch (error) {
      console.error('Error adding bot:', error);
      showError('Failed to add bot. Please try again.');
    }
  };

  const getBotCount = () => {
    // Считаем ботов по ID (начинаются с 'testBot')
    return allPlayers.filter(playerId => playerId.startsWith('testBot')).length;
  };

  const handlePlayerPress = (player: any) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!tournament || !user) return;
    
    // Только создатель может удалять игроков
    if (tournament.createdBy !== user.id) {
      showError('Only tournament creator can remove players.');
      return;
    }

    try {
      const updatedTournament = { ...tournament };
      
      // Убираем игрока из основного списка
      updatedTournament.players = tournament.players.filter(id => id !== playerId);
      updatedTournament.currentParticipants = updatedTournament.players.length;
      
      // Если есть игроки в waiting list, переводим первого в основной список
      if (updatedTournament.waitingList && updatedTournament.waitingList.length > 0) {
        const promotedPlayer = updatedTournament.waitingList.shift()!;
        updatedTournament.players.push(promotedPlayer);
        updatedTournament.currentParticipants = updatedTournament.players.length;
        
        showSuccess(`${getPlayerDisplayName(promotedPlayer)} promoted from waiting list!`);
      }
      
      await updateTournament(tournament.id, updatedTournament);
      setTournament(updatedTournament);
      
      showSuccess('Player removed successfully!');
      setShowPlayerModal(false);
      setSelectedPlayer(null);
    } catch (error) {
      showError('Failed to remove player. Please try again.');
    }
  };

  const handleViewProfile = (playerId: string) => {
    // TODO: Navigate to player profile
    showSuccess('Profile view coming soon!');
    setShowPlayerModal(false);
    setSelectedPlayer(null);
  };
  
  const demoPlayers = allPlayers.map((playerId, index) => {
    // Проверяем, это бот или реальный игрок
    const isBot = playerId.startsWith('testBot');
    
    if (isBot) {
      // Для ботов создаем данные на основе ID
      const botNumber = playerId.split('_')[1] || '1';
      return {
        id: playerId,
        firstName: `Test${botNumber}`,
        lastName: 'Bot',
        isBot: true,
        matchesWon: 0,
        matchesLost: 0,
        pointsWon: 0,
        pointsLost: 0,
      };
    } else {
      // Для реальных игроков берем данные из getPlayerData
      const playerData = getPlayerData(playerId);
      return {
        id: playerId,
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        isBot: false,
        matchesWon: 0,
        matchesLost: 0,
        pointsWon: 0,
        pointsLost: 0,
      };
    }
  });

  const isUserJoined = tournament.players.includes(user?.id || '');
  const isCreator = tournament.createdBy === user?.id;
  // Показываем кнопку Join только если пользователь НЕ присоединился
  const canJoin = !isUserJoined && tournament.currentParticipants < tournament.maxParticipants;
  // Показываем кнопку Leave для всех участников, включая создателя
  const canLeave = isUserJoined;
  
  // Проверяем, можно ли запустить турнир (должно быть ровно 8 игроков)
  const canStartTournament = demoPlayers.length === 8;

  // Отладочная информация
  console.log('Tournament Debug:', {
    tournamentId: tournament.id,
    currentParticipants: tournament.currentParticipants,
    maxParticipants: tournament.maxParticipants,
    players: tournament.players,
    user: user?.id,
    isUserJoined,
    canJoin,
    canLeave,
    isCreator
  });
  
  console.log('Demo Players Debug:', {
    demoPlayersLength: demoPlayers.length,
    canStartTournament,
    allPlayersLength: allPlayers.length,
    demoPlayers: demoPlayers.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}` }))
  });
  
  console.log('Button visibility:', {
    canJoin,
    canLeave,
    isUserJoined,
    isCreator,
    showJoinButton: canJoin,
    showLeaveButton: canLeave,
    showJoinedBadge: isUserJoined,
    showCreatorInfo: isCreator && !isUserJoined
  });

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
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{tournament.name}</Text>
              <Text style={styles.headerSubtitle}>Singles Round Robin</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                  {/* Tournament Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="people" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                {tournament.currentParticipants}/{tournament.maxParticipants} registered
              </Text>
            </View>
            
            {/* Bot Management (Dev/Test Only) */}
            <View style={styles.botManagementRow}>
              <Text style={styles.botManagementLabel}>Add Test Bots:</Text>
              <TouchableOpacity 
                style={styles.addBotButton} 
                onPress={() => addTestBot()}
                disabled={allPlayers.length >= tournament.maxParticipants}
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.botCount}>Bots: {getBotCount()}</Text>
            </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              Starts: {tournament.startDate.toLocaleDateString()} at {tournament.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              <Text style={styles.timeLabel}>Time until start: </Text>
              <Text style={[
                styles.timeValue,
                { color: (() => {
                  const now = new Date();
                  const timeDiff = tournament.startDate.getTime() - now.getTime();
                  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  
                  if (timeDiff <= 0) return theme.colors.success; // Зеленый - время наступило
                  if (days > 1) return theme.colors.info; // Синий - много времени
                  if (days === 1) return theme.colors.warning; // Желтый - день до турнира
                  if (hours > 2) return theme.colors.warning; // Желтый - несколько часов
                  return theme.colors.error; // Красный - мало времени
                })() }
              ]}>
                {formatTimeUntilTournament(tournament.startDate)}
              </Text>
            </Text>
          </View>
          
          {tournament.endDate && tournament.endDate.getTime() !== tournament.startDate.getTime() && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                Ends: {tournament.endDate.toLocaleDateString()} at {tournament.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
          
          {tournament.registrationDeadline && tournament.registrationDeadline.getTime() !== tournament.startDate.getTime() && (
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                Registration deadline: {tournament.registrationDeadline.toLocaleDateString()} at {tournament.registrationDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              {tournament.location.city}
            </Text>
          </View>
          
          {/* Join Waiting List Button - показываем если турнир полный И пользователь НЕ в турнире */}
          {tournament.players.length >= tournament.maxParticipants && !tournament.players.includes(user?.id || '') && (
            <View style={styles.joinWaitingListSection}>
              <View style={styles.joinWaitingListHeader}>
                <Ionicons name="time-outline" size={20} color={theme.colors.warning} />
                <Text style={styles.joinWaitingListTitle}>Tournament is Full</Text>
              </View>
              <Text style={styles.joinWaitingListSubtitle}>
                All {tournament.maxParticipants} spots are taken. Join the waiting list to be notified when a spot opens up.
              </Text>
              <TouchableOpacity
                style={styles.joinWaitingListButton}
                onPress={() => handleJoinWaitingList()}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.joinWaitingListButtonText}>Join Waiting List</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Already on Waiting List - показываем если пользователь уже в Waiting List */}
          {tournament.waitingList && tournament.waitingList.includes(user?.id || '') && (
            <View style={[styles.joinWaitingListSection, styles.alreadyOnWaitingListSection]}>
              <View style={styles.joinWaitingListHeader}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <Text style={styles.joinWaitingListSubtitle}>
                  You are currently #{tournament.waitingList.indexOf(user?.id || '') + 1} in the waiting list.
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="basketball" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              {tournament.courtsCount} court{tournament.courtsCount !== 1 ? 's' : ''} available
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {canJoin && (
            <TouchableOpacity
              style={[styles.actionButton, styles.joinButton]}
              onPress={handleJoinTournament}
              disabled={isJoining}
            >
              <LinearGradient
                colors={[theme.colors.success, '#059669']}
                style={styles.buttonGradient}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.buttonText}>
                  {isJoining ? 'Joining...' : 'Join Tournament'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Chat Button - only show if user is joined */}
          {isUserJoined && (
            <TouchableOpacity
              style={[styles.actionButton, styles.chatButton]}
              onPress={() => {
                console.log('Opening tournament chat...');
                // TODO: Navigate to chat screen or open chat modal
                Alert.alert('Chat', 'Tournament chat will be available soon!');
              }}
            >
              <LinearGradient
                colors={[theme.colors.info, '#0EA5E9']}
                style={styles.buttonGradient}
              >
                <Ionicons name="chatbubbles" size={20} color="white" />
                <Text style={styles.buttonText}>Open Chat</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Start Tournament Button - show to creator only if tournament is still in registration */}
          {isCreator && tournament && tournament.status === TournamentStatus.REGISTRATION_OPEN && (
            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.startButton,
                !canStartTournament && styles.disabledButton
              ]}
              onPress={handleStartTournament}
              disabled={!canStartTournament}
            >
              <LinearGradient
                colors={canStartTournament ? [theme.colors.success, '#059669'] : [theme.colors.textSecondary, theme.colors.border]}
                style={styles.buttonGradient}
              >
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.buttonText}>
                  {canStartTournament ? 'Start Tournament' : `Need ${8 - demoPlayers.length} more players`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Edit Tournament Button - only show to creator if tournament hasn't started */}
          {isCreator && tournament && tournament.status === TournamentStatus.REGISTRATION_OPEN && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                console.log('Opening tournament edit...');
                (navigation as any).navigate('EditTournament', { tournamentId: tournament.id });
              }}
            >
              <LinearGradient
                colors={[theme.colors.warning, '#F59E0B']}
                style={styles.buttonGradient}
              >
                <Ionicons name="create" size={20} color="white" />
                <Text style={styles.buttonText}>Edit Tournament</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}



          {isCreator && !isUserJoined && (
            <View style={styles.creatorInfo}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.creatorText, { color: theme.colors.primary }]}>
                You created this tournament. Click "Join Tournament" to participate!
              </Text>
            </View>
          )}
        </View>

        {/* Tournament Tabs */}
        {(tournament?.status === TournamentStatus.IN_PROGRESS || tournament?.status === TournamentStatus.COMPLETED) && (
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'standings' && styles.activeTab
              ]}
              onPress={() => setActiveTab('standings')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'standings' && styles.activeTabText
              ]}>
                Standings
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'rounds' && styles.activeTab
              ]}
              onPress={() => setActiveTab('rounds')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'rounds' && styles.activeTabText
              ]}>
                Rounds
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tournament Content */}
        {activeTab === 'rounds' && (tournament?.status === TournamentStatus.IN_PROGRESS || tournament?.status === TournamentStatus.COMPLETED) ? (
          // Показываем раунды
          <TournamentRounds 
            tournament={tournament}
            onUpdateScore={handleUpdateScore}
            onEditScore={handleEditScore}
          />
        ) : activeTab === 'standings' && (tournament?.status === TournamentStatus.IN_PROGRESS || tournament?.status === TournamentStatus.COMPLETED) ? (
          // Показываем таблицу результатов для запущенного турнира
          <View style={styles.tableSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tournament Standings</Text>
              <Text style={styles.sectionSubtitle}>Final results</Text>
            </View>
            {tournament && tournament.players && tournament.players.length > 0 ? (
              <TournamentTable 
                tournament={tournament}
                onDeletePlayer={handleDeletePlayer}
                onViewProfile={handleViewProfile}
                onPromoteFromWaitingList={handlePromoteFromWaitingList}
                isCreator={isCreator}
              />
            ) : (
              <View style={styles.emptyTable}>
                <Ionicons name="people-outline" size={48} color={theme.colors.text} />
                <Text style={styles.emptyText}>No players to display</Text>
                <Text style={styles.emptySubtext}>Tournament has no participants</Text>
              </View>
            )}
          </View>
        ) : tournament?.status === TournamentStatus.REGISTRATION_OPEN ? (
          // Показываем таблицу участников до запуска турнира
          <View style={styles.tableSection}>
            {tournament && tournament.players && tournament.players.length > 0 ? (
              <TournamentTable 
                tournament={tournament}
                onDeletePlayer={handleDeletePlayer}
                onViewProfile={handleViewProfile}
                onPromoteFromWaitingList={handlePromoteFromWaitingList}
                isCreator={isCreator}
              />
            ) : (
              <View style={styles.emptyTable}>
                <Ionicons name="people-outline" size={48} color={theme.colors.text} />
                <Text style={styles.emptyText}>No participants yet</Text>
                <Text style={styles.emptySubtext}>Be the first to join!</Text>
              </View>
            )}
          </View>
        ) : null}



        {/* Bottom Action Buttons */}
        <View style={styles.bottomActionsSection}>
          {canLeave && (
            <TouchableOpacity
              style={[styles.bottomActionButton, styles.leaveButton]}
              onPress={handleLeaveTournament}
            >
              <LinearGradient
                colors={[theme.colors.error, '#DC2626']}
                style={styles.buttonGradient}
              >
                <Ionicons name="exit" size={20} color="white" />
                <Text style={styles.buttonText}>
                  {isCreator ? 'Leave as Creator' : 'Leave Tournament'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {isCreator && tournament?.status === TournamentStatus.IN_PROGRESS && (() => {
            // Проверяем завершены ли все матчи
            const allMatchesCompleted = tournament?.brackets?.[0]?.matches?.every((match: any) => 
              match.status === 'COMPLETED' || match.status === 'completed'
            ) || false;
            
            // Показываем кнопку только если все матчи завершены
            if (!allMatchesCompleted) return null;
            
            return (
              <TouchableOpacity
                style={[styles.bottomActionButton, styles.finishButton]}
                onPress={() => {
                  Alert.alert(
                    'Finish Tournament',
                    'Are you sure you want to finish this tournament? This action cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Finish',
                        style: 'default',
                        onPress: async () => {
                          try {
                            await updateTournament(tournament.id, {
                              status: TournamentStatus.COMPLETED,
                            });
                            showSuccess('Tournament finished successfully!');
                            // Обновляем локальное состояние
                            setTournament({
                              ...tournament,
                              status: TournamentStatus.COMPLETED,
                            });
                          } catch (error) {
                            showError('Failed to finish tournament. Please try again.');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <LinearGradient
                  colors={[theme.colors.success || '#10B981', '#059669']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="trophy" size={20} color="white" />
                  <Text style={styles.buttonText}>Finish Tournament</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })()}
          
          {isCreator && (
            <TouchableOpacity
                              style={[styles.bottomActionButton, styles.bottomDeleteButton]}
              onPress={() => {
                Alert.alert(
                  'Delete Tournament',
                  'Are you sure you want to delete this tournament? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await deleteTournament(tournament.id);
                          Alert.alert('Tournament Deleted', 'The tournament has been deleted.');
                          navigation.goBack();
                        } catch (error) {
                          Alert.alert('Error', 'Failed to delete tournament. Please try again.');
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <LinearGradient
                colors={['#DC2626', '#B91C1C']}
                style={styles.buttonGradient}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.buttonText}>Delete Tournament</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>


              </ScrollView>

        {/* Player Management Modal */}
        <Modal
          visible={showPlayerModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPlayerModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPlayerModal(false)}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedPlayer?.firstName} {selectedPlayer?.lastName}
                  </Text>
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => handleViewProfile(selectedPlayer?.id)}
                  >
                    <Text style={styles.profileButtonText}>Profile</Text>
                  </TouchableOpacity>
                  
                  {isCreator && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeletePlayer(selectedPlayer?.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    );
  };

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingVertical: 16,
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
    paddingTop: 0,
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  timeLabel: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionSection: {
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
  bottomActionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  bottomActionButton: {
    flex: 1,
  },
  joinButton: {
    // Default styles
  },
  leaveButton: {
    // Default styles
  },
  chatButton: {
    // Uses LinearGradient instead of backgroundColor
  },
  startButton: {
    // Uses LinearGradient instead of backgroundColor
  },
  editButton: {
    // Uses LinearGradient instead of backgroundColor
  },
  bottomDeleteButton: {
    // Default styles
  },
  finishButton: {
    backgroundColor: theme.colors.success || '#10B981',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  tableSection: {
    marginBottom: 20,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginTop: 8,
  },
  creatorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyTable: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary || theme.colors.text,
    opacity: 0.7,
  },

  botManagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  botManagementLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  addBotButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  botCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    minWidth: 60,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  profileButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  profileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: theme.colors.error || '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Tab styles
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: 'white',
  },
  // Waiting List styles
  waitingListSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  waitingListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  waitingListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  waitingListContent: {
    gap: 8,
  },
  waitingListPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  waitingListPosition: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    minWidth: 30,
  },
  waitingListPlayerName: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  promoteButton: {
    backgroundColor: theme.colors.success,
    padding: 8,
    borderRadius: 6,
  },
  // Join Waiting List styles
  joinWaitingListSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: theme.colors.warning + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  joinWaitingListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  joinWaitingListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.warning,
    marginLeft: 8,
  },
  joinWaitingListSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  joinWaitingListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.warning,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  joinWaitingListButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Already on Waiting List styles
  alreadyOnWaitingListSection: {
    backgroundColor: theme.colors.success + '20',
    borderColor: theme.colors.success,
  },
  // Section header styles
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default SinglesRoundRobinScreen;
