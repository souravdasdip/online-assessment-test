import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  // Define your state here
  isReady: boolean;
  setReady: (ready: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isReady: false,
      setReady: (ready) => set({ isReady: ready }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
