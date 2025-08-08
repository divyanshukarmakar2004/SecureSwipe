import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  highRiskThreshold: number;
  showHighRiskOnly: boolean;
  realTimeNotifications: boolean;
  emailAlerts: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  calculateRiskLevel: (flaggedTransactionCount: number) => 'low' | 'medium' | 'high';
}

const defaultSettings: Settings = {
  highRiskThreshold: 5,
  showHighRiskOnly: false,
  realTimeNotifications: true,
  emailAlerts: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    // Load settings from localStorage on initialization
    const savedSettings = localStorage.getItem('fraud-detection-settings');
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    // Save to localStorage
    localStorage.setItem('fraud-detection-settings', JSON.stringify(updatedSettings));
  };

  const calculateRiskLevel = (flaggedTransactionCount: number): 'low' | 'medium' | 'high' => {
    if (flaggedTransactionCount === 0 || flaggedTransactionCount === 1) {
      return 'low';
    } else if (flaggedTransactionCount >= settings.highRiskThreshold) {
      return 'high';
    } else {
      return 'medium';
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, calculateRiskLevel }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

