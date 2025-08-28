import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { User, SkillLevel, Hand } from '../types';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const { theme } = useThemeStore();

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && (!firstName || !lastName))) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock user for demo
      const mockUser: User = {
        id: '1',
        email,
        firstName: isLogin ? 'John' : firstName,
        lastName: isLogin ? 'Doe' : lastName,
        city: 'New York',
        country: 'USA',
        skillLevel: SkillLevel.INTERMEDIATE,
        hand: Hand.RIGHT,
        isOnline: true,
        createdAt: new Date(),
      };

      const mockToken = 'mock-jwt-token-' + Date.now();
      
      login(mockUser, mockToken);
    } catch (error) {
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={theme.colors.primary === '#2563EB' ? ['#2563EB', '#1D4ED8'] : ['#3B82F6', '#1D4ED8']}
              style={styles.logoContainer}
            >
              <Ionicons name="tennisball" size={48} color="white" />
            </LinearGradient>
            <Text style={styles.title}>Piqle</Text>
            <Text style={styles.subtitle}>
              Find your next pickleball game
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <>
                <View style={styles.nameRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="First Name"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Last Name"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              <LinearGradient
                colors={theme.colors.primary === '#2563EB' ? ['#2563EB', '#1D4ED8'] : ['#3B82F6', '#1D4ED8']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Toggle Auth Mode */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.toggleTextBold}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <Text style={styles.socialText}>Or continue with</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#DB4437' }]}>
                <Ionicons name="logo-google" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#000000' }]}>
                <Ionicons name="logo-apple" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows?.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows?.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
  },
  toggleText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  toggleTextBold: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  socialContainer: {
    alignItems: 'center',
  },
  socialText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows?.sm,
  },
});

export default AuthScreen;
