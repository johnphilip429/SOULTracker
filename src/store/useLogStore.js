import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLogStore = create(
    persist(
        (set) => ({
            logs: [], // Array of daily logs { date, morningCheckIn, eveningReflection, alignmentScore }

            addMorningCheckIn: (date, data, timestamp = new Date().toISOString()) => set((state) => {
                const existingLogIndex = state.logs.findIndex(l => l.date === date);
                if (existingLogIndex >= 0) {
                    const newLogs = [...state.logs];
                    newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], morningCheckIn: data, morningCheckInAt: timestamp };
                    return { logs: newLogs };
                } else {
                    return { logs: [...state.logs, { date, morningCheckIn: data, morningCheckInAt: timestamp }] };
                }
            }),

            addEveningReflection: (date, data, timestamp = new Date().toISOString()) => set((state) => {
                const existingLogIndex = state.logs.findIndex(l => l.date === date);
                if (existingLogIndex >= 0) {
                    const newLogs = [...state.logs];
                    newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], eveningReflection: data, eveningReflectionAt: timestamp };
                    return { logs: newLogs };
                } else {
                    return { logs: [...state.logs, { date, eveningReflection: data, eveningReflectionAt: timestamp }] };
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
