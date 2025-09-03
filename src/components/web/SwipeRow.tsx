import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

interface SwipeRowProps {
  children: React.ReactNode;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
}

const SwipeRow: React.FC<SwipeRowProps> = ({
  children,
  leftActions,
  rightActions,
}) => {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Left Actions */}
      {leftActions && (
        <View style={[styles.actions, styles.leftActions, { opacity: isLeftOpen ? 1 : 0 }]}>
          {leftActions}
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Right Actions */}
      {rightActions && (
        <View style={[styles.actions, styles.rightActions, { opacity: isRightOpen ? 1 : 0 }]}>
          {rightActions}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'white',
    zIndex: 1,
  },
  actions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  leftActions: {
    left: 0,
    backgroundColor: '#4CAF50',
  },
  rightActions: {
    right: 0,
    backgroundColor: '#FF9800',
  },
  actionItem: {
    marginHorizontal: 4,
  },
});

export default SwipeRow;
