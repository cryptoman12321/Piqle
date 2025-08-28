import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';

const ClubDetailsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="people" size={64} color={theme.colors.primary} />
        <Text style={styles.title}>Club Details</Text>
        <Text style={styles.subtitle}>View club information and join</Text>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '600', color: theme.colors.text, marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center' },
});

export default ClubDetailsScreen;
