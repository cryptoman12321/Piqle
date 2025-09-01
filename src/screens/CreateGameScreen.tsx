import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../stores/themeStore';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { GameFormat, SkillLevel, GameStatus } from '../types';
import { useNavigation } from '@react-navigation/native';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import AddPlayersModal from '../components/AddPlayersModal';
import { userService } from '../services/userService';

const CreateGameScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const { addGame } = useGameStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentTime = gameData.startTime;
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(currentTime.getHours());
      newDateTime.setMinutes(currentTime.getMinutes());
      setGameData({...gameData, startTime: newDateTime});
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = gameData.startTime;
      const newDateTime = new Date(currentDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setGameData({...gameData, startTime: newDateTime});
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        slots.push(time);
      }
    }
    return slots;
  };

  const selectCustomTime = (selectedTime: Date) => {
    const currentDate = gameData.startTime;
    const newDateTime = new Date(currentDate);
    newDateTime.setHours(selectedTime.getHours());
    newDateTime.setMinutes(selectedTime.getMinutes());
    setGameData({...gameData, startTime: newDateTime});
    setShowCustomTimePicker(false);
  };
  
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
  
  const [showAddPlayersModal, setShowAddPlayersModal] = useState(false);
  const [addedPlayers, setAddedPlayers] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

  const handleCreateGame = async () => {
    if (!gameData.title || !gameData.location) {
      showError('Please fill in the title and location');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create the game using the store
      const allPlayers = [user?.id || 'currentUser', ...addedPlayers];
      const newGame = {
        title: gameData.title,
        description: gameData.description,
        format: gameData.format,
        maxPlayers: gameData.maxPlayers,
        currentPlayers: allPlayers.length, // Include creator and added players
        skillLevel: gameData.skillLevel,
        location: { 
          latitude: 40.7128, // Default coordinates for demo
          longitude: -74.0060,
          city: gameData.location 
        },
        startTime: gameData.startTime,
        isPrivate: gameData.isPrivate,
        createdBy: user?.id || 'currentUser',
        players: allPlayers, // Include creator and added players
        status: GameStatus.UPCOMING,
      };

      // Add the game and get the created game
      const createdGame = await addGame(newGame);
      
      // Show success toast
      showSuccess('Game created successfully!');
      
      // Navigate to GameDetails and replace CreateGame in navigation stack
      setTimeout(() => {
        (navigation as any).replace('GameDetails', { gameId: createdGame.id });
      }, 1000);
      
    } catch (error) {
      showError('Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={hideToast}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <Ionicons name="add-circle" size={32} color="white" />
          <Text style={styles.headerTitle}>Create New Game</Text>
        </LinearGradient>

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
                  onPress={() => {
                    let newMaxPlayers = 4;
                    if (format === GameFormat.SINGLES) {
                      newMaxPlayers = 2;
                    } else if (format === GameFormat.DOUBLES) {
                      newMaxPlayers = 4;
                    } else if (format === GameFormat.OPEN_PLAY) {
                      newMaxPlayers = 4; // Минимум 4 для Open Play
                    }
                    setGameData({...gameData, format, maxPlayers: newMaxPlayers});
                  }}
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
            {gameData.format === GameFormat.OPEN_PLAY ? (
              <View style={styles.playerCountContainer}>
                <TouchableOpacity
                  style={styles.playerCountButton}
                  onPress={() => setGameData({...gameData, maxPlayers: Math.max(4, gameData.maxPlayers - 1)})}
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
            ) : (
              <View style={styles.fixedPlayerCount}>
                <Text style={styles.fixedPlayerCountText}>
                  {gameData.format === GameFormat.SINGLES ? '2 players (1v1)' : '4 players (2v2)'}
                </Text>
              </View>
            )}
          </View>

          {/* Add Players Section */}
          {gameData.format !== GameFormat.SINGLES && (
            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.label}>Add Players</Text>
                <View style={styles.addPlayersContainer}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddPlayersModal(true)}
                  >
                    <Ionicons name="add" size={20} color={theme.colors.primary} />
                    <Text style={styles.addButtonText}>
                      {gameData.format === GameFormat.DOUBLES ? 'Add Player' : 'Add Players'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.qrButton}
                    onPress={() => setShowAddPlayersModal(true)}
                  >
                    <Ionicons name="qr-code" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Added Players List */}
              {addedPlayers.length > 0 && (
                <View style={styles.addedPlayersContainer}>
                  <Text style={styles.addedPlayersTitle}>
                    Added Players ({addedPlayers.length})
                  </Text>
                  <View style={styles.addedPlayersList}>
                    {addedPlayers.map((playerId, index) => {
                      const player = userService.getUserById(playerId);
                      return (
                        <View key={`added-player-${index}`} style={styles.addedPlayerItem}>
                          <View style={styles.addedPlayerAvatar}>
                            <Text style={styles.addedPlayerInitial}>
                              {player ? `${player.firstName[0]}${player.lastName[0]}` : `P${index + 1}`}
                            </Text>
                          </View>
                          <View style={styles.addedPlayerInfo}>
                            <Text style={styles.addedPlayerName}>
                              {player ? `${player.firstName} ${player.lastName}` : `Player ${index + 1}`}
                            </Text>
                            <Text style={styles.addedPlayerEmail}>
                              {player ? player.email : 'player@example.com'}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.removePlayerButton}
                            onPress={() => {
                              setAddedPlayers(addedPlayers.filter((_, i) => i !== index));
                            }}
                          >
                            <Ionicons name="close" size={16} color={theme.colors.error} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}

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
            <View style={styles.timeDisplayContainer}>
              <Text style={styles.timeDisplay}>
                {formatDate(gameData.startTime)} at {formatTime(gameData.startTime)}
              </Text>
            </View>
            <View style={styles.timeButtonsContainer}>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={16} color={theme.colors.primary} />
                <Text style={styles.timeButtonText}>Change Date</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setShowCustomTimePicker(true)}
              >
                <Ionicons name="time" size={16} color={theme.colors.primary} />
                <Text style={styles.timeButtonText}>Change Time</Text>
              </TouchableOpacity>
            </View>
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
      
      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={gameData.startTime}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {/* Custom Time Picker */}
      {showCustomTimePicker && (
        <View style={styles.customTimePickerOverlay}>
          <View style={styles.customTimePickerContainer}>
            <View style={styles.customTimePickerHeader}>
              <Text style={styles.customTimePickerTitle}>Select Time</Text>
              <TouchableOpacity 
                onPress={() => setShowCustomTimePicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timeSlotsContainer} showsVerticalScrollIndicator={false}>
              {getTimeSlots().map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    formatTime(gameData.startTime) === formatTime(time) && styles.timeSlotSelected
                  ]}
                  onPress={() => selectCustomTime(time)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    formatTime(gameData.startTime) === formatTime(time) && styles.timeSlotTextSelected
                  ]}>
                    {formatTime(time)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      
      {/* Add Players Modal */}
      <AddPlayersModal
        visible={showAddPlayersModal}
        onClose={() => setShowAddPlayersModal(false)}
        game={null}
        onPlayerAdded={(playerId) => {
          if (!addedPlayers.includes(playerId)) {
            setAddedPlayers([...addedPlayers, playerId]);
          }
        }}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: theme.spacing.xl, // Add top padding for status bar
    paddingBottom: theme.spacing.lg,
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
    backgroundColor: theme.colors.background,
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
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  formatOption: {
    minWidth: '30%',
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
  fixedPlayerCount: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  fixedPlayerCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  customTimePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  customTimePickerContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    width: '80%',
    maxHeight: '70%',
    ...theme.shadows?.lg,
  },
  customTimePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  customTimePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  timeSlotsContainer: {
    maxHeight: 300,
  },
  timeSlot: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  timeSlotSelected: {
    backgroundColor: theme.colors.primary,
  },
  timeSlotText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  timeSlotTextSelected: {
    color: 'white',
    fontWeight: '600',
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
  timeDisplayContainer: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  timeDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  timeButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
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
  addedPlayersContainer: {
    marginTop: theme.spacing.md,
  },
  addedPlayersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  addedPlayersList: {
    gap: theme.spacing.sm,
  },
  addedPlayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addedPlayerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  addedPlayerInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  addedPlayerInfo: {
    flex: 1,
  },
  addedPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  addedPlayerEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  removePlayerButton: {
    padding: theme.spacing.sm,
  },
});

export default CreateGameScreen;
