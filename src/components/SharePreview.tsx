import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';

const { width } = Dimensions.get('window');

interface SharePreviewProps {
  type: 'game' | 'tournament' | 'profile' | 'match';
  title: string;
  description?: string;
  imageUrl?: string;
  metadata?: {
    players?: number;
    format?: string;
    location?: string;
    date?: string;
    status?: string;
  };
}

const SharePreview: React.FC<SharePreviewProps> = ({ 
  type, 
  title, 
  description, 
  metadata 
}) => {
  const { theme } = useThemeStore();

  const getTypeIcon = () => {
    switch (type) {
      case 'game':
        return 'game-controller';
      case 'tournament':
        return 'trophy';
      case 'profile':
        return 'person';
      case 'match':
        return 'medal';
      default:
        return 'share';
    }
  };

  const getTypeColor = (): [string, string] => {
    switch (type) {
      case 'game':
        return [theme.colors.primary, theme.colors.secondary];
      case 'tournament':
        return ['#FFD700', '#FFA500'];
      case 'profile':
        return [theme.colors.info, theme.colors.primary];
      case 'match':
        return ['#4CAF50', '#8BC34A'];
      default:
        return [theme.colors.primary, theme.colors.secondary];
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={getTypeColor()}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={getTypeIcon() as any} size={32} color="white" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.typeText}>{type.toUpperCase()}</Text>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {description && (
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>
        )}

        {/* Metadata */}
        {metadata && (
          <View style={styles.metadata}>
            {metadata.players && (
              <View style={styles.metadataItem}>
                <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metadataText}>{metadata.players} players</Text>
              </View>
            )}
            
            {metadata.format && (
              <View style={styles.metadataItem}>
                <Ionicons name="settings" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metadataText}>{metadata.format}</Text>
              </View>
            )}
            
            {metadata.location && (
              <View style={styles.metadataItem}>
                <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metadataText}>{metadata.location}</Text>
              </View>
            )}
            
            {metadata.date && (
              <View style={styles.metadataItem}>
                <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metadataText}>{metadata.date}</Text>
              </View>
            )}
            
            {metadata.status && (
              <View style={styles.metadataItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metadataText}>{metadata.status}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.brandContainer}>
            <Ionicons name="tennisball" size={20} color={theme.colors.primary} />
            <Text style={styles.brandText}>PIQLE</Text>
          </View>
          <Text style={styles.footerText}>Open in PIQLE app for full experience</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows?.lg,
  },
  header: {
    padding: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    lineHeight: 22,
  },
  content: {
    padding: theme.spacing.lg,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  metadata: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  metadataText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default SharePreview;
