const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns RoutineBlocks active on the given date (by day-of-week),
 * each annotated with its matching Exception for that date (if any).
 * Sorted by start_time ascending (nulls last).
 */
export function getScheduledBlocksForDate(dateStr, routineBlocks, exceptions) {
    if (!dateStr || !Array.isArray(routineBlocks) || routineBlocks.length === 0) return [];

    // Parse date at noon local time to avoid DST edge cases
    const date = new Date(dateStr + 'T12:00:00');
    const dayKey = DAY_KEYS[date.getDay()];
    const safeExceptions = Array.isArray(exceptions) ? exceptions : [];

    return routineBlocks
        .filter((block) =>
            Array.isArray(block.days_of_week) && block.days_of_week.includes(dayKey)
        )
        .map((block) => {
            const exception = safeExceptions.find((exc) =>
                exc.date === dateStr &&
                (exc.routine_block_id === block.id || exc.routine_block_id === null)
            ) ?? null;
            return { ...block, exception };
        })
        .sort((a, b) => {
            if (!a.start_time && !b.start_time) return 0;
            if (!a.start_time) return 1;
            if (!b.start_time) return -1;
            return a.start_time.localeCompare(b.start_time);
        });
}

/**
 * Returns recurring tasks active on the given date, each annotated with
 * _completed (bool) for that date.
 */
export function getRecurringTasksForDate(dateStr, recurringTasks) {
    if (!dateStr || !Array.isArray(recurringTasks) || recurringTasks.length === 0) return [];

    const date = new Date(dateStr + 'T12:00:00');
    const dayKey = DAY_KEYS[date.getDay()];

    return recurringTasks.filter((task) => {
        if (!task.recurrence) return false;
        if (task.recurrence.type === 'daily') return true;
        if (task.recurrence.type === 'weekly') {
            return Array.isArray(task.recurrence.days_of_week) &&
                task.recurrence.days_of_week.includes(dayKey);
        }
        return false;
    }).map((task) => ({
        ...task,
        _completed: Boolean(task.completions?.[dateStr]),
    }));
}

/**
 * Returns the Leave exception for a specific block on a given date, or null.
 */
export function getLeaveException(dateStr, blockId, exceptions) {
    if (!Array.isArray(exceptions)) return null;
    return exceptions.find((exc) =>
        exc.date === dateStr &&
        exc.type === 'Leave' &&
        (exc.routine_block_id === blockId || exc.routine_block_id === null)
    ) ?? null;
}
