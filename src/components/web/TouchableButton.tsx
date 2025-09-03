import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface TouchableButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
  activeOpacity?: number;
  hitSlop?: any;
}

const TouchableButton: React.FC<TouchableButtonProps> = ({
  children,
  onPress,
  onPressIn,
  onPressOut,
  style,
  textStyle,
  disabled = false,
  activeOpacity = 0.7,
  hitSlop,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => {
    if (!disabled) {
      setIsPressed(true);
      onPressIn?.();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      setIsPressed(false);
      onPressOut?.();
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setIsHovered(false);
      setIsPressed(false);
    }
  };

  const buttonStyle = [
    styles.button,
    style,
    disabled && styles.disabled,
    isPressed && { opacity: activeOpacity },
    isHovered && styles.hovered,
  ];

  return (
    <Pressable
      style={buttonStyle}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleMouseEnter}
      onHoverOut={handleMouseLeave}
      disabled={disabled}
      hitSlop={hitSlop}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  text: {
    color: 'inherit',
    fontSize: 16,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
  hovered: {
    transform: [{ scale: 1.02 }],
  },
});

export default TouchableButton;
