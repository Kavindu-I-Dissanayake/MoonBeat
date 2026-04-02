import AsyncStorage from '@react-native-async-storage/async-storage';

const PRESETS_KEY = '@moonbeat_presets';
const SETTINGS_KEY = '@moonbeat_settings';
const HISTORY_KEY = '@moonbeat_history';

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  customSoundUri: null,
  vibrationEnabled: true,
  autoStart: true,
  keepAwake: true
};

export const getPresets = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(PRESETS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load presets', e);
    return [];
  }
};

export const savePreset = async (mainTime, gapTime) => {
  try {
    const presets = await getPresets();
    
    // Prevent exactly identical duplicates
    if (presets.some(p => p.mainTime === parseInt(mainTime, 10) && p.gapTime === parseInt(gapTime, 10))) {
      return presets; 
    }

    const newPreset = {
      id: Date.now().toString(),
      mainTime: parseInt(mainTime, 10),
      gapTime: parseInt(gapTime, 10),
    };
    
    const updatedPresets = [...presets, newPreset];
    await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(updatedPresets));
    return updatedPresets;
  } catch (e) {
    console.error('Failed to save preset', e);
    return null;
  }
};

export const deletePreset = async (id) => {
  try {
    const presets = await getPresets();
    const updatedPresets = presets.filter(p => p.id !== id);
    await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(updatedPresets));
    return updatedPresets;
  } catch (e) {
    console.error('Failed to delete preset', e);
    return null;
  }
};

export const clearAllPresets = async () => {
  try {
    await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify([]));
    return [];
  } catch (e) {
    console.error('Failed to clear presets', e);
    return null;
  }
};

export const getSettings = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    return jsonValue != null ? { ...DEFAULT_SETTINGS, ...JSON.parse(jsonValue) } : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Failed to load settings', e);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settingsPayload) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsPayload));
    return settingsPayload;
  } catch (e) {
    console.error('Failed to save settings', e);
    return null;
  }
};

export const getSavedHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
};

export const saveHistoryEntry = async (sessionPayload) => {
  try {
    const history = await getSavedHistory();
    // Prepend to show newest first!
    const updatedHistory = [sessionPayload, ...history];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (e) {
    console.error('Failed to save history entry', e);
    return null;
  }
};

export const deleteHistoryEntry = async (id) => {
  try {
    const history = await getSavedHistory();
    const updatedHistory = history.filter(h => h.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (e) {
    console.error('Failed to delete history entry', e);
    return null;
  }
};
