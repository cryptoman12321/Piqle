import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Game, GameFormat, SkillLevel, GameStatus, MainTabParamList, GamesStackParamList } from '../types';
import { userService } from '../services/userService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type GamesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Games'>,
  NativeStackNavigationProp<GamesStackParamList>
>;

const GamesScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { games, loadGames, joinGame, deleteGame, isLoading, error } = useGameStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<GamesScreenNavigationProp>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<GameFormat | 'ALL'>('ALL');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Load games when component mounts
  useEffect(() => {
    loadGames();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGames();
    setRefreshing(false);
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormat === 'ALL' || game.format === selectedFormat;
    const matchesSkill = selectedSkillLevel === 'ALL' || game.skillLevel === selectedSkillLevel;
    
    return matchesSearch && matchesFormat && matchesSkill;
  });

  const handleJoinGame = async (game: Game) => {
    if (game.currentPlayers >= game.maxPlayers) {
      alert('This game is full!');
      return;
    }
    
    if (!user?.id) {
      alert('Please log in to join games');
      return;
    }
    
    // Join the game using the store
    await joinGame(game.id, user.id);
    
    // Navigate to the game lobby/details
    navigation.navigate('GameDetails', { gameId: game.id });
  };

  const handleCreateGame = () => {
    navigation.navigate('CreateGame' as any);
  };

  const handleDeleteGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    // Double-check permissions
    if (!canDeleteGame(game)) {
      Alert.alert('Access Denied', 'You can only delete games that you created.');
      return;
    }
    
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteGame(gameId, user?.id)
        },
      ]
    );
  };



  const canDeleteGame = (game: Game) => {
    return user?.id === game.createdBy;
  };

  // Render player circles
  const renderPlayerCircles = (game: Game) => {
    const circles = [];
    
    // Add existing players
    for (let i = 0; i < game.players.length; i++) {
      const playerId = game.players[i];
      const player = userService.getUserById(playerId);
      const initials = player ? `${player.firstName[0]}${player.lastName[0]}` : '?';
      const isCurrentUser = playerId === user?.id;
      
      circles.push(
        <View key={`player-${i}`} style={[styles.playerCircle, isCurrentUser && styles.currentUserCircle]}>
          <Text style={styles.playerInitials}>{initials}</Text>
        </View>
      );
    }
    
    // Add empty slots or plus buttons
    for (let i = game.players.length; i < game.maxPlayers; i++) {
      if (!game.players.includes(user?.id || '')) {
        // Show plus button for joining if user is not in the game
        circles.push(
          <TouchableOpacity 
            key={`plus-${i}`} 
            style={styles.plusCircle}
            onPress={(e) => {
              e.stopPropagation();
              handleJoinGame(game);
            }}
          >
            <Ionicons name="add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        );
      } else {
        // Show empty slot if user is already in the game
        circles.push(
          <View key={`empty-${i}`} style={styles.emptyCircle} />
        );
      }
    }
    
    // Add VS between teams for all games
    let displayCircles = circles;
    if (game.format === GameFormat.SINGLES && game.maxPlayers === 2) {
      // Insert VS between 1v1 players
      displayCircles = [
        circles[0],
        <View key="vs" style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>,
        circles[1]
      ];
    } else if (game.format === GameFormat.DOUBLES && game.maxPlayers === 4) {
      // Insert VS after 2nd player for 2v2 games
      displayCircles = [
        ...circles.slice(0, 2),
        <View key="vs" style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>,
        ...circles.slice(2)
      ];
    }
    
    return (
      <View style={styles.playersContainer}>
        <Text style={styles.playersLabel}>Players ({game.players.length}/{game.maxPlayers})</Text>
        <View style={styles.playerCircles}>
          {displayCircles}
        </View>
        
        {/* Show match result if completed */}
        {game.result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              {game.result.matches.map((match, index) => 
                `${match.team1Score}-${match.team2Score}`
              ).join(', ')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderGameCard = ({ item: game }: { item: Game }) => (
    <TouchableOpacity 
      style={styles.gameCard}
      onPress={() => navigation.navigate('GameDetails', { gameId: game.id })}
    >
      <View style={styles.gameCardHeader}>
        <Text style={styles.gameTitle}>{game.title}</Text>
        <View style={[styles.gameStatus, { backgroundColor: theme.colors.success }]}>
          <Text style={styles.gameStatusText}>{game.status}</Text>
        </View>
      </View>
      
      {game.description && (
        <Text style={styles.gameDescription}>{game.description}</Text>
      )}
      
      {/* Player Circles */}
      {renderPlayerCircles(game)}
      
      <View style={styles.gameDetails}>
        <View style={styles.gameDetail}>
          <Ionicons name="game-controller" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.gameDetailText}>
            {game.format === GameFormat.SINGLES ? '1v1' : 
             game.format === GameFormat.DOUBLES ? '2v2' : 'Open Play'}
          </Text>
        </View>
        
        <View style={styles.gameDetail}>
          <Ionicons name="star" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.gameDetailText}>{game.skillLevel}</Text>
        </View>
        
        <View style={styles.gameDetail}>
          <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.gameDetailText}>
            {game.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        <View style={styles.gameDetail}>
          <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.gameDetailText}>{game.location.city}</Text>
        </View>
      </View>
      
      <View style={styles.gameActions}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          
          {canDeleteGame(game) && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteGame(game.id)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header Section - Never Overlapped */}
      <View style={styles.fixedHeader}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find Games</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateGame}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.createButtonGradient}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.createButtonText}>Create</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search games..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {/* Format Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Format:</Text>
            <View style={styles.filterOptions}>
              {['ALL', ...Object.values(GameFormat)].map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.filterOption,
                    selectedFormat === format && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedFormat(format as any)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFormat === format && styles.filterOptionTextSelected
                  ]}>
                    {format === 'ALL' ? 'All' : 
                     format === GameFormat.SINGLES ? '1v1' : 
                     format === GameFormat.DOUBLES ? '2v2' : 'Open'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Skill Level Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Skill:</Text>
            <View style={styles.filterOptions}>
              {['ALL', ...Object.values(SkillLevel)].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterOption,
                    selectedSkillLevel === level && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedSkillLevel(level as any)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedSkillLevel === level && styles.filterOptionTextSelected
                  ]}>
                    {level === 'ALL' ? 'All' : level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Content Section - Below Fixed Header */}
      <View style={styles.contentContainer}>
        {/* Loading State */}
        {isLoading && !refreshing && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading games...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadGames}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Games List */}
        {!isLoading && !error && (
          <FlatList
            data={filteredGames}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.gamesList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="game-controller-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={styles.emptyTitle}>No games found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || selectedFormat !== 'ALL' || selectedSkillLevel !== 'ALL' 
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to create a game!'}
                </Text>
                <TouchableOpacity style={styles.createFirstGameButton} onPress={handleCreateGame}>
                  <Text style={styles.createFirstGameButtonText}>Create First Game</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: Platform.OS === 'android' ? 40 : 0,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },


  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  createButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  filterGroup: {
    marginRight: theme.spacing.lg,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    marginTop: 280, // Adjust based on fixed header height
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  gamesList: {
    padding: theme.spacing.lg,
  },
  gameCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows?.sm,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  gameStatus: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  gameStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  gameDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  gameDetails: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  gameDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  gameDetailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  gameActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  joinButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  createFirstGameButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  createFirstGameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Player circles styles
  playersContainer: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  playersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  playerCircles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    justifyContent: 'center',
  },
  playerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentUserCircle: {
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  playerInitials: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  resultContainer: {
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
});

export default GamesScreen;
