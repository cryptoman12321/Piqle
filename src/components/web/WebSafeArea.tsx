import React from 'react';
import { View, StyleSheet } from 'react-native';

interface WebSafeAreaProps {
  children: React.ReactNode;
  style?: any;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

const WebSafeArea: React.FC<WebSafeAreaProps> = ({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
}) => {
  const getSafeAreaStyle = () => {
    const safeAreaStyle: any = {};
    
    if (edges.includes('top')) {
      safeAreaStyle.paddingTop = 20; // Simulate safe area for web
    }
    if (edges.includes('bottom')) {
      safeAreaStyle.paddingBottom = 20;
    }
    if (edges.includes('left')) {
      safeAreaStyle.paddingLeft = 20;
    }
    if (edges.includes('right')) {
      safeAreaStyle.paddingRight = 20;
    }
    
    return safeAreaStyle;
  };

  return (
    <View style={[styles.container, getSafeAreaStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebSafeArea;
