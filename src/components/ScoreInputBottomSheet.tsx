import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';

interface ScoreInputBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (matchId: string, scores: { game1: { score1: number; score2: number }[] }) => void;
  match: any;
  getPlayerDisplayName: (playerId: string) => string;
}

const ScoreInputBottomSheet: React.FC<ScoreInputBottomSheetProps> = ({
  visible,
  onClose,
  onSave,
  match,
  getPlayerDisplayName,
}) => {
  const { theme } = useThemeStore();
  const [scores, setScores] = useState<{ [key: string]: { score1: string; score2: string } }>({});
  const [gameCount, setGameCount] = useState(1);

  // Инициализируем счет при открытии
  useEffect(() => {
    if (visible && match) {
      const initialScores: { [key: string]: { score1: string; score2: string } } = {};
      for (let i = 1; i <= gameCount; i++) {
        initialScores[`game${i}`] = { score1: '', score2: '' };
      }
      setScores(initialScores);
    }
  }, [visible, match]); // Убрал gameCount из зависимостей

  const updateScore = (gameKey: string, player: 'score1' | 'score2', value: string) => {
    setScores(prev => ({
      ...prev,
      [gameKey]: {
        ...prev[gameKey],
        [player]: value
      }
    }));
  };

  const addGame = () => {
    const newGameCount = gameCount + 1;
    setGameCount(newGameCount);
    setScores(prev => ({
      ...prev,
      [`game${newGameCount}`]: { score1: '', score2: '' }
    }));
  };

  const removeGame = () => {
    if (gameCount > 1) {
      const newGameCount = gameCount - 1;
      setGameCount(newGameCount);
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[`game${newGameCount + 1}`];
        return newScores;
      });
    }
  };

  const handleSave = () => {
    // Фильтруем только заполненные геймы
    const filledGames = Object.entries(scores).filter(([gameKey, gameScore]) => 
      gameScore.score1 && gameScore.score2 && 
      parseInt(gameScore.score1) >= 0 && parseInt(gameScore.score2) >= 0
    );

    // Проверяем что есть хотя бы один заполненный гейм
    if (filledGames.length === 0) {
      return; // Нет ни одного заполненного гейма
    }

    // Конвертируем только заполненные геймы в нужный формат
    const gameScores = filledGames.map(([gameKey, gameScore]) => ({
      score1: parseInt(gameScore.score1),
      score2: parseInt(gameScore.score2)
    }));

    onSave(match.id, { game1: gameScores });
    onClose();
  };

  const styles = createStyles(theme);

  if (!match) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.content}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <View style={styles.header}>
            <Text style={styles.title}>Update Score</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Информация о матче */}
          <View style={styles.matchInfo}>
            <Text style={styles.matchTitle}>
              {getPlayerDisplayName(match.player1)} vs {getPlayerDisplayName(match.player2)}
            </Text>
          </View>

          {/* Ввод счета по геймам */}
          <ScrollView style={styles.scoresContainer} showsVerticalScrollIndicator={false}>
            {Array.from({ length: gameCount }, (_, index) => {
              const gameNum = index + 1;
              const gameKey = `game${gameNum}`;
              const gameScore = scores[gameKey] || { score1: '', score2: '' };

              return (
                <View key={gameKey} style={styles.gameScoreContainer}>
                  <Text style={styles.gameLabel}>Game {gameNum}</Text>
                  <View style={styles.scoreInputs}>
                    <View style={styles.scoreInput}>
                      <Text style={styles.scoreLabel}>{getPlayerDisplayName(match.player1)}</Text>
                      <TextInput
                        style={styles.scoreTextInput}
                        value={gameScore.score1}
                        onChangeText={(text) => updateScore(gameKey, 'score1', text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                    
                    <View style={styles.scoreInput}>
                      <Text style={styles.scoreLabel}>{getPlayerDisplayName(match.player2)}</Text>
                      <TextInput
                        style={styles.scoreTextInput}
                        value={gameScore.score2}
                        onChangeText={(text) => updateScore(gameKey, 'score2', text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Кнопки управления геймами */}
          <View style={styles.gameControls}>
            <TouchableOpacity style={styles.addGameButton} onPress={addGame}>
              <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.addGameButtonText}>Add Game</Text>
            </TouchableOpacity>
            
            {gameCount > 1 && (
              <TouchableOpacity style={styles.removeGameButton} onPress={removeGame}>
                <Ionicons name="remove-circle" size={20} color={theme.colors.error || '#ff4444'} />
                <Text style={styles.removeGameButtonText}>Remove Game</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Кнопка сохранения */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Score</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  scoresContainer: {
    maxHeight: 300,
  },
  gameScoreContainer: {
    marginBottom: 20,
  },
  gameLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  scoreInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  scoreInput: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreTextInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    minWidth: 80,
  },
  gameControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  addGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addGameButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  removeGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.error || '#ff4444',
    borderStyle: 'dashed',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  removeGameButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error || '#ff4444',
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ScoreInputBottomSheet;
