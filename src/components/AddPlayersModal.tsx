import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { Game } from '../types';

interface AddPlayersModalProps {
  visible: boolean;
  onClose: () => void;
  game: Game | null;
  onPlayerAdded?: (playerId: string) => void;
}

const AddPlayersModal: React.FC<AddPlayersModalProps> = ({
  visible,
  onClose,
  game,
  onPlayerAdded,
}) => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { joinGame } = useGameStore();
  const [activeTab, setActiveTab] = useState<'app' | 'qr'>('app');
  const [searchQuery, setSearchQuery] = useState('');

  const styles = createStyles(theme);

  const handleAddPlayer = async (playerId: string) => {
    if (game && user?.id) {
      // For existing games
      if (game.players.includes(playerId)) {
        Alert.alert('Player Already Added', 'This player is already in the game.');
        return;
      }

      if (game.currentPlayers >= game.maxPlayers) {
        Alert.alert('Game Full', 'This game is already full.');
        return;
      }

      await joinGame(game.id, playerId);
      Alert.alert('Success', 'Player added to the game!');
      onClose();
    } else if (onPlayerAdded) {
      // For new games (creation screen)
      onPlayerAdded(playerId);
      onClose();
    }
  };

  const handleQRCodeScan = () => {
    Alert.alert(
      'QR Code Scanner',
      'QR code scanner functionality will be implemented here. For now, you can manually add players.',
      [
        { text: 'OK', onPress: () => setActiveTab('app') },
      ]
    );
  };

  const handleGenerateQRCode = () => {
    if (!game) return;
    
    Alert.alert(
      'Generate QR Code',
      `QR code for game "${game.title}" will be generated here. Other players can scan this code to join the game.`,
      [
        { text: 'Copy Game Link', onPress: () => Alert.alert('Copied!', 'Game link copied to clipboard') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Mock players data - in real app this would come from a users store
  const mockPlayers = [
    { id: 'user1', name: 'Sol Shats', email: '2', skillLevel: 'Intermediate' },
    { id: 'user2', name: 'Vlad Shetinin', email: '1', skillLevel: 'Advanced' },
    { id: 'user3', name: 'John Doe', email: 'john@example.com', skillLevel: 'Beginner' },
    { id: 'user4', name: 'Jane Smith', email: 'jane@example.com', skillLevel: 'Intermediate' },
  ];

  const filteredPlayers = mockPlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Players</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'app' && styles.activeTab]}
            onPress={() => setActiveTab('app')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={activeTab === 'app' ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'app' && styles.activeTabText]}>
              From App
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'qr' && styles.activeTab]}
            onPress={() => setActiveTab('qr')}
          >
            <Ionicons 
              name="qr-code" 
              size={20} 
              color={activeTab === 'qr' ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'qr' && styles.activeTabText]}>
              QR Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'app' ? (
          <View style={styles.content}>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search players..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Players List */}
            <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
              {filteredPlayers.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.playerItem}
                  onPress={() => handleAddPlayer(player.id)}
                >
                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerInitial}>
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerEmail}>{player.email}</Text>
                    <Text style={styles.playerSkill}>{player.skillLevel}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddPlayer(player.id)}
                  >
                    <Ionicons name="add" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.qrContent}>
            <View style={styles.qrSection}>
              <Text style={styles.qrSectionTitle}>Scan QR Code</Text>
              <Text style={styles.qrSectionDescription}>
                Scan a QR code from another player to add them to the game
              </Text>
              <TouchableOpacity style={styles.qrButton} onPress={handleQRCodeScan}>
                <Ionicons name="qr-code-outline" size={48} color={theme.colors.primary} />
                <Text style={styles.qrButtonText}>Scan QR Code</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.qrSection}>
              <Text style={styles.qrSectionTitle}>Generate QR Code</Text>
              <Text style={styles.qrSectionDescription}>
                Create a QR code for this game that others can scan
              </Text>
              <TouchableOpacity style={styles.qrButton} onPress={handleGenerateQRCode}>
                <Ionicons name="qr-code" size={48} color={theme.colors.primary} />
                <Text style={styles.qrButtonText}>Generate QR Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    width: 44,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  activeTab: {
    backgroundColor: theme.colors.primary + '20',
  },
  tabText: {
    marginLeft: theme.spacing.xs,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  playersList: {
    flex: 1,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  playerInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  playerEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  playerSkill: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 2,
  },
  addButton: {
    padding: theme.spacing.sm,
  },
  qrContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  qrSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  qrSectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  qrButton: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  qrButtonText: {
    marginTop: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default AddPlayersModal;
