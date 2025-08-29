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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigation } from '@react-navigation/native';
import { Game, GameFormat, SkillLevel, GameStatus } from '../types';

const GamesScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { games, loadGames, joinGame, isLoading, error } = useGameStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  
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
    joinGame(game.id, user.id);
    
    // Navigate to the game lobby/details
    navigation.navigate('GameDetails' as never, { gameId: game.id } as never);
  };

  const handleCreateGame = () => {
    navigation.navigate('CreateGame' as never);
  };

  const renderGameCard = ({ item: game }: { item: Game }) => (
    <TouchableOpacity 
      style={styles.gameCard}
      onPress={() => navigation.navigate('GameDetails' as never, { gameId: game.id } as never)}
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
      
      <View style={styles.gameDetails}>
        <View style={styles.gameDetail}>
          <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.gameDetailText}>
            {game.currentPlayers}/{game.maxPlayers} players
          </Text>
        </View>
        
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
        <TouchableOpacity 
          style={[styles.joinButton, game.currentPlayers >= game.maxPlayers && styles.joinButtonDisabled]}
          onPress={() => handleJoinGame(game)}
          disabled={game.currentPlayers >= game.maxPlayers}
        >
          <Text style={styles.joinButtonText}>
            {game.currentPlayers >= game.maxPlayers ? 'Full' : 'Join Game'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
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
    fontWeight: '600',
  },
  gamesList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
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
    gap: theme.spacing.xs,
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
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  joinButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    padding: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
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
});

export default GamesScreen;
