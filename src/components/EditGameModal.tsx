import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Game, GameFormat, SkillLevel, Location } from '../types';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

interface EditGameModalProps {
  visible: boolean;
  onClose: () => void;
  game: Game | null;
  onSave: (updatedGame: Partial<Game>) => Promise<void>;
}

const EditGameModal: React.FC<EditGameModalProps> = ({
  visible,
  onClose,
  game,
  onSave,
}) => {
  const { showSuccess } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<GameFormat>(GameFormat.SINGLES);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.INTERMEDIATE);
  const [startTime, setStartTime] = useState(new Date());
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setDescription(game.description || '');
      setFormat(game.format);
      setSkillLevel(game.skillLevel);
      setStartTime(new Date(game.startTime));
      setCity(game.location.city);
      setAddress(game.location.address || '');
    }
  }, [game]);

  const handleSave = async () => {
    if (!game) return;

    // Check if game can still be edited
    if (game.status !== 'UPCOMING') {
      Alert.alert('Error', 'This game cannot be edited anymore');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    if (startTime <= new Date()) {
      Alert.alert('Error', 'Start time must be in the future');
      return;
    }

    setIsLoading(true);

    try {
      // Calculate new maxPlayers based on format
      let newMaxPlayers = game.maxPlayers;
      let formatChanged = false;
      
      if (format === GameFormat.SINGLES) {
        newMaxPlayers = 2;
        formatChanged = game.format !== GameFormat.SINGLES;
      } else if (format === GameFormat.DOUBLES) {
        newMaxPlayers = 4;
        formatChanged = game.format !== GameFormat.DOUBLES;
      } else if (format === GameFormat.OPEN_PLAY) {
        newMaxPlayers = Math.max(game.maxPlayers, 2); // Keep current or minimum 2
        formatChanged = game.format !== GameFormat.OPEN_PLAY;
      }

      // Adjust currentPlayers if needed
      let newCurrentPlayers = game.currentPlayers;
      let playersRemoved = false;
      
      if (newCurrentPlayers > newMaxPlayers) {
        newCurrentPlayers = newMaxPlayers;
        playersRemoved = true;
      }

      // Show warning if format change affects players
      if (formatChanged && (playersRemoved || game.currentPlayers > newMaxPlayers)) {
        const removedCount = game.currentPlayers - newMaxPlayers;
        Alert.alert(
          'Format Change Warning',
          `Changing format to ${format === GameFormat.SINGLES ? '1v1 Singles' : format === GameFormat.DOUBLES ? '2v2 Doubles' : 'Open Play'} will reduce max players to ${newMaxPlayers}. ${removedCount > 0 ? `${removedCount} player(s) will be removed from the game.` : ''}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Continue', 
              onPress: async () => {
                try {
                  const updatedGame: Partial<Game> = {
                    title: title.trim(),
                    description: description.trim(),
                    format,
                    skillLevel,
                    maxPlayers: newMaxPlayers,
                    currentPlayers: newCurrentPlayers,
                    startTime,
                    location: {
                      latitude: game.location.latitude,
                      longitude: game.location.longitude,
                      city: city.trim(),
                      address: address.trim() || undefined,
                    },
                  };

                  await onSave(updatedGame);
                  showSuccess('Game updated successfully!');
                  onClose();
                } catch (error) {
                  Alert.alert('Error', 'Failed to update game. Please try again.');
                } finally {
                  setIsLoading(false);
                }
              }
            }
          ]
        );
        return;
      }

      // Proceed with update
      const updatedGame: Partial<Game> = {
        title: title.trim(),
        description: description.trim(),
        format,
        skillLevel,
        maxPlayers: newMaxPlayers,
        currentPlayers: newCurrentPlayers,
        startTime,
        location: {
          latitude: game.location.latitude,
          longitude: game.location.longitude,
          city: city.trim(),
          address: address.trim() || undefined,
        },
      };

      await onSave(updatedGame);
      showSuccess('Game updated successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(startTime.getHours(), startTime.getMinutes());
      setStartTime(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newTime = new Date(startTime);
      newTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setStartTime(newTime);
    }
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

  const getSkillLevelDisplayName = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.BEGINNER:
        return 'Beginner';
      case SkillLevel.INTERMEDIATE:
        return 'Intermediate';
      case SkillLevel.ADVANCED:
        return 'Advanced';
      case SkillLevel.EXPERT:
        return 'Expert';
      default:
        return level;
    }
  };

  if (!game) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Game</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter game title"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter game description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Game Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Settings</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Format</Text>
              <View style={styles.optionsContainer}>
                {Object.values(GameFormat).map((formatOption) => (
                  <TouchableOpacity
                    key={formatOption}
                    style={[
                      styles.optionButton,
                      format === formatOption && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFormat(formatOption)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        format === formatOption && styles.optionButtonTextSelected,
                      ]}
                    >
                      {getFormatDisplayName(formatOption)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skill Level</Text>
              <View style={styles.optionsContainer}>
                {Object.values(SkillLevel).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionButton,
                      skillLevel === level && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSkillLevel(level)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        skillLevel === level && styles.optionButtonTextSelected,
                      ]}
                    >
                      {getSkillLevelDisplayName(level)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>


          </View>

          {/* Time & Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time & Location</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date & Time</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#666" />
                  <Text style={styles.dateTimeText}>
                    {startTime.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={20} color="#666" />
                  <Text style={styles.dateTimeText}>
                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Enter city"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address (Optional)</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter address"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Warning */}
          <View style={styles.warningContainer}>
            <Ionicons name="information-circle" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>
              Note: You can only edit games before they start. Once a match begins, editing is disabled.
            </Text>
          </View>
        </ScrollView>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={startTime}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Toast */}
        <Toast
          visible={false}
          message=""
          type="success"
          onClose={() => {}}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e5e7',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1d1d1f',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e5e7',
    backgroundColor: 'white',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  optionButtonTextSelected: {
    color: 'white',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e5e7',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1d1d1f',
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
});

export default EditGameModal;
