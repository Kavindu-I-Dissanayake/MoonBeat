import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/storage';

export function useSettings() {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    customSoundUri: null,
    vibrationEnabled: true,
    autoStart: true,
    keepAwake: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getSettings();
      setSettings(stored);
      setIsLoading(false);
    })();
  }, []);

  const updateSettings = async (updates) => {
    const newSettings = { ...settings, ...updates };
    // Optimistically update instantly
    setSettings(newSettings);
    // Sync to disk
    await saveSettings(newSettings);
  };

  return { settings, updateSettings, isLoading };
}
