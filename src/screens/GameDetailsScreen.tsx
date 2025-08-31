import React, { useEffect, useState } from 'react';
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
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Game, GameFormat, SkillLevel, GameStatus } from '../types';
import AddPlayersModal from '../components/AddPlayersModal';

const GameDetailsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { getGameById, leaveGame, joinGame } = useGameStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const route = useRoute();
  
  const gameId = (route.params as any)?.gameId;
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPlayersModal, setShowAddPlayersModal] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    if (gameId) {
      const foundGame = getGameById(gameId);
      setGame(foundGame || null);
      setIsLoading(false);
    }
  }, [gameId, getGameById]);

  const handleLeaveGame = () => {
    if (!game || !user?.id) return;
    
    Alert.alert(
      'Leave Game',
      `Are you sure you want to leave "${game.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveGame(game.id, user.id);
            // Navigate back to Games list instead of just going back
            navigation.navigate('Games' as any);
          },
        },
      ]
    );
  };

  const handleShareGame = () => {
    if (!game) return;
    
    Alert.alert(
      'Share Game',
      `Share "${game.title}" with other players!`,
      [
        { text: 'Copy Link', onPress: () => Alert.alert('Copied!', 'Game link copied to clipboard') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getFormatDisplayName = (format: GameFormat) => {
    switch (format) {
      case GameFormat.SINGLES:
        return '1v1 Singles';
      case GameFormat.DOUBLES:
        return '2v2 Doubles';
      case GameFormat.OPEN_PLAY:
        return 'Open Play';
      default:
        return format;
    }
  };

  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case GameStatus.UPCOMING:
        return theme.colors.success;
      case GameStatus.IN_PROGRESS:
        return theme.colors.info;
      case GameStatus.COMPLETED:
        return theme.colors.textSecondary;
      case GameStatus.CANCELLED:
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: GameStatus) => {
    switch (status) {
      case GameStatus.UPCOMING:
        return 'Upcoming';
      case GameStatus.IN_PROGRESS:
        return 'In Progress';
      case GameStatus.COMPLETED:
        return 'Completed';
      case GameStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading game details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!game) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Game Not Found</Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            The game you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPlayerInGame = game.players.includes(user?.id || '');
  const canJoinGame = !isPlayerInGame && game.currentPlayers < game.maxPlayers;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.headerTitle}>{game.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(game.status) }]}>
                <Text style={styles.statusText}>{getStatusText(game.status)}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Game Info */}
        <View style={styles.content}>
          {/* Description */}
          {game.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{game.description}</Text>
            </View>
          )}

          {/* Game Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Details</Text>
            {/* Row 1: Format & Players */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="game-controller" size={20} color={theme.colors.primary} />
                <Text style={styles.detailLabel}>Format</Text>
                <Text style={styles.detailValue}>{getFormatDisplayName(game.format)}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
                <Text style={styles.detailLabel}>Players</Text>
                <Text style={styles.detailValue}>
                  {game.currentPlayers}/{game.maxPlayers}
                </Text>
              </View>
            </View>
            
            {/* Row 2: Skill Level & Start Time */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="star" size={20} color={theme.colors.primary} />
                <Text style={styles.detailLabel}>Skill Level</Text>
                <Text style={styles.detailValue}>{game.skillLevel}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="time" size={20} color={theme.colors.primary} />
                <Text style={styles.detailLabel}>Start Time</Text>
                <Text style={styles.detailValue}>
                  {game.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={24} color={theme.colors.primary} />
              <Text style={styles.locationText}>{game.location.city}</Text>
            </View>
          </View>

          {/* Privacy Setting */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <View style={styles.privacyContainer}>
              <Ionicons 
                name={game.isPrivate ? "lock-closed" : "globe"} 
                size={24} 
                color={game.isPrivate ? theme.colors.warning : theme.colors.success} 
              />
              <Text style={styles.privacyText}>
                {game.isPrivate ? 'Private Game' : 'Public Game'}
              </Text>
            </View>
          </View>

          {/* Players List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Players</Text>
              {game.currentPlayers < game.maxPlayers && (
                <View style={styles.addPlayersContainer}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddPlayersModal(true)}
                  >
                    <Ionicons name="add" size={24} color={theme.colors.primary} />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.qrButton}
                    onPress={() => setShowAddPlayersModal(true)}
                  >
                    <Ionicons name="qr-code" size={24} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.playersContainer}>
              {game.players.length > 0 ? (
                game.players.map((playerId, index) => (
                  <View key={playerId} style={styles.playerItem}>
                    <View style={styles.playerAvatar}>
                      <Text style={styles.playerInitial}>
                        {playerId === user?.id ? 'You' : playerId === game.createdBy ? 'Host' : `P${index + 1}`}
                      </Text>
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>
                        {playerId === user?.id ? 'You' : playerId === game.createdBy ? 'Host' : `Player ${index + 1}`}
                      </Text>
                      <Text style={styles.playerRole}>
                        {playerId === game.createdBy ? 'Game Creator' : 'Player'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noPlayersText}>No players joined yet</Text>
              )}
            </View>
          </View>

          {/* Empty Slots */}
          {game.currentPlayers < game.maxPlayers && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Slots</Text>
              <View style={styles.slotsContainer}>
                {Array.from({ length: game.maxPlayers - game.currentPlayers }, (_, index) => (
                  <View key={index} style={styles.emptySlot}>
                    <Ionicons name="person-add" size={20} color={theme.colors.textSecondary} />
                    <Text style={styles.emptySlotText}>Open</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsSection}>
            {isPlayerInGame ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.leaveButton]}
                onPress={handleLeaveGame}
              >
                <Ionicons name="exit-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Leave Game</Text>
              </TouchableOpacity>
            ) : canJoinGame ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.joinButton]}
                onPress={async () => {
                  if (game && user?.id) {
                    // Actually join the game using the store
                    await joinGame(game.id, user.id);
                    // Navigate back to Games list to show updated state
                    navigation.navigate('Games' as any);
                  }
                }}
              >
                <Ionicons name="enter-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Join Game</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.actionButton, styles.fullButton]}>
                <Ionicons name="close-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>Game Full</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShareGame}
            >
              <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Add Players Modal */}
      <AddPlayersModal
        visible={showAddPlayersModal}
        onClose={() => setShowAddPlayersModal(false)}
        game={game}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addPlayersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  qrButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
    ...theme.shadows?.sm,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
    ...theme.shadows?.sm,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
    ...theme.shadows?.sm,
  },
  privacyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  playersContainer: {
    gap: theme.spacing.sm,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
    ...theme.shadows?.sm,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  playerRole: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  noPlayersText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: theme.spacing.lg,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  emptySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
    opacity: 0.6,
    ...theme.shadows?.sm,
  },
  emptySlotText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows?.md,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
  },
  leaveButton: {
    backgroundColor: theme.colors.error,
  },
  fullButton: {
    backgroundColor: theme.colors.textSecondary,
  },
  shareButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GameDetailsScreen;
