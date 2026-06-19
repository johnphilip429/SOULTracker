import React, { useState } from 'react';
import { format } from 'date-fns';
import { Sun, Moon, CheckCircle, Circle, Plus, Trash2, X, CalendarDays, Umbrella, RotateCcw, RefreshCw, Clock, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useHabitStore } from '../store/useHabitStore';
import { useLogStore } from '../store/useLogStore';
import { useSchedulerStore, CATEGORIES, PRIORITIES } from '../store/useSchedulerStore';
import { getScheduledBlocksForDate, getRecurringTasksForDate } from '../lib/scheduleUtils';
import { getDailyQuote } from '../lib/quotes';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMPTY_FORM = {
    title: '',
    category: 'Life',
    priority: 'medium',
    scheduled_start: '',
    scheduled_end: '',
    recurrence: 'none',        // 'none' | 'daily' | 'weekly'
    recurrence_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
};

// Per-category card styling (bg + border + left-border accent)
const CARD_STYLES = {
    Office:           { bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.18)',  accent: '#3B82F6' },
    Gym:              { bg: 'rgba(20,184,166,0.07)',  border: 'rgba(20,184,166,0.18)',  accent: '#14B8A6' },
    GamingChannel:    { bg: 'rgba(168,85,247,0.07)', border: 'rgba(168,85,247,0.18)', accent: '#A855F7' },
    FaithTechChannel: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.18)', accent: '#F59E0B' },
    Life:             { bg: 'rgba(20,184,166,0.07)',  border: 'rgba(20,184,166,0.18)',  accent: '#14B8A6' },
};

