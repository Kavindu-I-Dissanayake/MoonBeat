import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import Icon from '../components/Icon';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { clearAllPresets } from '../services/storage';

export default function SettingsModal({ isVisible, onClose, settings, updateSettings, onClearPresetsComplete }) {

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateSettings({ customSoundUri: result.assets[0].uri });
      }
    } catch (err) {
      console.log('Error picking audio:', err);
    }
  };

  const handleClearPresets = () => {
    Alert.alert(
      "Clear All Presets?",
      "This will permanently shred all your saved custom timer lengths. Are you extremely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Wipe All Data",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            await clearAllPresets();
            if (onClearPresetsComplete) onClearPresetsComplete();
          }
        }
      ]
    );
  };

  if (!settings) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>⚙️ Configurations</Text>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onClose(); }} style={styles.closeBtn}>
              <Icon name="times" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 40 }}>

            {/* Audio Block */}
            <Text style={styles.sectionHeader}>AUDIO ALARMS</Text>
            <View style={styles.card}>
              <View style={styles.rowItem}>
                <View style={{ flex: 1, marginRight: 15 }}>
                  <Text style={styles.itemTitle}>Enable Sound</Text>
                  <Text style={styles.itemSubText}>Play alarm at end of cycles</Text>
                </View>
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={(val) => updateSettings({ soundEnabled: val })}
                  trackColor={{ false: '#334155', true: '#4285f4' }}
                />
              </View>

              <View style={[styles.rowItem, { borderBottomWidth: 0, opacity: settings.soundEnabled ? 1 : 0.5 }]} pointerEvents={settings.soundEnabled ? 'auto' : 'none'}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>Custom Audio Override</Text>
                  <Text style={styles.itemSubText}>{settings.customSoundUri ? "Custom Installed!" : "Default Beep"}</Text>
                </View>
                <TouchableOpacity style={styles.actionBtn} onPress={pickAudio}>
                  <Text style={styles.actionBtnText}>Change</Text>
                </TouchableOpacity>
                {settings.customSoundUri && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#ef4444', marginLeft: 10, width: 45, alignItems: 'center', justifyContent: 'center' }]}
                    onPress={() => updateSettings({ customSoundUri: null })}
                  >
                    <Icon name="trash" size={14} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Hardware Block */}
            <Text style={styles.sectionHeader}>DEVICE PERIPHERALS</Text>
            <View style={styles.card}>
              <View style={styles.rowItem}>
                <View style={{ flex: 1, marginRight: 15 }}>
                  <Text style={styles.itemTitle}>Force Haptic Vibration</Text>
                  <Text style={styles.itemSubText}>Physical motor rumble on switch</Text>
                </View>
                <Switch
                  value={settings.vibrationEnabled}
                  onValueChange={(val) => updateSettings({ vibrationEnabled: val })}
                  trackColor={{ false: '#334155', true: '#4285f4' }}
                />
              </View>

              <View style={[styles.rowItem, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1, marginRight: 15 }}>
                  <Text style={styles.itemTitle}>Keep Screen Awake</Text>
                  <Text style={styles.itemSubText}>Block sleep while loop is active</Text>
                </View>
                <Switch
                  value={settings.keepAwake}
                  onValueChange={(val) => updateSettings({ keepAwake: val })}
                  trackColor={{ false: '#334155', true: '#4285f4' }}
                />
              </View>
            </View>

            {/* Loop Block */}
            <Text style={styles.sectionHeader}>TIMER BEHAVIORS</Text>
            <View style={styles.card}>
              <View style={[styles.rowItem, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1, marginRight: 15 }}>
                  <Text style={styles.itemTitle}>Auto-Start Next Phase</Text>
                  <Text style={styles.itemSubText}>Continuously loop automatically between phases</Text>
                </View>
                <Switch
                  value={settings.autoStart}
                  onValueChange={(val) => updateSettings({ autoStart: val })}
                  trackColor={{ false: '#334155', true: '#4285f4' }}
                />
              </View>
            </View>

            {/* Danger Zone */}
            <Text style={[styles.sectionHeader, { color: '#ef4444', marginTop: 30 }]}>DANGER ZONE</Text>
            <TouchableOpacity style={styles.dangerCard} onPress={handleClearPresets} activeOpacity={0.7}>
              <Icon name="exclamation_triangle" size={16} color="#ef4444" />
              <Text style={styles.dangerText}>Wipe All Custom Presets</Text>
            </TouchableOpacity>

          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0b0f1a', // Perfectly matches app background hue
    height: '87%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 30,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1f2937'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: '#e2e8f0',
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 8,
    marginRight: -8,
  },
  scrollBody: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  itemTitle: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '700',
  },
  itemSubText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 5,
  },
  actionBtn: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dangerCard: {
    flexDirection: 'row',
    backgroundColor: '#450a0a',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  dangerText: {
    color: '#fca5a5',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    letterSpacing: 0.5,
  }
});
