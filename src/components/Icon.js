// src/components/Icon.js
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { icons } from '../constants/icons';

// Size tokens (in dp)
const sizeMap = {
  small: 14,
  medium: 18,
  large: 24,
  xl: 36,
};

/**
 * Simple PNG‑based icon wrapper.
 * Props:
 *   - name: key from icons mapping
 *   - size: number (overrides variant) or one of the size tokens (small, medium, large, xl)
 *   - variant: optional token name (small|medium|large|xl) – used when size prop is omitted
 *   - color: tintColor applied to the PNG (must be a hex string)
 *   - style: additional style for the Image component
 */
export default function Icon({ name, size, variant, color, style }) {
  const source = icons[name];
  if (!source) {
    console.warn(`Icon "${name}" not found in icons mapping.`);
    return null;
  }

  // Resolve size: explicit number > variant token > default medium
  let resolvedSize = typeof size === 'number' ? size : sizeMap[variant] || sizeMap.medium;

  const imageStyle = [
    { width: resolvedSize, height: resolvedSize },
    color ? { tintColor: color } : null,
    style,
  ];

  return <Image source={source} style={imageStyle} resizeMode="contain" />;
}
