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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import TournamentTable from '../components/TournamentTable';
import { Tournament, TournamentStatus } from '../types';
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
              // TODO: Implement tournament start logic
              Alert.alert('Tournament Started', 'The tournament has been started early!');
            }
          }
        ]
      );
    } else {
      // Tournament time has arrived - start normally
      console.log('Starting tournament on time...');
      // TODO: Implement tournament start logic
      Alert.alert('Tournament Started', 'The tournament has been started!');
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

  // Добавляем ботов для демонстрации, если участников меньше 8
  const addBotsIfNeeded = (players: string[]) => {
    if (players.length >= 8) return players;
    
    const bots = [
      'bot1', 'bot2', 'bot3', 'bot4', 'bot5', 'bot6', 'bot7'
    ];
    
    const botsToAdd = 8 - players.length;
    return [...players, ...bots.slice(0, botsToAdd)];
  };

  // Получаем данные ботов
  const getBotData = (botId: string) => {
    const botNames: { [key: string]: { firstName: string; lastName: string } } = {
      'bot1': { firstName: 'Alpha', lastName: 'Bot' },
      'bot2': { firstName: 'Beta', lastName: 'Bot' },
      'bot3': { firstName: 'Gamma', lastName: 'Bot' },
      'bot4': { firstName: 'Delta', lastName: 'Bot' },
      'bot5': { firstName: 'Epsilon', lastName: 'Bot' },
      'bot6': { firstName: 'Zeta', lastName: 'Bot' },
      'bot7': { firstName: 'Eta', lastName: 'Bot' },
    };
    
    return botNames[botId] || { firstName: 'Bot', lastName: 'Unknown' };
  };

  // Добавляем ботов для демонстрации
  const allPlayers = addBotsIfNeeded(tournament.players);
  
  const demoPlayers = allPlayers.map((playerId, index) => {
    // Проверяем, является ли это ботом
    if (playerId.startsWith('bot')) {
      const botData = getBotData(playerId);
      return {
        id: playerId,
        firstName: botData.firstName,
        lastName: botData.lastName,
        isBot: true,
        matchesWon: 0,
        matchesLost: 0,
        pointsWon: 0,
        pointsLost: 0,
      };
    } else {
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{tournament.name}</Text>
              <Text style={styles.headerSubtitle}>Singles Round Robin</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tournament Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="people" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              {tournament.currentParticipants}/{tournament.maxParticipants} participants
              {demoPlayers.length > tournament.currentParticipants && (
                <Text style={{ color: theme.colors.textSecondary }}>
                  {' '}(+{demoPlayers.length - tournament.currentParticipants} bots)
                </Text>
              )}
            </Text>
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

          {/* Start Tournament Button - only show to creator if tournament hasn't started */}
          {isCreator && tournament && tournament.status === TournamentStatus.REGISTRATION_OPEN && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={handleStartTournament}
            >
              <LinearGradient
                colors={[theme.colors.success, '#059669']}
                style={styles.buttonGradient}
              >
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.buttonText}>Start Tournament</Text>
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

        {/* Tournament Table */}
        <View style={styles.tableSection}>
          {demoPlayers.length > 0 ? (
            <TournamentTable players={demoPlayers} />
          ) : (
            <View style={styles.emptyTable}>
              <Ionicons name="people-outline" size={48} color={theme.colors.text} />
              <Text style={styles.emptyText}>No participants yet</Text>
              <Text style={styles.emptySubtext}>Be the first to join!</Text>
            </View>
          )}
        </View>



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
          
          {isCreator && (
            <TouchableOpacity
              style={[styles.bottomActionButton, styles.deleteButton]}
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

        {/* Debug Info */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>Players: {tournament.players.length}</Text>
          <Text style={styles.debugText}>Current: {tournament.currentParticipants}</Text>
          <Text style={styles.debugText}>Max: {tournament.maxParticipants}</Text>
          <Text style={styles.debugText}>Can Join: {canJoin ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Is Creator: {isCreator ? 'Yes' : 'No'}</Text>
        </View>
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
  deleteButton: {
    // Default styles
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
  debugSection: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  debugText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },

});

export default SinglesRoundRobinScreen;
