import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { GameFormat, SkillLevel, GameStatus } from '../types';
import { useNavigation } from '@react-navigation/native';

const CreateGameScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { addGame } = useGameStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  
  const [gameData, setGameData] = useState({
    title: '',
    description: '',
    format: GameFormat.DOUBLES,
    maxPlayers: 4,
    skillLevel: SkillLevel.INTERMEDIATE,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 2, // hours
    isPrivate: false,
    location: '',
    price: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGame = async () => {
    if (!gameData.title || !gameData.location) {
      Alert.alert('Error', 'Please fill in the title and location');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create the game using the store
      const newGame = {
        title: gameData.title,
        description: gameData.description,
        format: gameData.format,
        maxPlayers: gameData.maxPlayers,
        currentPlayers: 1, // Creator is automatically added
        skillLevel: gameData.skillLevel,
        location: { 
          latitude: 40.7128, // Default coordinates for demo
          longitude: -74.0060,
          city: gameData.location 
        },
        startTime: gameData.startTime,
        isPrivate: gameData.isPrivate,
        createdBy: user?.id || 'currentUser',
        players: [user?.id || 'currentUser'], // Creator is first player
        status: GameStatus.UPCOMING,
      };

      addGame(newGame);
      
      Alert.alert(
        'Success!', 
        'Your game has been created and is now visible to other players!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Games' as never)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.headerGradient}
          >
            <Ionicons name="add-circle" size={32} color="white" />
            <Text style={styles.headerTitle}>Create New Game</Text>
          </LinearGradient>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Game Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Game Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning Pickleball, Weekend Doubles"
              placeholderTextColor={theme.colors.textSecondary}
              value={gameData.title}
              onChangeText={(text) => setGameData({...gameData, title: text})}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any special rules, equipment needed, or other details..."
              placeholderTextColor={theme.colors.textSecondary}
              value={gameData.description}
              onChangeText={(text) => setGameData({...gameData, description: text})}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Game Format */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Game Format</Text>
            <View style={styles.formatOptions}>
              {Object.values(GameFormat).map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.formatOption,
                    gameData.format === format && styles.formatOptionSelected
                  ]}
                  onPress={() => setGameData({...gameData, format})}
                >
                  <Text style={[
                    styles.formatOptionText,
                    gameData.format === format && styles.formatOptionTextSelected
                  ]}>
                    {format === GameFormat.SINGLES ? '1v1' : 
                     format === GameFormat.DOUBLES ? '2v2' : 'Open Play'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Player Count */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maximum Players</Text>
            <View style={styles.playerCountContainer}>
              <TouchableOpacity
                style={styles.playerCountButton}
                onPress={() => setGameData({...gameData, maxPlayers: Math.max(2, gameData.maxPlayers - 1)})}
              >
                <Ionicons name="remove" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.playerCount}>{gameData.maxPlayers}</Text>
              <TouchableOpacity
                style={styles.playerCountButton}
                onPress={() => setGameData({...gameData, maxPlayers: gameData.maxPlayers + 1})}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Skill Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.skillLevelOptions}>
              {Object.values(SkillLevel).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.skillLevelOption,
                    gameData.skillLevel === level && styles.skillLevelOptionSelected
                  ]}
                  onPress={() => setGameData({...gameData, skillLevel: level})}
                >
                  <Text style={[
                    styles.skillLevelOptionText,
                    gameData.skillLevel === level && styles.skillLevelOptionTextSelected
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time & Duration */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Time</Text>
            <Text style={styles.timeDisplay}>
              {gameData.startTime.toLocaleString()}
            </Text>
            <TouchableOpacity style={styles.timeButton}>
              <Text style={styles.timeButtonText}>Change Time</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (hours)</Text>
            <View style={styles.durationContainer}>
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => setGameData({...gameData, duration: Math.max(1, gameData.duration - 0.5)})}
              >
                <Ionicons name="remove" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.durationText}>{gameData.duration}h</Text>
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => setGameData({...gameData, duration: gameData.duration + 0.5})}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Court name, address, or general area"
              placeholderTextColor={theme.colors.textSecondary}
              value={gameData.location}
              onChangeText={(text) => setGameData({...gameData, location: text})}
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price per Player (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., $10, Free"
              placeholderTextColor={theme.colors.textSecondary}
              value={gameData.price}
              onChangeText={(text) => setGameData({...gameData, price: text})}
              keyboardType="numeric"
            />
          </View>

          {/* Privacy Setting */}
          <View style={styles.inputGroup}>
            <View style={styles.privacyRow}>
              <Text style={styles.label}>Private Game</Text>
              <Switch
                value={gameData.isPrivate}
                onValueChange={(value) => setGameData({...gameData, isPrivate: value})}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={gameData.isPrivate ? 'white' : theme.colors.textSecondary}
              />
            </View>
            <Text style={styles.privacyDescription}>
              Private games are only visible to invited players
            </Text>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateGame}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.createButtonGradient}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Creating Game...' : 'Create Game'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  form: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formatOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  formatOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  formatOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  formatOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  formatOptionTextSelected: {
    color: 'white',
  },
  playerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  playerCountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerCount: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  skillLevelOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  skillLevelOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skillLevelOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  skillLevelOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  skillLevelOptionTextSelected: {
    color: 'white',
  },
  timeDisplay: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  timeButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  timeButtonText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  durationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  privacyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  createButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginTop: theme.spacing.xl,
    ...theme.shadows?.md,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonGradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateGameScreen;
