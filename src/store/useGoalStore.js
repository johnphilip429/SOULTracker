import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGoalStore = create(
    persist(
        (set) => ({
            goals: [],

            addGoal: (goal) => set((state) => ({
                goals: [
                    ...state.goals,
                    {
                        id: crypto.randomUUID(),
                        completed: false,
                        createdAt: new Date().toISOString(),
                        ...goal
                    }
                ]
            })),

            updateGoal: (id, updates) => set((state) => ({
                goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g))
            })),

            deleteGoal: (id) => set((state) => ({
                goals: state.goals.filter((g) => g.id !== id)
            })),
        }),
        {
            name: 'soultrack-goal-storage',
        }
    )
);
