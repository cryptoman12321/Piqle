import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../stores/themeStore';

const SimpleMapScreen: React.FC = () => {
  const { getCurrentTheme } = useThemeStore();
  const theme = getCurrentTheme();

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Find Courts</Text>
              <Text style={styles.headerSubtitle}>Discover pickleball courts near you</Text>
            </View>
            
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={120} color={theme.colors.textSecondary} />
        <Text style={styles.placeholderTitle}>Interactive Map</Text>
        <Text style={styles.placeholderText}>
          The interactive map with court locations and game events will be available in the full version.
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="location" size={24} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Find Nearby Courts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="people" size={24} color={theme.colors.secondary} />
            <Text style={styles.actionButtonText}>Join Games</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar" size={24} color={theme.colors.success} />
            <Text style={styles.actionButtonText}>View Events</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sample Courts */}
      <View style={styles.sampleCourts}>
        <Text style={styles.sectionTitle}>Popular Courts</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.courtCard}>
            <View style={styles.courtImage}>
              <Ionicons name="tennisball" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.courtName}>Central Park Courts</Text>
            <Text style={styles.courtLocation}>San Francisco, CA</Text>
            <Text style={styles.courtRating}>⭐ 4.5 (24 reviews)</Text>
          </View>
          
          <View style={styles.courtCard}>
            <View style={styles.courtImage}>
              <Ionicons name="tennisball" size={32} color={theme.colors.secondary} />
            </View>
            <Text style={styles.courtName}>Downtown Sports Complex</Text>
            <Text style={styles.courtLocation}>San Francisco, CA</Text>
            <Text style={styles.courtRating}>⭐ 4.8 (18 reviews)</Text>
          </View>
          
          <View style={styles.courtCard}>
            <View style={styles.courtImage}>
              <Ionicons name="tennisball" size={32} color={theme.colors.success} />
            </View>
            <Text style={styles.courtName}>Community Center</Text>
            <Text style={styles.courtLocation}>San Francisco, CA</Text>
            <Text style={styles.courtRating}>⭐ 4.2 (31 reviews)</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerGradient: {
    padding: theme.spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchButton: {
    padding: theme.spacing.sm,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  quickActions: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  sampleCourts: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  courtCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 16,
    marginRight: theme.spacing.md,
    width: 200,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  courtImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  courtLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  courtRating: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default SimpleMapScreen;
