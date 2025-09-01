import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useThemeStore } from '../stores/themeStore';
import SharePreview from './SharePreview';

const { width } = Dimensions.get('window');

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  shareData: {
    type: 'game' | 'tournament' | 'profile' | 'match';
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose, shareData }) => {
  const { theme } = useThemeStore();

  const generateDeepLink = () => {
    const baseUrl = Linking.createURL('/');
    switch (shareData.type) {
      case 'game':
        return `${baseUrl}game/${shareData.id}`;
      case 'tournament':
        return `${baseUrl}tournament/${shareData.id}`;
      case 'profile':
        return `${baseUrl}profile/${shareData.id}`;
      case 'match':
        return `${baseUrl}match/${shareData.id}`;
      default:
        return baseUrl;
    }
  };

  const generateShareMessage = () => {
    const deepLink = generateDeepLink();
    const baseMessage = `Check out this ${shareData.type} on PIQLE! 🏓\n\n${shareData.title}`;
    
    if (shareData.description) {
      return `${baseMessage}\n\n${shareData.description}\n\n${deepLink}`;
    }
    
    return `${baseMessage}\n\n${deepLink}`;
  };

  const handleNativeShare = async () => {
    try {
      const result = await Share.share({
        message: generateShareMessage(),
        url: generateDeepLink(),
        title: shareData.title,
      });
      
      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share content');
    }
  };

  const handleSocialShare = (platform: string) => {
    const deepLink = generateDeepLink();
    const message = generateShareMessage();
    
    let url = '';
    
    switch (platform) {
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(message)}`;
        break;
      case 'whatsapp':
        url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deepLink)}&quote=${encodeURIComponent(message)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(deepLink)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, so we'll copy to clipboard
        handleCopyToClipboard();
        return;
      default:
        return;
    }
    
    Linking.openURL(url);
    onClose();
  };

  const handleCopyToClipboard = () => {
    const deepLink = generateDeepLink();
    // For now, we'll use the native share which includes copy option
    handleNativeShare();
  };

  const handleCopyLink = () => {
    const deepLink = generateDeepLink();
    // For now, we'll use the native share which includes copy option
    handleNativeShare();
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Share {shareData.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Share Options */}
          <View style={styles.shareOptions}>
            {/* Native Share */}
            <TouchableOpacity style={styles.shareOption} onPress={handleNativeShare}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="share-outline" size={24} color="white" />
              </View>
              <Text style={styles.optionText}>Share</Text>
            </TouchableOpacity>

            {/* Copy Link */}
            <TouchableOpacity style={styles.shareOption} onPress={handleCopyLink}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary }]}>
                <Ionicons name="link" size={24} color="white" />
              </View>
              <Text style={styles.optionText}>Copy Link</Text>
            </TouchableOpacity>

            {/* Social Media Options */}
            <TouchableOpacity style={styles.shareOption} onPress={() => handleSocialShare('telegram')}>
              <View style={[styles.iconContainer, { backgroundColor: '#0088cc' }]}>
                <Ionicons name="paper-plane" size={24} color="white" />
              </View>
              <Text style={styles.optionText}>Telegram</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={() => handleSocialShare('whatsapp')}>
              <View style={[styles.iconContainer, { backgroundColor: '#25D366' }]}>
                <Ionicons name="logo-whatsapp" size={24} color="white" />
              </View>
              <Text style={styles.optionText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={() => handleSocialShare('facebook')}>
              <View style={[styles.iconContainer, { backgroundColor: '#1877F2' }]}>
                <Ionicons name="logo-facebook" size={24} color="white" />
              </View>
              <Text style={styles.optionText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={() => handleSocialShare('twitter')}>
              <View style={[styles.iconContainer, { backgroundColor: '#1DA1F2' }]}>
                <Ionicons name="logo-twitter" size={24} color="white" />
              </View>
              <Text style={styles.optionText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={() => handleSocialShare('instagram')}>
              <View style={[styles.iconContainer, { backgroundColor: '#E4405F' }]}>
                <Ionicons name="logo-instagram" size={24} color="white" />
              </View>
              <Text style={styles.optionText}>Instagram</Text>
            </TouchableOpacity>
          </View>

          {/* Share Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewContainer}>
              <SharePreview
                type={shareData.type}
                title={shareData.title}
                description={shareData.description}
                metadata={{
                  players: shareData.type === 'game' ? 4 : undefined,
                  format: shareData.type === 'game' ? '2v2 Doubles' : undefined,
                  location: shareData.type === 'game' ? 'New York' : undefined,
                  date: shareData.type === 'game' ? 'Tomorrow, 10:00 AM' : undefined,
                  status: shareData.type === 'game' ? 'Upcoming' : undefined,
                }}
              />
            </View>
          </View>

          {/* Deep Link Info */}
          <View style={styles.deepLinkInfo}>
            <Text style={styles.deepLinkTitle}>🔗 Deep Link</Text>
            <Text style={styles.deepLinkText}>
              {shareData.type === 'game' && 'Users with PIQLE app will open the game directly'}
              {shareData.type === 'tournament' && 'Users with PIQLE app will open the tournament directly'}
              {shareData.type === 'profile' && 'Users with PIQLE app will open the profile directly'}
              {shareData.type === 'match' && 'Users with PIQLE app will open the match results directly'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  shareOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  shareOption: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 3,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows?.md,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  deepLinkInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deepLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  deepLinkText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  previewSection: {
    marginBottom: theme.spacing.lg,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  previewContainer: {
    alignItems: 'center',
  },
});

export default ShareModal;
