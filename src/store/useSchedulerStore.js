import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const CATEGORIES = {
    Office: { label: 'Office', color: '#3B82F6' },
    Gym: { label: 'Gym', color: '#22C55E' },
    GamingChannel: { label: 'Gaming Channel', color: '#A855F7' },
    FaithTechChannel: { label: 'Faith/Tech Channel', color: '#F59E0B' },
    Life: { label: 'Life', color: '#14B8A6' },
};

export const PRIORITIES = {
    high: { label: 'High', color: '#EF4444' },
    medium: { label: 'Medium', color: '#F59E0B' },
    low: { label: 'Low', color: '#6B7280' },
};

export const useSchedulerStore = create(
    persist(
        (set) => ({
            tasks: [],
            recurringTasks: [],
            routineBlocks: [],
            exceptions: [],

            // --- Task actions ---
            addTask: (task) => set((state) => ({
                tasks: [
                    ...state.tasks,
                    {
                        id: crypto.randomUUID(),
                        title: task.title,
                        category: task.category,
                        priority: task.priority || 'medium',
                        scheduled_date: task.scheduled_date,
                        scheduled_start: task.scheduled_start || null,
                        scheduled_end: task.scheduled_end || null,
                        recurring: false,
                        completed: false,
                        actual_start: null,
                        actual_end: null,
                        createdAt: new Date().toISOString(),
                    },
                ],
            })),

            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
            })),

            startTask: (id) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id && !t.actual_start
                        ? { ...t, actual_start: new Date().toISOString() }
                        : t
                ),
            })),

            toggleTask: (id) => set((state) => ({
                tasks: state.tasks.map((t) => {
                    if (t.id !== id) return t;
                    if (t.completed) {
                        // uncompleting — clear actual_end, keep actual_start
                        return { ...t, completed: false, actual_end: null };
                    }
                    return { ...t, completed: true, actual_end: new Date().toISOString() };
                }),
            })),

            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
            })),

            // --- RoutineBlock actions ---
            addRoutineBlock: (block) => set((state) => ({
                routineBlocks: [
                    ...state.routineBlocks,
                    {
                        id: crypto.randomUUID(),
                        label: block.label,
                        category: block.category,
                        days_of_week: block.days_of_week,
                        start_time: block.start_time || null,
                        end_time: block.end_time || null,
                        color: CATEGORIES[block.category]?.color ?? '#6B7280',
                        createdAt: new Date().toISOString(),
                    },
                ],
            })),

            updateRoutineBlock: (id, updates) => set((state) => ({
                routineBlocks: state.routineBlocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
            })),

            deleteRoutineBlock: (id) => set((state) => ({
                routineBlocks: state.routineBlocks.filter((b) => b.id !== id),
                // Remove orphaned exceptions for this block
                exceptions: state.exceptions.filter((e) => e.routine_block_id !== id),
            })),

            // --- Recurring task actions ---
            addRecurringTask: (task) => set((state) => ({
                recurringTasks: [
                    ...state.recurringTasks,
                    {
                        id: crypto.randomUUID(),
                        title: task.title,
                        category: task.category,
                        priority: task.priority || 'medium',
                        scheduled_start: task.scheduled_start || null,
                        scheduled_end: task.scheduled_end || null,
                        recurrence: task.recurrence, // { type: 'daily'|'weekly', days_of_week: [...] }
                        completions: {}, // { [dateStr]: true }
                        createdAt: new Date().toISOString(),
                    },
                ],
            })),

            toggleRecurringCompletion: (id, dateStr) => set((state) => ({
                recurringTasks: state.recurringTasks.map((t) => {
                    if (t.id !== id) return t;
                    const completions = { ...t.completions };
                    if (completions[dateStr]) {
                        delete completions[dateStr];
                    } else {
                        // store actual_end timestamp alongside completion flag
                        completions[dateStr] = { completed: true, actual_end: new Date().toISOString() };
                    }
                    return { ...t, completions };
                }),
            })),

            deleteRecurringTask: (id) => set((state) => ({
                recurringTasks: state.recurringTasks.filter((t) => t.id !== id),
            })),

            // --- Exception actions ---
            addException: (exc) => set((state) => ({
                exceptions: [
                    ...state.exceptions,
                    {
                        // defaults for optional fields
                        routine_block_id: null,
                        note: null,
                        // caller fields (including override_end_time, override_start_time, etc.)
                        ...exc,
                        // always generated
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                    },
                ],
            })),

            removeException: (id) => set((state) => ({
                exceptions: state.exceptions.filter((e) => e.id !== id),
            })),
        }),
        { name: 'soultrack-scheduler-storage' }
    )
);
