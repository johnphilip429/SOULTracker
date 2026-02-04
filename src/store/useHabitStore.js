import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSameDay, subDays } from 'date-fns';

export const useHabitStore = create(
    persist(
        (set, get) => ({
            habits: [],

            addHabit: (habit) => set((state) => ({
                habits: [
                    ...state.habits,
                    {
                        id: crypto.randomUUID(),
                        streak: 0,
                        completedDates: [],
                        archived: false,
                        createdAt: new Date().toISOString(),
                        ...habit
                    }
                ]
            })),

            updateHabit: (id, updates) => set((state) => ({
                habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h))
            })),

            deleteHabit: (id) => set((state) => ({
                habits: state.habits.filter((h) => h.id !== id)
            })),

            toggleHabitCompletion: (id, dateStr) => set((state) => {
                return {
                    habits: state.habits.map((h) => {
                        if (h.id !== id) return h;

                        const isCompleted = h.completedDates.includes(dateStr);
                        let newCompletedDates;

                        if (isCompleted) {
                            newCompletedDates = h.completedDates.filter(d => d !== dateStr);
                        } else {
                            newCompletedDates = [...h.completedDates, dateStr];
                        }

                        // Simple streak recalculation (can be enhanced later)
                        // This is a naive implementation; for production, we'd traverse backwards
                        let streak = 0;
                        // logic to be added if needed for rigorous calculation

                        return {
                            ...h,
                            completedDates: newCompletedDates
                            // streak update would happen here
                        };
                    })
                };
            }),
        }),
        {
            name: 'soultrack-habit-storage',
        }
    )
);
