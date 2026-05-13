import { create } from 'zustand';

interface UIState {
  isFocusMode: boolean;
  isCommandPaletteOpen: boolean;
  systemStatus: {
    sync: 'idle' | 'syncing' | 'error';
    ai: 'ready' | 'processing' | 'offline';
    network: 'online' | 'degraded' | 'offline';
  };
  theme: 'light' | 'dark' | 'contrast';
  recentActions: { id: string; label: string; to: string; timestamp: number }[];
  
  setTheme: (theme: 'light' | 'dark' | 'contrast') => void;
  toggleFocusMode: () => void;
  toggleCommandPalette: () => void;
  setCommandPalette: (open: boolean) => void;
  updateSystemStatus: (key: keyof UIState['systemStatus'], status: any) => void;
  addRecentAction: (action: { label: string; to: string }) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isFocusMode: false,
  isCommandPaletteOpen: false,
  systemStatus: {
    sync: 'idle',
    ai: 'ready',
    network: 'online'
  },
  theme: (localStorage.getItem('gula-theme') as any) || 'light',
  recentActions: [],

  setTheme: (theme) => {
    localStorage.setItem('gula-theme', theme);
    set({ theme });
  },
  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPalette: (open) => set({ isCommandPaletteOpen: open }),
  updateSystemStatus: (key, status) => set((state) => ({
    systemStatus: { ...state.systemStatus, [key]: status }
  })),
  addRecentAction: (action) => set((state) => {
    const newAction = { ...action, id: Math.random().toString(), timestamp: Date.now() };
    const filtered = state.recentActions.filter(a => a.to !== action.to).slice(0, 4);
    return { recentActions: [newAction, ...filtered] };
  })
}));
