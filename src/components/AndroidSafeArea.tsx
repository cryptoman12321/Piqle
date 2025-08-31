import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

interface AndroidSafeAreaProps extends SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AndroidSafeArea: React.FC<AndroidSafeAreaProps> = ({ 
  children, 
  style, 
  edges = ['top', 'left', 'right'],
  ...props 
}) => {
  // На Android добавляем дополнительный отступ снизу для нижнего меню
  const androidStyle: ViewStyle = Platform.OS === 'android' 
    ? { 
        ...style,
        paddingBottom: 20, // Дополнительный отступ для Android
      }
    : style || {};

  return (
    <SafeAreaView 
      style={androidStyle}
      edges={Platform.OS === 'android' ? ['top', 'left', 'right'] : edges}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};

export default AndroidSafeArea;
