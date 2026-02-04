import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLogStore = create(
    persist(
        (set) => ({
            logs: [], // Array of daily logs { date, morningCheckIn, eveningReflection, alignmentScore }

            addMorningCheckIn: (date, data) => set((state) => {
                const existingLogIndex = state.logs.findIndex(l => l.date === date);
                if (existingLogIndex >= 0) {
                    const newLogs = [...state.logs];
                    newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], morningCheckIn: data };
                    return { logs: newLogs };
                } else {
                    return { logs: [...state.logs, { date, morningCheckIn: data }] };
                }
            }),

            addEveningReflection: (date, data) => set((state) => {
                const existingLogIndex = state.logs.findIndex(l => l.date === date);
                if (existingLogIndex >= 0) {
                    const newLogs = [...state.logs];
                    newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], eveningReflection: data };
                    return { logs: newLogs };
                } else {
                    return { logs: [...state.logs, { date, eveningReflection: data }] };
                }
            }),

            calculateAlignment: (date) => {
                // Placeholder for the calculation logic to be triggered
            }
        }),
        {
            name: 'soultrack-log-storage',
        }
    )
);
