import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Game, GameFormat, GameResult, MatchResult } from '../types';
import { userService } from '../services/userService';

const { width } = Dimensions.get('window');

interface TeamAssignment {
  team1: string[];
  team2: string[];
}

const StartMatchScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { getGameById, saveGameResult } = useGameStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  const gameId = (route.params as any)?.gameId;
  const [game, setGame] = useState<Game | null>(null);
  const [teamAssignment, setTeamAssignment] = useState<TeamAssignment>({ team1: [], team2: [] });
  const [scores, setScores] = useState<{ [key: string]: number | undefined }>({});
  const [currentGame, setCurrentGame] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ team: 'team1' | 'team2', index: number } | null>(null);

  const styles = createStyles(theme);

  useEffect(() => {
    if (gameId) {
      const foundGame = getGameById(gameId);
      setGame(foundGame || null);
      setIsLoading(false);
      
      if (foundGame) {
        // Auto-assign teams based on game format
        initializeTeams(foundGame);
      }
    }
  }, [gameId, getGameById]);

  const initializeTeams = (game: Game) => {
    const players = [...game.players];
    
    if (game.format === GameFormat.SINGLES) {
      // 1v1: creator vs first other player
      const otherPlayer = players.find(id => id !== game.createdBy);
      setTeamAssignment({
        team1: [game.createdBy, ''], // Second slot empty for singles
        team2: [otherPlayer || '', '']
      });
    } else if (game.format === GameFormat.DOUBLES) {
      // 2v2: creator + first player vs other two
      const otherPlayers = players.filter(id => id !== game.createdBy);
      setTeamAssignment({
        team1: [game.createdBy, otherPlayers[0] || ''],
        team2: [otherPlayers[1] || '', otherPlayers[2] || '']
      });
    } else {
      // Open play: creator + first player vs others
      const otherPlayers = players.filter(id => id !== game.createdBy);
      setTeamAssignment({
        team1: [game.createdBy, otherPlayers[0] || ''],
        team2: [otherPlayers[1] || '', otherPlayers[2] || '']
      });
    }
  };

  const handlePlayerCardPress = (team: 'team1' | 'team2', index: number) => {
    setSelectedPosition({ team, index });
    setShowPlayerSelector(true);
  };

  const handlePlayerSelect = (playerId: string) => {
    if (!selectedPosition) return;

    setTeamAssignment(prev => {
      const newAssignment = { ...prev };
      const { team, index } = selectedPosition;
      
      // Remove player from current position if exists
      const currentPlayerId = newAssignment[team][index];
      if (currentPlayerId) {
        // Find where the selected player currently is and swap
        for (const teamKey of ['team1', 'team2'] as const) {
          const playerIndex = newAssignment[teamKey].indexOf(playerId);
          if (playerIndex !== -1) {
            newAssignment[teamKey][playerIndex] = currentPlayerId;
            break;
          }
        }
      } else {
        // Remove player from their current position
        for (const teamKey of ['team1', 'team2'] as const) {
          const playerIndex = newAssignment[teamKey].indexOf(playerId);
          if (playerIndex !== -1) {
            newAssignment[teamKey].splice(playerIndex, 1);
            break;
          }
        }
      }
      
      // Set player to new position
      newAssignment[team][index] = playerId;
      
      return newAssignment;
    });

    setShowPlayerSelector(false);
    setSelectedPosition(null);
  };

  const getAvailablePlayers = () => {
    if (!game) return [];
    
    return game.players.filter(playerId => {
      if (!selectedPosition) return false;
      const { team, index } = selectedPosition;
      const currentPlayerId = teamAssignment[team][index];
      
      // Don't show current player in this position
      return playerId !== currentPlayerId;
    });
  };

  const addGame = () => {
    setCurrentGame(prev => prev + 1);
    setScores(prev => ({
      ...prev,
      [`game${currentGame + 1}_team1`]: 0,
      [`game${currentGame + 1}_team2`]: 0
    }));
  };

  const updateScore = (gameNum: number, team: 'team1' | 'team2', score: string) => {
    // If empty string, store as undefined to show placeholder
    if (score === '') {
      setScores(prev => ({
        ...prev,
        [`game${gameNum}_${team}`]: undefined
      }));
      return;
    }
    
    const numScore = parseInt(score) || 0;
    setScores(prev => ({
      ...prev,
      [`game${gameNum}_${team}`]: numScore
    }));
  };

  const handleSubmit = async () => {
    // Validate scores
    const hasValidScores = Object.keys(scores).length > 0 && 
      Object.values(scores).some(score => score !== undefined && score > 0);
    
    if (!hasValidScores) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter at least some scores before submitting.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (!game) return;

    try {
      // Prepare match results
      const matches: MatchResult[] = [];
      for (let i = 1; i <= currentGame; i++) {
        const team1Score = scores[`game${i}_team1`];
        const team2Score = scores[`game${i}_team2`];
        
        if (team1Score !== undefined || team2Score !== undefined) {
          matches.push({
            gameNumber: i,
            team1Score: team1Score || 0,
            team2Score: team2Score || 0,
          });
        }
      }

      // Prepare game result
      const gameResult: GameResult = {
        team1Players: teamAssignment.team1.filter(id => id !== ''),
        team2Players: teamAssignment.team2.filter(id => id !== ''),
        matches,
        completedAt: new Date(),
      };

      // Save the result
      await saveGameResult(game.id, gameResult);

      Toast.show({
        type: 'success',
        text1: 'Match Complete! 🎉',
        text2: 'Match results have been saved successfully.',
        position: 'top',
        visibilityTime: 2000,
        onHide: () => navigation.navigate('GameDetails', { gameId: game?.id })
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save match results. Please try again.',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = userService.getUserById(playerId);
    if (player) {
      const isOwner = playerId === game?.createdBy;
      const name = isOwner ? `${player.firstName} (Owner)` : `${player.firstName} ${player.lastName}`;
      return name.length > 12 ? `${name.substring(0, 9)}...` : name;
    }
    return 'Unknown';
  };

  const getPlayerAvatar = (playerId: string) => {
    const player = userService.getUserById(playerId);
    if (player) {
      return `${player.firstName[0]}${player.lastName[0]}`;
    }
    return playerId === user?.id ? 'Y' : 'P';
  };

  if (isLoading || !game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Start Match</Text>
            <Text style={styles.headerSubtitle}>{game.title}</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Team Assignment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Assignment</Text>
          
          <View style={styles.teamsContainer}>
            {/* Team 1 */}
            <View style={styles.teamContainer}>
              <Text style={styles.teamLabel}>Team 1</Text>
              <View style={styles.teamPlayers}>
                {[0, 1].map((index) => {
                  const playerId = teamAssignment.team1[index];
                  if (playerId && playerId !== '') {
                    return (
                      <TouchableOpacity
                        key={`team1-${index}`}
                        style={styles.playerCard}
                        onPress={() => handlePlayerCardPress('team1', index)}
                      >
                        <View style={styles.playerAvatar}>
                          <Text style={styles.playerInitial}>{getPlayerAvatar(playerId)}</Text>
                        </View>
                        <Text style={styles.playerName}>{getPlayerName(playerId)}</Text>
                        <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <TouchableOpacity
                        key={`team1-empty-${index}`}
                        style={styles.emptyPlayerSlot}
                        onPress={() => handlePlayerCardPress('team1', index)}
                      >
                        <Ionicons name="person-add" size={20} color={theme.colors.textSecondary} />
                        <Text style={styles.emptySlotText}>Add Player</Text>
                      </TouchableOpacity>
                    );
                  }
                })}
              </View>
            </View>

            {/* VS Label */}
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Team 2 */}
            <View style={styles.teamContainer}>
              <Text style={styles.teamLabel}>Team 2</Text>
              <View style={styles.teamPlayers}>
                {[0, 1].map((index) => {
                  const playerId = teamAssignment.team2[index];
                  if (playerId && playerId !== '') {
                    return (
                      <TouchableOpacity
                        key={`team2-${index}`}
                        style={styles.playerCard}
                        onPress={() => handlePlayerCardPress('team2', index)}
                      >
                        <View style={styles.playerAvatar}>
                          <Text style={styles.playerInitial}>{getPlayerAvatar(playerId)}</Text>
                        </View>
                        <Text style={styles.playerName}>{getPlayerName(playerId)}</Text>
                        <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <TouchableOpacity
                        key={`team2-empty-${index}`}
                        style={styles.emptyPlayerSlot}
                        onPress={() => handlePlayerCardPress('team2', index)}
                      >
                        <Ionicons name="person-add" size={20} color={theme.colors.textSecondary} />
                        <Text style={styles.emptySlotText}>Add Player</Text>
                      </TouchableOpacity>
                    );
                  }
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Score Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Scores</Text>
          
          {Array.from({ length: currentGame }, (_, index) => {
            const gameNum = index + 1;
            return (
              <View key={gameNum} style={styles.gameScoreContainer}>
                <Text style={styles.gameLabel}>Game {gameNum}</Text>
                <View style={styles.scoreInputs}>
                  <View style={styles.scoreInput}>
                    <Text style={styles.scoreLabel}>Team 1</Text>
                    <TextInput
                      style={styles.scoreTextInput}
                      value={scores[`game${gameNum}_team1`] !== undefined ? scores[`game${gameNum}_team1`]!.toString() : ''}
                      onChangeText={(text) => updateScore(gameNum, 'team1', text)}
                      onFocus={(e) => {
                        const currentValue = scores[`game${gameNum}_team1`];
                        if (currentValue === 0 || currentValue === undefined) {
                          updateScore(gameNum, 'team1', '');
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  
                  <View style={styles.scoreInput}>
                    <Text style={styles.scoreLabel}>Team 2</Text>
                    <TextInput
                      style={styles.scoreTextInput}
                      value={scores[`game${gameNum}_team2`] !== undefined ? scores[`game${gameNum}_team2`]!.toString() : ''}
                      onChangeText={(text) => updateScore(gameNum, 'team2', text)}
                      onFocus={(e) => {
                        const currentValue = scores[`game${gameNum}_team2`];
                        if (currentValue === 0 || currentValue === undefined) {
                          updateScore(gameNum, 'team2', '');
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                </View>
              </View>
            );
          })}
          
          <TouchableOpacity style={styles.addGameButton} onPress={addGame}>
            <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.addGameButtonText}>Add a game</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.submitButtonText}>Submit and Finish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Player Selector Modal */}
      <Modal
        visible={showPlayerSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlayerSelector(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlayerSelector(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Player</Text>
              <TouchableOpacity
                onPress={() => setShowPlayerSelector(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.playerList}>
              {getAvailablePlayers().map((playerId) => (
                <TouchableOpacity
                  key={playerId}
                  style={styles.playerOption}
                  onPress={() => handlePlayerSelect(playerId)}
                >
                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerInitial}>{getPlayerAvatar(playerId)}</Text>
                  </View>
                  <Text style={styles.playerOptionName}>{getPlayerName(playerId)}</Text>
                  <Ionicons name="checkmark" size={20} color={theme.colors.success} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
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
    marginBottom: theme.spacing.lg,
  },
  headerGradient: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  teamPlayers: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
    width: width * 0.38,
    height: 50,
    justifyContent: 'space-between',
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  emptyPlayerSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
    width: width * 0.38,
    height: 50,
    opacity: 0.6,
    justifyContent: 'center',
  },
  emptySlotText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  vsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  gameScoreContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gameLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  scoreInputs: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  scoreInput: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  scoreTextInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    minWidth: 60,
  },
  addGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  addGameButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  submitSection: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    ...theme.shadows?.md,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '70%',
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  playerList: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  playerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  playerOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
  },
});

export default StartMatchScreen;
