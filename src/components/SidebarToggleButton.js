import React, { useRef, useEffect } from 'react';
import { StyleSheet, Animated, Pressable } from 'react-native';
import Icon from './Icon';

export default function SidebarToggleButton({ isOpen, onPress }) {
  const animation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: false,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  // Keep rotation for a nice transition effect
  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.pressArea}
      >
        <Animated.View style={[styles.iconWrapper, { transform: [{ rotate }] }]}>
          <Icon 
            name={isOpen ? "close" : "menu"} 
            size={24} 
            color={isOpen ? "#39ff14" : "#e2e8f0"} 
          />
        </Animated.View>
        
        {/* Subtle glow pulse background when active */}
        <Animated.View 
          style={[
            styles.glow, 
            { 
              opacity: Animated.multiply(animation, 0.15), 
              transform: [{ 
                scale: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }) 
              }] 
            }
          ]} 
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 25,
    left: 10,
    zIndex: 1000, // Ensure it sits above the sidebar overlay
  },
  pressArea: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#39ff14',
    borderRadius: 25,
    zIndex: -1,
  }
});
