import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';

const { width: screenWidth } = Dimensions.get('window');

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
  visible: boolean;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  visible,
}) => {
  const { getCurrentTheme } = useThemeStore();
  const theme = getCurrentTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Показываем toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Автоматически скрываем через duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          icon: 'checkmark-circle',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error,
          icon: 'close-circle',
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning,
          icon: 'warning',
        };
      case 'info':
        return {
          backgroundColor: theme.colors.info,
          icon: 'information-circle',
        };
      default:
        return {
          backgroundColor: theme.colors.success,
          icon: 'checkmark-circle',
        };
    }
  };

  const toastStyle = getToastStyle();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: toastStyle.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={toastStyle.icon as any} size={24} color="white" />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    marginHorizontal: 16,
    marginTop: 50,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  message: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast;
