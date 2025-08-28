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
import { useNavigation } from '@react-navigation/native';
import { Game, GameFormat, SkillLevel, GameStatus } from '../types';

const GamesScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<GameFormat | 'ALL'>('ALL');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [games, setGames] = useState<Game[]>([]);

  // Mock data - in real app this would come from API
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockGames: Game[] = [
      {
        id: '1',
        title: 'Morning Pickleball',
        description: 'Early morning doubles game at Central Park',
        format: GameFormat.DOUBLES,
        maxPlayers: 4,
        currentPlayers: 3,
        skillLevel: SkillLevel.INTERMEDIATE,
        location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        isPrivate: false,
        createdBy: 'user1',
        players: [],
        status: GameStatus.UPCOMING,
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Weekend Tournament',
        description: 'Competitive singles tournament for advanced players',
        format: GameFormat.SINGLES,
        maxPlayers: 16,
        currentPlayers: 12,
        skillLevel: SkillLevel.ADVANCED,
        location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isPrivate: false,
        createdBy: 'user2',
        players: [],
        status: GameStatus.UPCOMING,
        createdAt: new Date(),
      },
      {
        id: '3',
        title: 'Open Play Session',
        description: 'Casual open play for all skill levels',
        format: GameFormat.OPEN_PLAY,
        maxPlayers: 20,
        currentPlayers: 8,
        skillLevel: SkillLevel.BEGINNER,
        location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        isPrivate: false,
        createdBy: 'user3',
        players: [],
        status: GameStatus.UPCOMING,
        createdAt: new Date(),
      },
      {
        id: '4',
        title: 'Evening Doubles',
        description: 'Relaxed evening game under the lights',
        format: GameFormat.DOUBLES,
        maxPlayers: 4,
        currentPlayers: 2,
        skillLevel: SkillLevel.INTERMEDIATE,
        location: { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
        startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        isPrivate: false,
        createdBy: 'user4',
        players: [],
        status: GameStatus.UPCOMING,
        createdAt: new Date(),
      },
    ];
    
    setGames(mockGames);
  };

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
    
    // Simulate joining
    alert(`You've joined "${game.title}"!`);
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

      {/* Games List */}
      <FlatList
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gamesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
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
    borderRadius: theme.borderRadius.sm,
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
});

export default GamesScreen;
