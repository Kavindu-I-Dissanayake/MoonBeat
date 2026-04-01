import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, Vibration,
  Animated, Easing, Image
} from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
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

function SplashScreen({ isReady, onFinish }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const heartbeatProgress = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const creditOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1: Logo Fade In 
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(logoScale, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    ]).start();

    // Heartbeat Line: Draws mechanically (0 to 1) over 2500ms
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeatProgress, {
          toValue: 1, duration: 2500, useNativeDriver: false, easing: Easing.linear,
        }),
        Animated.timing(heartbeatProgress, {
          toValue: 0, duration: 0, useNativeDriver: false,
        }),
      ])
    ).start();

    // The precise moment the physically drawing heartbeat reaches the screen center (1250ms):
    setTimeout(() => {
      // 1. Text fades in and slides up natively right out of the background
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(textTranslateY, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      ]).start();

      // 2. Logo physically pulses outward exactly as the heartbeat spike hits
      Animated.sequence([
        Animated.timing(logoScale, { toValue: 1.05, duration: 300, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(logoScale, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ]).start();

    }, 1250);

    // Credit Text Appears softly right as the layout stabilizes
    setTimeout(() => {
      Animated.timing(creditOpacity, { toValue: 0.7, duration: 800, useNativeDriver: true }).start();
    }, 2000);
  }, []);

  // Listen for the `isReady` prop from the timer container to gracefully fade out everything
  useEffect(() => {
    if (isReady) {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }
  }, [isReady]);

  const pathLength = 550; // The true physical pixel length of the zigzag is ~524px
  const strokeDashoffset = heartbeatProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [pathLength, 0],
  });

  return (
    <Animated.View style={[styles.splashContainer, { opacity: containerOpacity }]}>

      {/* 
        The SVG Heartbeat statically positioned but dynamically traced across via strokeDashoffset!
      */}
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center', zIndex: 20 }]}>
        <Svg width="300" height="150" viewBox="0 0 300 150" style={{ position: 'absolute', marginTop: 115 }}>
          <AnimatedPath
            d="M 10 75 L 100 75 L 115 20 L 140 130 L 160 30 L 175 75 L 290 75"
            stroke="#39ff14"
            strokeWidth="3"
            fill="none"
            strokeDasharray={pathLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }], zIndex: 10 }}>
        <Image source={require('./assets/icon.png')} style={styles.splashLogoImage} />
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textTranslateY }], zIndex: 10 }}>
        <Text style={styles.splashTitle}>MoonBeat</Text>
      </Animated.View>

      <Animated.View style={[styles.splashCreditWrapper, { opacity: creditOpacity }]}>
        <Text style={styles.splashCreditText}>Developed by</Text>
        <Text style={styles.splashCreditTitle}>© Kavindu Dissanayake</Text>
        <Text style={styles.splashCreditVersion}>v1.0.0</Text>
      </Animated.View>
    </Animated.View>
  );
}

function MoonBeatTimer() {
  const [mainTimeStr, setMainTimeStr] = useState('25');
  const [gapTimeStr, setGapTimeStr] = useState('5');

  const [timeLeft, setTimeLeft] = useState(25);
  const [phase, setPhase] = useState('WORK');
  const [isRunning, setIsRunning] = useState(false);
  const [customAudioUri, setCustomAudioUri] = useState(null);

  const player = useAudioPlayer(customAudioUri ? customAudioUri : require('./assets/beep.wav'));
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      await setAudioModeAsync({ playsInSilentMode: true });

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

  const handleStop = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('WORK');
    setTimeLeft(parseInt(mainTimeStr, 10) || 0);
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
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Image source={require('./assets/icon.png')} style={styles.homeLogoImage} />
          <Text style={styles.title}>MoonBeat</Text>

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

      {/* Persistent Footer */}
      <View style={styles.persistentFooter}>
        <Text style={styles.footerText}>Developed by</Text>
        <Text style={styles.footerText}>© Kavindu Dissanayake</Text>
        <Text style={styles.footerText}>v1.0.0</Text>
      </View>
    </View>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    // Simulate a backend fetch, loading fonts, or checking login state
    const simulateLoading = setTimeout(() => {
      setIsReady(true);
    }, 3500);
    return () => clearTimeout(simulateLoading);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen isReady={isReady} onFinish={() => setIsSplashVisible(false)} />;
  }

  return <MoonBeatTimer />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
    paddingTop: Constants.statusBarHeight,
  },
  keyboardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0b0f1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogoImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    borderRadius: 30, // Beautiful rounded corners
    // Glowing drop shadow to match the background aesthetic
    shadowColor: '#8ab4f8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8, // Adds shadow support on Android
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#e2e8f0',
    letterSpacing: 3,
    marginTop: 150,
  },
  splashCreditWrapper: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  splashCreditText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  splashCreditTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  splashCreditVersion: {
    fontSize: 10,
    color: '#64748b',
  },
  homeLogoImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 15,
    marginTop: 55
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: 30,
    letterSpacing: 1,
    marginTop: 15,
  },
  card: {
    backgroundColor: '#1c2230',
    width: '100%',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
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
    marginBottom: 5,
  },
  statusIndicator: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: -10,
  },
  statusWork: {
    color: '#8ab4f8',
  },
  statusRest: {
    color: '#f6ad55',
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
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    marginBottom: 40,
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
    backgroundColor: '#4285f4',
  },
  stopButton: {
    backgroundColor: '#ef4444',
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
  persistentFooter: {
    width: '100%',
    alignItems: 'center',
    opacity: 0.6,
    paddingBottom: 25,
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  }
});
