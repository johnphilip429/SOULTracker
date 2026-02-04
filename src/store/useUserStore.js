import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
    persist(
        (set) => ({
            name: '',
            isOnboardingCompleted: false,
            settings: {
                faithMode: false,
                theme: 'light',
                wakeTime: '07:00',
                sleepTime: '23:00',
            },

            setName: (name) => set({ name }),
            completeOnboarding: () => set({ isOnboardingCompleted: true }),
            toggleFaithMode: () => set((state) => ({
                settings: { ...state.settings, faithMode: !state.settings.faithMode }
            })),
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),
        }),
        {
            name: 'soultrack-user-storage',
        }
    )
);
