import { create } from 'zustand';

export type Wing = 'doctor' | 'lab' | 'citizen' | 'ministry' | 'admin';

interface NavigationState {
  currentWing: Wing;
  activeCommand: boolean;
  history: string[];
  favorites: string[];
  
  setWing: (wing: Wing) => void;
  toggleCommand: () => void;
  openCommand: () => void;
  closeCommand: () => void;
  addToHistory: (path: string) => void;
  toggleFavorite: (path: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentWing: 'doctor', // Default wing
  activeCommand: false,
  history: JSON.parse(localStorage.getItem('nav_history') || '[]'),
  favorites: JSON.parse(localStorage.getItem('nav_favorites') || '[]'),

  setWing: (wing) => set({ currentWing: wing }),
  toggleCommand: () => set((state) => ({ activeCommand: !state.activeCommand })),
  openCommand: () => set({ activeCommand: true }),
  closeCommand: () => set({ activeCommand: false }),
  
  addToHistory: (path) => set((state) => {
    const newHistory = [path, ...state.history.filter(p => p !== path)].slice(0, 10);
    localStorage.setItem('nav_history', JSON.stringify(newHistory));
    return { history: newHistory };
  }),

  toggleFavorite: (path) => set((state) => {
    const isFav = state.favorites.includes(path);
    const newFavs = isFav 
      ? state.favorites.filter(p => p !== path)
      : [...state.favorites, path];
    localStorage.setItem('nav_favorites', JSON.stringify(newFavs));
    return { favorites: newFavs };
  }),
}));
