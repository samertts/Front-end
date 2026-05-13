import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeatureFlags {
  enableAiDiagnostics: boolean;
  enableEmergencyMode: boolean;
  enableOfflineSync: boolean;
  enableBiometrics: boolean;
  enableTelemetry: boolean;
  setFlag: (key: keyof Omit<FeatureFlags, 'setFlag' | 'reset'>, value: boolean) => void;
  reset: () => void;
}

export const useFeatureFlags = create<FeatureFlags>()(
  persist(
    (set) => ({
      enableAiDiagnostics: true,
      enableEmergencyMode: false,
      enableOfflineSync: true,
      enableBiometrics: true,
      enableTelemetry: true,
      setFlag: (key, value) => set({ [key]: value }),
      reset: () => set({
        enableAiDiagnostics: true,
        enableEmergencyMode: false,
        enableOfflineSync: true,
        enableBiometrics: true,
        enableTelemetry: true,
      }),
    }),
    {
      name: 'gula_feature_flags',
    }
  )
);
