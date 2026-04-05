// src/utils/vibration.js
import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';

/**
 * Unified vibration / haptic helper.
 * Primary: Expo Haptics (high‑fidelity, works on iOS & Android).
 * Fallback: native Vibration API (guaranteed on Android).
 *
 * @param {boolean} enabled – user setting `vibrationEnabled`
 */
export const triggerVibration = (enabled) => {
  if (!enabled) return;
  // Try expo‑haptics first – it never throws but we catch just in case.
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  // Native fallback pattern (pause‑vibrate‑pause‑vibrate)
  Vibration.vibrate([0, 200, 100, 200]);
};
