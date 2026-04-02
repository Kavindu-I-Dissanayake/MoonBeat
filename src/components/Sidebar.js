import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableWithoutFeedback,
  Dimensions, ScrollView, TouchableOpacity, Easing, Image
} from 'react-native';
import PresetItem from './PresetItem';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

export default function Sidebar({ isOpen, onClose, presets, onSelect, onDelete, onAddPreset, onOpenSettings, onOpenHistory }) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendering(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.poly(4)),
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.6, // Dim background heavily
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.poly(4)),
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsRendering(false);
      });
    }
  }, [isOpen]);

  if (!isOpen && !isRendering) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Background Dim Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.dimBackground, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Actual Physical Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>MoonBeat Presets</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onOpenSettings(); }} style={[styles.closeBtn, { marginRight: 15 }]}>
              <FontAwesome5 name="cog" size={20} color="#cbd5e1" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onClose(); }} style={styles.closeBtn}>
              <FontAwesome5 name="times" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onAddPreset();
          }}
        >
          <FontAwesome5 name="plus" size={16} color="#8ab4f8" />
          <Text style={styles.addButtonText}>Save Current Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#111827', marginTop: -8, marginBottom: 24 }]}
          activeOpacity={0.7}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenHistory();
          }}
        >
          <FontAwesome5 name="history" size={16} color="#94a3b8" />
          <Text style={[styles.addButtonText, { color: '#cbd5e1' }]}>Recent History</Text>
        </TouchableOpacity>

        <ScrollView style={styles.presetList} contentContainerStyle={{ paddingBottom: 20 }}>
          {presets.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome5 name="clock" size={32} color="#4a5568" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>No presets saved yet.</Text>
              <Text style={styles.emptySubtext}>Configure a timer and hit save!</Text>
            </View>
          ) : (
            presets.map(p => (
              <PresetItem
                key={p.id}
                preset={p}
                onSelect={(m, g) => {
                  onSelect(m, g);
                  onClose();
                }}
                onDelete={onDelete}
              />
            ))
          )}
        </ScrollView>

        <View style={styles.aboutSection}>
          <View style={styles.divider} />
          <View style={styles.aboutHeader}>
            <Image source={require('../../assets/icon.png')} style={styles.aboutLogo} />
            <View>
              <Text style={styles.aboutTitle}>MoonBeat</Text>
              <Text style={styles.aboutVersion}>v1.2.0</Text>
            </View>
          </View>
          <Text style={styles.aboutDesc}>An ultra-precise interval timer beautifully engineered for focus and rhythm. Features dynamic animations, custom audio alarms, and native haptic feedback.</Text>
          <Text style={styles.aboutDev}>Developed by ©Kavindu Dissanayake</Text>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dimBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawer: {
    ...StyleSheet.absoluteFillObject,
    width: DRAWER_WIDTH,
    backgroundColor: '#111827', // Sleek navy/black
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 10, height: 0 },
    paddingTop: 60, // Clear the status bar beautifully
    paddingBottom: 35,
    borderRightWidth: 1,
    borderColor: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#e2e8f0',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 8,
    marginRight: -8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#8ab4f8',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '700',
  },
  presetList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },
  aboutSection: {
    paddingHorizontal: 24,
    marginTop: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginBottom: 20,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#cbd5e1',
    marginBottom: 2,
  },
  aboutVersion: {
    fontSize: 11,
    color: '#8ab4f8',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  aboutDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
  },
  aboutDev: {
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
  }
});
