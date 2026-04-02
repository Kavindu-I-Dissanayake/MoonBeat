import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function PresetItem({ preset, onSelect, onDelete }) {
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Preset",
      `Are you sure you want to remove the [ ${preset.mainTime}s | ${preset.gapTime}s ] timer?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(preset.id) }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(preset.mainTime.toString(), preset.gapTime.toString());
      }}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.dataRow}>
        <Text style={styles.timeText}><Text style={styles.label}>Work:</Text> {preset.mainTime}s</Text>
        <View style={styles.divider} />
        <Text style={styles.timeText}><Text style={styles.label}>Rest:</Text> {preset.gapTime}s</Text>
      </View>
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDelete(preset.id);
        }} 
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome5 name="trash" size={16} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2d3748',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4a5568',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    color: '#94a3b8',
    fontWeight: '400',
    fontSize: 14,
  },
  divider: {
    width: 2,
    height: 18,
    backgroundColor: '#4a5568',
    marginHorizontal: 16,
  },
  deleteButton: {
    padding: 8,
    marginRight: -8, // Shifts it closer to the edge naturally
  }
});