export default function Today() {
    const { name, settings } = useUserStore();
    const { habits, toggleHabitCompletion } = useHabitStore();
    const { logs } = useLogStore();
    const { tasks, addTask, startTask, toggleTask, deleteTask,
            recurringTasks, addRecurringTask, toggleRecurringCompletion, deleteRecurringTask,
            routineBlocks, exceptions, addException, removeException } = useSchedulerStore();
    const navigate = useNavigate();

    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    const quote = getDailyQuote(settings.faithMode);

    // --- Check-in nudge ---
    const todayLog = logs.find((l) => l.date === dateStr);
    const morningDone = Boolean(todayLog?.morningCheckIn);
    const eveningDone = Boolean(todayLog?.eveningReflection);
    const morningAt = todayLog?.morningCheckInAt ? new Date(todayLog.morningCheckInAt) : null;
    const hoursSinceMorning = morningAt ? (today - morningAt) / 3600000 : 0;
    const eveningAvailable = morningDone && !eveningDone && hoursSinceMorning >= 5;
    const [nudgeDismissed, setNudgeDismissed] = useState(false);
    const showNudge = !nudgeDismissed && (!morningDone || eveningAvailable);

    // Spillover (Modified exception) state
    const [spilloverBlockId, setSpilloverBlockId] = useState(null);
    const [spilloverTime, setSpilloverTime] = useState('');

    // --- Routine blocks for today ---
    const todayBlocks = getScheduledBlocksForDate(dateStr, routineBlocks, exceptions);

    const handleMarkLeave = (block) => {
        // Clear any Modified exception first (mutually exclusive with Leave)
        const modified = exceptions.find(
            (e) => e.date === dateStr && e.type === 'Modified' && e.routine_block_id === block.id
        );
        if (modified) removeException(modified.id);
        const alreadyLeave = exceptions.some(
            (e) => e.date === dateStr && e.type === 'Leave' &&
            (e.routine_block_id === block.id || e.routine_block_id === null)
        );
        if (!alreadyLeave) {
            addException({ date: dateStr, type: 'Leave', routine_block_id: block.id });
        }
    };

    const handleRemoveLeave = (exceptionId) => removeException(exceptionId);

    const handleSaveSpillover = (block) => {
        if (!spilloverTime) return;
        // Remove any existing Modified exception for this block today
        const existing = exceptions.find(
            (e) => e.date === dateStr && e.type === 'Modified' && e.routine_block_id === block.id
        );
        if (existing) removeException(existing.id);
        addException({ date: dateStr, type: 'Modified', routine_block_id: block.id, override_end_time: spilloverTime });
        setSpilloverBlockId(null);
        setSpilloverTime('');
    };

    const handleRemoveModified = (exceptionId) => removeException(exceptionId);

    // --- Tasks ---
    const todayTasks = tasks.filter((t) => t.scheduled_date === dateStr);
    const todayRecurring = getRecurringTasksForDate(dateStr, recurringTasks);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [taskForm, setTaskForm] = useState(EMPTY_FORM);

    const toggleRecurrenceDay = (day) => {
        setTaskForm((f) => ({
            ...f,
            recurrence_days: f.recurrence_days.includes(day)
                ? f.recurrence_days.filter((d) => d !== day)
                : [...f.recurrence_days, day],
        }));
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!taskForm.title.trim()) return;
        if (taskForm.recurrence === 'none') {
            addTask({
                title: taskForm.title,
                category: taskForm.category,
                priority: taskForm.priority,
                scheduled_date: dateStr,
                scheduled_start: taskForm.scheduled_start || null,
                scheduled_end: taskForm.scheduled_end || null,
            });
        } else {
            addRecurringTask({
                title: taskForm.title,
                category: taskForm.category,
                priority: taskForm.priority,
                scheduled_start: taskForm.scheduled_start || null,
                scheduled_end: taskForm.scheduled_end || null,
                recurrence: {
                    type: taskForm.recurrence,
                    days_of_week: taskForm.recurrence === 'weekly' ? taskForm.recurrence_days : null,
                },
            });
        }
        setTaskForm(EMPTY_FORM);
        setIsAddingTask(false);
    };

    // --- Habits ---
    const todaysHabits = habits.filter((h) => !h.archived);
    const completedCount = todaysHabits.filter((h) => h.completedDates.includes(dateStr)).length;
    const progress = todaysHabits.length > 0 ? (completedCount / todaysHabits.length) * 100 : 0;

    const selectClass =
        'w-full p-2.5 rounded-xl border border-[var(--snow-ice)] bg-[var(--snow-surf)] text-sm text-snow-primary outline-none focus:ring-2 focus:ring-white/10 focus:border-[var(--snow-ice2)]';

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <header className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-snow-muted">Today</p>
                <h1 className="text-3xl font-display text-snow-primary">
                    Good {today.getHours() < 12 ? 'morning' : 'evening'}, {name || 'Friend'}.
                </h1>
                <p className="text-snow-secondary text-sm">{format(today, 'EEEE, MMMM do')}</p>
            </header>

            {/* Daily quote — gold verse card */}
            <div
                className="rounded-2xl p-5 backdrop-blur-md"
                style={{
                    background: 'rgba(240,192,96,0.10)',
                    border: '1px solid rgba(240,192,96,0.18)',
                    borderLeft: '3px solid #F0C060',
                }}
            >
                <p className="text-center italic text-snow-gold text-sm">"{quote}"</p>
            </div>

            {/* Check-in nudge — dismissable, never blocks */}
            <AnimatePresence>
                {showNudge && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <div
                            className="rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md"
                            style={{
                                background: 'rgba(91,155,213,0.10)',
                                border: '1px solid rgba(91,155,213,0.20)',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                {!morningDone
                                    ? <Sun size={18} className="text-[#A3C4F5] shrink-0" />
                                    : <Moon size={18} className="text-[#A3C4F5] shrink-0" />}
                                <div>
                                    <p className="text-sm font-medium text-snow-primary">
                                        {!morningDone ? 'Morning check-in ready' : 'Evening reflection ready'}
                                    </p>
                                    <p className="text-xs text-snow-muted">
                                        {!morningDone
                                            ? 'Set the tone for today.'
                                            : 'Take a few minutes to close the day.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    onClick={() => navigate(!morningDone ? '/checkin/morning' : '/checkin/evening')}
                                    className="text-xs px-3 py-1.5"
                                >
                                    Begin
                                </Button>
                                <button
                                    onClick={() => setNudgeDismissed(true)}
                                    className="p-1.5 text-snow-muted/40 hover:text-snow-muted rounded-lg transition-colors"
                                    aria-label="Dismiss"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Routine Schedule blocks */}
            {todayBlocks.length > 0 && (
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-medium text-snow-primary">Schedule</h2>
                        <button
                            onClick={() => navigate('/routine')}
                            className="flex items-center gap-1 text-xs text-snow-muted hover:text-snow-secondary transition-colors"
                        >
                            <CalendarDays size={13} />
                            Manage
                        </button>
                    </div>
                    <div className="space-y-2">
                        {todayBlocks.map((block) => {
                            const cs = CARD_STYLES[block.category] ?? CARD_STYLES.Life;
                            const cat = CATEGORIES[block.category] ?? CATEGORIES.Life;
                            const isLeave = block.exception?.type === 'Leave';
                            const isModified = block.exception?.type === 'Modified';
                            const displayEndTime = (isModified && block.exception?.override_end_time)
                                ? block.exception.override_end_time
                                : block.end_time;
                            const isSpilloverOpen = spilloverBlockId === block.id;
                            return (
                                <div
                                    key={block.id}
                                    className="rounded-xl overflow-hidden backdrop-blur-md transition-all"
                                    style={{
                                        background: isLeave ? 'rgba(255,255,255,0.02)' : cs.bg,
                                        border: `1px solid ${isLeave ? 'rgba(255,255,255,0.06)' : cs.border}`,
                                        borderLeft: `3px solid ${isLeave ? 'rgba(255,255,255,0.10)' : cs.accent}`,
                                        opacity: isLeave ? 0.5 : 1,
                                    }}
                                >
                                    {/* Main row */}
                                    <div className="p-3 flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${isLeave ? 'line-through text-snow-muted' : 'text-snow-primary'}`}>
                                                    {block.label}
                                                </span>
                                                {isLeave && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-snow-muted font-medium uppercase tracking-wide">
                                                        Leave
                                                    </span>
                                                )}
                                                {isModified && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide" style={{ background: `${cs.accent}20`, color: cs.accent }}>
                                                        +hours
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span
                                                    className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                                                    style={{ color: cat.color, backgroundColor: `${cat.color}20` }}
                                                >
                                                    {cat.label}
                                                </span>
                                                {block.start_time && (
                                                    <span className="text-[10px] text-snow-muted font-mono">
                                                        {block.start_time}{displayEndTime ? `–${displayEndTime}` : ''}
                                                        {isModified && <span className="ml-0.5 text-[9px]" style={{ color: cs.accent }}>↑</span>}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        {isLeave ? (
                                            <button
                                                onClick={() => handleRemoveLeave(block.exception.id)}
                                                className="shrink-0 flex items-center gap-1 text-[11px] text-snow-muted/50 hover:text-snow-muted transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                                            >
                                                <RotateCcw size={12} /> Undo
                                            </button>
                                        ) : isModified ? (
                                            <button
                                                onClick={() => handleRemoveModified(block.exception.id)}
                                                className="shrink-0 flex items-center gap-1 text-[11px] text-snow-muted/50 hover:text-snow-muted transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                                            >
                                                <RotateCcw size={12} /> Undo
                                            </button>
                                        ) : isSpilloverOpen ? null : (
                                            <div className="shrink-0 flex gap-1">
                                                <button
                                                    onClick={() => handleMarkLeave(block)}
                                                    className="flex items-center gap-1 text-[11px] text-snow-muted/50 hover:text-snow-muted transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                                                    title="Mark as leave day"
                                                >
                                                    <Umbrella size={12} />
                                                </button>
                                                <button
                                                    onClick={() => { setSpilloverBlockId(block.id); setSpilloverTime(block.end_time || ''); }}
                                                    className="flex items-center gap-1 text-[11px] text-snow-muted/50 hover:text-snow-muted transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                                                    title="Log actual end time"
                                                >
                                                    <Clock size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Spillover time input — expands below main row */}
                                    {isSpilloverOpen && (
                                        <div className="px-3 pb-3 flex items-center gap-2 border-t border-white/5 pt-2">
                                            <label className="text-xs text-snow-muted shrink-0">Actual end:</label>
                                            <input
                                                type="time"
                                                value={spilloverTime}
                                                onChange={(e) => setSpilloverTime(e.target.value)}
                                                autoFocus
                                                className="flex-1 p-1.5 rounded-lg border border-[var(--snow-ice)] bg-[var(--snow-surf)] text-xs text-snow-primary outline-none focus:border-[var(--snow-ice2)]"
                                            />
                                            <button
                                                onClick={() => handleSaveSpillover(block)}
                                                className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                                                style={{ background: `${cs.accent}25`, color: cs.accent }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setSpilloverBlockId(null)}
                                                className="p-1.5 text-snow-muted/40 hover:text-snow-muted rounded-lg transition-colors shrink-0"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Tasks */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-snow-primary">Today's Tasks</h2>
                    <Button
                        onClick={() => setIsAddingTask((v) => !v)}
                        className="px-3 py-2"
                        aria-label="Add task"
                    >
                        <Plus size={20} />
                    </Button>
                </div>

                <AnimatePresence>
                    {isAddingTask && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mb-4"
                        >
                            <Card>
                                <form onSubmit={handleAddTask} className="space-y-3">
                                    <Input
                                        placeholder="Task title"
                                        value={taskForm.title}
                                        onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                                        autoFocus
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={taskForm.category}
                                            onChange={(e) => setTaskForm((f) => ({ ...f, category: e.target.value }))}
                                            className={selectClass}
                                        >
                                            {Object.entries(CATEGORIES).map(([key, { label }]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={taskForm.priority}
                                            onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
                                            className={selectClass}
                                        >
                                            {Object.entries(PRIORITIES).map(([key, { label }]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-snow-muted block mb-1">Start (optional)</label>
                                            <input
                                                type="time"
                                                value={taskForm.scheduled_start}
                                                onChange={(e) => setTaskForm((f) => ({ ...f, scheduled_start: e.target.value }))}
                                                className={selectClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-snow-muted block mb-1">End (optional)</label>
                                            <input
                                                type="time"
                                                value={taskForm.scheduled_end}
                                                onChange={(e) => setTaskForm((f) => ({ ...f, scheduled_end: e.target.value }))}
                                                className={selectClass}
                                            />
                                        </div>
                                    </div>
                                    {/* Recurrence */}
                                    <div>
                                        <label className="text-xs text-snow-muted block mb-1">Repeats</label>
                                        <select
                                            value={taskForm.recurrence}
                                            onChange={(e) => setTaskForm((f) => ({ ...f, recurrence: e.target.value }))}
                                            className={selectClass}
                                        >
                                            <option value="none">Once (today only)</option>
                                            <option value="daily">Every day</option>
                                            <option value="weekly">Weekly — pick days</option>
                                        </select>
                                    </div>
                                    {taskForm.recurrence === 'weekly' && (
                                        <div className="flex gap-1.5 flex-wrap">
                                            {DAYS.map((day) => {
                                                const active = taskForm.recurrence_days.includes(day);
                                                const cs = CARD_STYLES[taskForm.category] ?? CARD_STYLES.Life;
                                                return (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => toggleRecurrenceDay(day)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                                                        style={{
                                                            background: active ? cs.accent : 'var(--snow-surf)',
                                                            color: active ? '#fff' : '#4D6882',
                                                            border: `1px solid ${active ? cs.accent : 'var(--snow-ice)'}`,
                                                        }}
                                                    >
                                                        {day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="ghost" onClick={() => setIsAddingTask(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Task</Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {todayTasks.length === 0 && todayRecurring.length === 0 && !isAddingTask && (
                    <p className="text-center text-snow-muted py-8 text-sm">
                        No tasks for today. Tap + to add one.
                    </p>
                )}

                <div className="space-y-2">
                    <AnimatePresence>
                        {/* One-off tasks */}
                        {todayTasks.map((task) => {
                            const cat = CATEGORIES[task.category] ?? CATEGORIES.Life;
                            const pri = PRIORITIES[task.priority] ?? PRIORITIES.medium;
                            const cs = CARD_STYLES[task.category] ?? CARD_STYLES.Life;
                            const isStarted = Boolean(task.actual_start);
                            return (
                                <motion.div key={task.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }} layout>
                                    <div
                                        className="rounded-xl p-3 flex items-center gap-3 group transition-all backdrop-blur-md"
                                        style={{
                                            background:  task.completed ? 'rgba(255,255,255,0.03)' : cs.bg,
                                            border:      `1px solid ${task.completed ? 'rgba(255,255,255,0.08)' : cs.border}`,
                                            borderLeft:  `3px solid ${task.completed ? 'rgba(255,255,255,0.12)' : cs.accent}`,
                                            opacity:     task.completed ? 0.55 : 1,
                                        }}
                                    >
                                        <button onClick={() => toggleTask(task.id)} className="shrink-0 transition-colors" style={{ color: task.completed ? cs.accent : 'rgba(255,255,255,0.25)' }}>
                                            <motion.div animate={{ scale: task.completed ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                                {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                                            </motion.div>
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-sm ${task.completed ? 'line-through text-snow-muted' : 'text-snow-primary'}`}>{task.title}</span>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ color: cat.color, backgroundColor: `${cat.color}20` }}>{cat.label}</span>
                                                {task.scheduled_start && <span className="text-[10px] text-snow-muted font-mono">{task.scheduled_start}{task.scheduled_end ? `–${task.scheduled_end}` : ''}</span>}
                                                {isStarted && !task.completed && (
                                                    <span className="text-[9px] text-snow-muted/50 font-mono">
                                                        ▶ {format(new Date(task.actual_start), 'HH:mm')}
                                                    </span>
                                                )}
                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: pri.color }} title={pri.label + ' priority'} />
                                            </div>
                                        </div>
                                        {/* Start button — only when not yet started and not complete */}
                                        {!task.completed && !isStarted && (
                                            <button
                                                onClick={() => startTask(task.id)}
                                                className="shrink-0 p-1.5 text-snow-muted/30 hover:text-green-400 transition-colors"
                                                title="Mark as started"
                                            >
                                                <Play size={14} />
                                            </button>
                                        )}
                                        <button onClick={() => deleteTask(task.id)} className="shrink-0 p-1.5 text-snow-muted/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete task">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Recurring tasks */}
                        {todayRecurring.map((task) => {
                            const cat = CATEGORIES[task.category] ?? CATEGORIES.Life;
                            const pri = PRIORITIES[task.priority] ?? PRIORITIES.medium;
                            const cs = CARD_STYLES[task.category] ?? CARD_STYLES.Life;
                            const done = task._completed;
                            return (
                                <motion.div key={`r-${task.id}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }} layout>
                                    <div
                                        className="rounded-xl p-3 flex items-center gap-3 group transition-all backdrop-blur-md"
                                        style={{
                                            background:  done ? 'rgba(255,255,255,0.03)' : cs.bg,
                                            border:      `1px solid ${done ? 'rgba(255,255,255,0.08)' : cs.border}`,
                                            borderLeft:  `3px solid ${done ? 'rgba(255,255,255,0.12)' : cs.accent}`,
                                            opacity:     done ? 0.55 : 1,
                                        }}
                                    >
                                        <button onClick={() => toggleRecurringCompletion(task.id, dateStr)} className="shrink-0 transition-colors" style={{ color: done ? cs.accent : 'rgba(255,255,255,0.25)' }}>
                                            <motion.div animate={{ scale: done ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                                {done ? <CheckCircle size={20} /> : <Circle size={20} />}
                                            </motion.div>
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-sm ${done ? 'line-through text-snow-muted' : 'text-snow-primary'}`}>{task.title}</span>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ color: cat.color, backgroundColor: `${cat.color}20` }}>{cat.label}</span>
                                                {task.scheduled_start && <span className="text-[10px] text-snow-muted font-mono">{task.scheduled_start}{task.scheduled_end ? `–${task.scheduled_end}` : ''}</span>}
                                                <RefreshCw size={10} className="text-snow-muted/50 shrink-0" title="Recurring" />
                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: pri.color }} title={pri.label + ' priority'} />
                                            </div>
                                        </div>
                                        <button onClick={() => deleteRecurringTask(task.id)} className="shrink-0 p-1.5 text-snow-muted/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete recurring task">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </section>

            {/* Daily Anchors — preserved from original Home with identical Framer Motion interactions */}
            <section>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-lg font-medium text-snow-primary">Daily Anchors</h2>
                    <span className="text-xs text-snow-muted">{completedCount}/{todaysHabits.length} Done</span>
                </div>

                <div className="h-1.5 w-full rounded-full mb-6 overflow-hidden" style={{ background: 'var(--snow-surf2)' }}>
                    <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #5B9BD5, #A3C4F5)' }}
                    />
                </div>

                {todaysHabits.length === 0 ? (
                    <p className="text-center text-snow-muted py-8 text-sm">
                        No anchors yet. Add one in Habits.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {todaysHabits.map((habit) => {
                            const isCompleted = habit.completedDates.includes(dateStr);
                            return (
                                <motion.div
                                    key={habit.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileTap={{ scale: 0.98 }}
                                    layout
                                >
                                    <Card
                                        onClick={() => {
                                            const willComplete = !habit.completedDates.includes(dateStr);
                                            toggleHabitCompletion(habit.id, dateStr);
                                            if (willComplete) {
                                                import('../lib/confetti').then((mod) => mod.triggerHabitConfetti());
                                            }
                                        }}
                                        className={`p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${isCompleted ? 'border-[var(--snow-ice2)]' : ''}`}
                                        style={isCompleted ? { background: 'rgba(91,155,213,0.10)' } : undefined}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                initial={false}
                                                animate={{ scale: isCompleted ? 1.2 : 1 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            >
                                                {isCompleted
                                                    ? <CheckCircle className="text-[#5B9BD5]" style={{ fill: 'rgba(91,155,213,0.15)' }} />
                                                    : <Circle className="text-snow-muted/40" />}
                                            </motion.div>
                                            <span className={`${isCompleted ? 'text-[#A3C4F5] line-through opacity-70' : 'text-snow-primary'} transition-all`}>
                                                {habit.title}
                                            </span>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
