import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, Vibration
} from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';


const isExpoGo = Constants.appOwnership === 'expo';

let Notifications;
if (!isExpoGo) {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export default function App() {
  const [mainTimeStr, setMainTimeStr] = useState('25');
  const [gapTimeStr, setGapTimeStr] = useState('5');

  const [timeLeft, setTimeLeft] = useState(25);
  const [phase, setPhase] = useState('WORK'); // 'WORK' or 'REST'
  const [isRunning, setIsRunning] = useState(false);
  const [customAudioUri, setCustomAudioUri] = useState(null);

  const player = useAudioPlayer(customAudioUri ? customAudioUri : require('./assets/beep.wav'));
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Configure audio to play even if the phone physical switch is set to silent/vibrate
      await setAudioModeAsync({ playsInSilentMode: true });

      // Do not run notification permission requests in Expo Go as it's not supported
      if (isExpoGo) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);

  const triggerAlarm = () => {
    try {
      if (player) {
        if (typeof player.seekTo === 'function') {
          player.seekTo(0);
        } else if (typeof player.setPositionAsync === 'function') {
          player.setPositionAsync(0);
        }
        player.play();
      }
    } catch (e) {
      console.log('Error playing sound', e);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

    // Add a highly noticeable double-buzz
    Vibration.vibrate([0, 500, 200, 500]);

    // Only schedule local notifications if we are NOT in Expo Go
    if (!isExpoGo) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "🌙 MoonBeat",
          body: "Work cycle completed. Time to rest!",
        },
        trigger: null,
      }).catch(() => { });
    }
  };

  const handleStart = () => {
    const mainTimeVal = parseInt(mainTimeStr, 10);
    const gapTimeVal = parseInt(gapTimeStr, 10);

    if (isNaN(mainTimeVal) || mainTimeVal <= 0 || isNaN(gapTimeVal) || gapTimeVal <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers for both Main Time and Gap Time.');
      return;
    }

    Keyboard.dismiss();
    setPhase('WORK');
    setTimeLeft(mainTimeVal);
    setIsRunning(true);
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCustomAudioUri(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Error picking audio:', err);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('WORK');
    setTimeLeft(parseInt(mainTimeStr, 10) || 0); // Reset UI
  };

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft <= 0) {
      if (phase === 'WORK') {
        triggerAlarm();
        setPhase('REST');
        setTimeLeft(parseInt(gapTimeStr, 10));
      } else if (phase === 'REST') {
        setPhase('WORK');
        setTimeLeft(parseInt(mainTimeStr, 10));
      }
    }
  }, [timeLeft, isRunning, phase, gapTimeStr, mainTimeStr]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>🌙 MoonBeat</Text>

        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Main Time (seconds)</Text>
            <TextInput
              style={styles.input}
              value={mainTimeStr}
              onChangeText={setMainTimeStr}
              keyboardType="numeric"
              editable={!isRunning}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gap Time (seconds)</Text>
            <TextInput
              style={styles.input}
              value={gapTimeStr}
              onChangeText={setGapTimeStr}
              keyboardType="numeric"
              editable={!isRunning}
            />
          </View>

          <TouchableOpacity 
            style={styles.audioPickerButton} 
            onPress={pickAudio}
            disabled={isRunning}
          >
            <Text style={styles.audioPickerText}>
              {customAudioUri ? "🎵 Custom Audio Selected!" : "🎵 Choose MP3 Alarm"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timerContainer}>
          <Text style={[styles.statusIndicator, phase === 'REST' ? styles.statusRest : styles.statusWork]}>
            {isRunning ? `${phase} PHASE` : 'READY'}
          </Text>
          <Text style={styles.countdown}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={styles.subText}>Next alarm in: {timeLeft}s</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.startButton, isRunning && styles.buttonDisabled]}
            onPress={handleStart}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>START</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.stopButton, !isRunning && styles.buttonDisabled]}
            onPress={handleStop}
            disabled={!isRunning}
          >
            <Text style={styles.buttonText}>STOP</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a', // Dark mode background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: 40,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1c2230', // Card color
    width: '100%',
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#2d3748',
    color: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  audioPickerButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#4b5563',
    borderStyle: 'dashed',
  },
  audioPickerText: {
    color: '#e2e8f0',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  statusIndicator: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  statusWork: {
    color: '#8ab4f8', // Soft blue accent
  },
  statusRest: {
    color: '#f6ad55', // Rest accent color (orangeish)
  },
  countdown: {
    fontSize: 80,
    fontWeight: '300',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  subText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  startButton: {
    backgroundColor: '#4285f4', // Start blue
  },
  stopButton: {
    backgroundColor: '#ef4444', // Stop red
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
