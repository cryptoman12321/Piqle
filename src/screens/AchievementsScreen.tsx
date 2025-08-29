import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useAchievementsStore, Achievement, UserStats } from '../stores/achievementsStore';

const AchievementsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { 
    achievements, 
    userStats, 
    isLoading, 
    loadAchievements, 
    loadUserStats 
  } = useAchievementsStore();
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'GAMES' | 'TOURNAMENTS' | 'SOCIAL' | 'SKILL' | 'SPECIAL'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    loadAchievements();
    loadUserStats();
  }, [loadAchievements, loadUserStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAchievements(), loadUserStats()]);
    setRefreshing(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return theme.colors.textSecondary;
      case 'RARE': return theme.colors.info;
      case 'EPIC': return theme.colors.primary;
      case 'LEGENDARY': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'ellipse-outline';
      case 'RARE': return 'diamond-outline';
      case 'EPIC': return 'star';
      case 'LEGENDARY': return 'star-sharp';
      default: return 'ellipse-outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'GAMES': return 'game-controller';
      case 'TOURNAMENTS': return 'trophy';
      case 'SOCIAL': return 'people';
      case 'SKILL': return 'trending-up';
      case 'SPECIAL': return 'sparkles';
      default: return 'help-circle';
    }
  };

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return achievements;
    }
    return achievements.filter(achievement => achievement.category === selectedCategory);
  };

  const getCategoryStats = () => {
    const categories = ['GAMES', 'TOURNAMENTS', 'SOCIAL', 'SKILL', 'SPECIAL'];
    return categories.map(category => {
      const categoryAchievements = achievements.filter(a => a.category === category);
      const unlockedCount = categoryAchievements.filter(a => a.isUnlocked).length;
      const totalPoints = categoryAchievements
        .filter(a => a.isUnlocked)
        .reduce((sum, a) => sum + a.points, 0);
      
      return {
        id: category,
        name: category,
        icon: getCategoryIcon(category),
        unlockedCount,
        totalCount: categoryAchievements.length,
        totalPoints,
      };
    });
  };

  const getTotalPoints = () => {
    return achievements
      .filter(a => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0);
  };

  const getUnlockedCount = () => {
    return achievements.filter(a => a.isUnlocked).length;
  };

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'BRONZE': return '#CD7F32';
      case 'SILVER': return '#C0C0C0';
      case 'GOLD': return '#FFD700';
      case 'PLATINUM': return '#E5E4E2';
      case 'DIAMOND': return '#B9F2FF';
      default: return theme.colors.textSecondary;
    }
  };

  const filteredAchievements = getFilteredAchievements();
  const categoryStats = getCategoryStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Achievements</Text>
              <Text style={styles.headerSubtitle}>
                {getUnlockedCount()}/{achievements.length} unlocked • {getTotalPoints()} points
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="game-controller" size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{userStats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color={theme.colors.warning} />
              <Text style={styles.statValue}>{userStats.gamesWon}</Text>
              <Text style={styles.statLabel}>Games Won</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color={theme.colors.success} />
              <Text style={styles.statValue}>{userStats.winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color={theme.colors.info} />
              <Text style={styles.statValue}>{userStats.averageScore}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>

          <View style={styles.detailedStats}>
            <View style={styles.detailedStatRow}>
              <View style={styles.detailedStatItem}>
                <Ionicons name="flame" size={20} color={theme.colors.warning} />
                <Text style={styles.detailedStatLabel}>Current Streak</Text>
                <Text style={styles.detailedStatValue}>{userStats.currentWinStreak}</Text>
              </View>
              
              <View style={styles.detailedStatItem}>
                <Ionicons name="time" size={20} color={theme.colors.info} />
                <Text style={styles.detailedStatLabel}>Total Play Time</Text>
                <Text style={styles.detailedStatValue}>{formatPlayTime(userStats.totalPlayTime)}</Text>
              </View>
            </View>
            
            <View style={styles.detailedStatRow}>
              <View style={styles.detailedStatItem}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
                <Text style={styles.detailedStatLabel}>Friends</Text>
                <Text style={styles.detailedStatValue}>{userStats.friendsCount}</Text>
              </View>
              
              <View style={styles.detailedStatItem}>
                <View style={[styles.rankBadge, { backgroundColor: getRankColor(userStats.rank) }]}>
                  <Text style={styles.rankText}>{userStats.rank}</Text>
                </View>
                <Text style={styles.detailedStatLabel}>Rank</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === 'all' && { color: 'white' }
              ]}>
                All ({getUnlockedCount()}/{achievements.length})
              </Text>
            </TouchableOpacity>
            
            {categoryStats.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedCategory(category.id as any)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedCategory === category.id ? 'white' : theme.colors.textSecondary} 
                />
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && { color: 'white' }
                ]}>
                  {category.name} ({category.unlockedCount}/{category.totalCount})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading achievements...
              </Text>
            </View>
          ) : filteredAchievements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No achievements found
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Try selecting a different category or check back later for new achievements.
              </Text>
            </View>
          ) : (
            filteredAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementHeader}>
                  <View style={styles.achievementIcon}>
                    <Ionicons 
                      name={achievement.icon as any} 
                      size={32} 
                      color={achievement.isUnlocked ? theme.colors.primary : theme.colors.textSecondary} 
                    />
                    {achievement.isUnlocked && (
                      <View style={styles.unlockedBadge}>
                        <Ionicons name="checkmark" size={16} color="white" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.achievementInfo}>
                    <View style={styles.achievementTitleRow}>
                      <Text style={[
                        styles.achievementName,
                        !achievement.isUnlocked && { color: theme.colors.textSecondary }
                      ]}>
                        {achievement.name}
                      </Text>
                      <View style={styles.rarityContainer}>
                        <Ionicons 
                          name={getRarityIcon(achievement.rarity)} 
                          size={16} 
                          color={getRarityColor(achievement.rarity)} 
                        />
                        <Text style={[
                          styles.rarityText,
                          { color: getRarityColor(achievement.rarity) }
                        ]}>
                          {achievement.rarity}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={[
                      styles.achievementDescription,
                      !achievement.isUnlocked && { color: theme.colors.textSecondary }
                    ]}>
                      {achievement.description}
                    </Text>
                    
                    <View style={styles.achievementMeta}>
                      <View style={styles.pointsContainer}>
                        <Ionicons name="star" size={16} color={theme.colors.warning} />
                        <Text style={styles.pointsText}>{achievement.points} pts</Text>
                      </View>
                      
                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <Text style={styles.unlockedDate}>
                          Unlocked {achievement.unlockedAt.toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                          backgroundColor: achievement.isUnlocked ? theme.colors.success : theme.colors.primary
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {achievement.progress}/{achievement.maxProgress}
                  </Text>
                </View>
                
                {/* Requirements */}
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Requirements:</Text>
                  {achievement.requirements.map((requirement, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <Ionicons 
                        name={achievement.isUnlocked ? "checkmark-circle" : "ellipse-outline"} 
                        size={16} 
                        color={achievement.isUnlocked ? theme.colors.success : theme.colors.textSecondary} 
                      />
                      <Text style={[
                        styles.requirementText,
                        achievement.isUnlocked && { color: theme.colors.text }
                      ]}>
                        {requirement}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerGradient: {
    padding: theme.spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  detailedStats: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailedStatRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  detailedStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailedStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
  },
  detailedStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rankBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  filterSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  achievementsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  achievementCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  achievementHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  achievementIcon: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  unlockedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  achievementDescription: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  achievementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.warning,
  },
  unlockedDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  requirementsContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default AchievementsScreen;
