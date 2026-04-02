import { useState, useEffect, useRef } from 'react';
import { Alert, Keyboard, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';
let Notifications;
if (!isExpoGo) {
  Notifications = require('expo-notifications');
}

export function useTimerEngine(player, settings, onSessionComplete) {
  const [mainTimeStr, setMainTimeStr] = useState('25');
  const [gapTimeStr, setGapTimeStr] = useState('5');

  const [timeLeft, setTimeLeft] = useState(25);
  const [phase, setPhase] = useState('WORK');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workRoundsCompleted, setWorkRoundsCompleted] = useState(0);
  
  const [sessionTimeElapsed, setSessionTimeElapsed] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const timerRef = useRef(null);

  const triggerAlarm = () => {
    if (settings?.soundEnabled) {
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
    }

    if (settings?.vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Vibration.vibrate([0, 500, 200, 500]);
    }

    if (!isExpoGo && Notifications) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "🌙 MoonBeat",
          body: "Phase completed. Time to switch!",
        },
        trigger: null,
      }).catch(() => {});
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
    setSessionTimeElapsed(0);
    setWorkRoundsCompleted(0);
    setSessionStartTime(new Date().toISOString());
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (isRunning) {
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleResume = () => {
    if (isRunning && isPaused) {
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    // Generate history object BEFORE we clear the state payloads!
    if (sessionTimeElapsed > 0 && onSessionComplete) {
      onSessionComplete({
        id: Date.now().toString(),
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        totalSessionTime: sessionTimeElapsed,
        workRoundsCompleted: workRoundsCompleted
      });
    }

    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('WORK');
    setTimeLeft(parseInt(mainTimeStr, 10) || 0);
    setSessionTimeElapsed(0);
    setWorkRoundsCompleted(0);
    setSessionStartTime(null);
  };

  const handleSelectPreset = (m, g) => {
    if (isRunning) handleStop();
    setMainTimeStr(m);
    setGapTimeStr(g);
    setPhase('WORK');
    setTimeLeft(parseInt(m, 10));
    setSessionTimeElapsed(0);
    setWorkRoundsCompleted(0);
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setSessionTimeElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (isRunning && timeLeft <= 0) {
      triggerAlarm();
      if (phase === 'WORK') {
        setWorkRoundsCompleted(prev => prev + 1);
        setPhase('REST');
        setTimeLeft(parseInt(gapTimeStr, 10));
      } else if (phase === 'REST') {
        if (settings?.autoStart) {
          setPhase('WORK');
          setTimeLeft(parseInt(mainTimeStr, 10));
        } else {
          handleStop();
        }
      }
    }
  }, [timeLeft, isRunning, phase, gapTimeStr, mainTimeStr, settings?.autoStart]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatSessionTime = (seconds) => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
    return formatTime(seconds);
  };

  return {
    mainTimeStr, setMainTimeStr,
    gapTimeStr, setGapTimeStr,
    timeLeft,
    phase,
    isRunning,
    isPaused,
    sessionTimeElapsed,
    workRoundsCompleted,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleSelectPreset,
    formatTime,
    formatSessionTime
  };
}
