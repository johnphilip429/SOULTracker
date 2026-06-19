import React, { useState } from 'react';
import {
    format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Trash2, Umbrella, RotateCcw, RefreshCw, Clock, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchedulerStore, CATEGORIES, PRIORITIES } from '../store/useSchedulerStore';
import { getScheduledBlocksForDate, getRecurringTasksForDate } from '../lib/scheduleUtils';

const CARD_STYLES = {
    Office:           { bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.18)',  accent: '#3B82F6' },
    Gym:              { bg: 'rgba(20,184,166,0.07)',  border: 'rgba(20,184,166,0.18)',  accent: '#14B8A6' },
    GamingChannel:    { bg: 'rgba(168,85,247,0.07)', border: 'rgba(168,85,247,0.18)', accent: '#A855F7' },
    FaithTechChannel: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.18)', accent: '#F59E0B' },
    Life:             { bg: 'rgba(20,184,166,0.07)',  border: 'rgba(20,184,166,0.18)',  accent: '#14B8A6' },
};

function getMergedItems(dateStr, routineBlocks, exceptions, tasks, recurringTasks) {
    const blocks = getScheduledBlocksForDate(dateStr, routineBlocks, exceptions)
        .map((b) => ({ ...b, _type: 'block', _sortTime: b.start_time ?? null }));

    const dayTasks = tasks.filter((t) => t.scheduled_date === dateStr);
    const recurring = getRecurringTasksForDate(dateStr, recurringTasks)
        .map((t) => ({ ...t, _type: 'recurring', _sortTime: t.scheduled_start ?? null }));

    const timedTasks = dayTasks
        .filter((t) => t.scheduled_start)
        .map((t) => ({ ...t, _type: 'task', _sortTime: t.scheduled_start }));
    const untimedTasks = dayTasks
        .filter((t) => !t.scheduled_start)
        .map((t) => ({ ...t, _type: 'task', _sortTime: null }));
    const untimedRecurring = recurring.filter((t) => !t._sortTime);
    const timedRecurring = recurring.filter((t) => t._sortTime);

    const timed = [...blocks, ...timedTasks, ...timedRecurring].sort((a, b) => {
        if (!a._sortTime && !b._sortTime) return 0;
        if (!a._sortTime) return 1;
        if (!b._sortTime) return -1;
        return a._sortTime.localeCompare(b._sortTime);
    });

    return [...timed, ...untimedTasks, ...untimedRecurring];
}

export default function Calendar() {
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today);
    const [weekOffset, setWeekOffset] = useState(0);
    const [spilloverBlockId, setSpilloverBlockId] = useState(null);
    const [spilloverTime, setSpilloverTime] = useState('');

    const { routineBlocks, exceptions, tasks, startTask, toggleTask, deleteTask,
            recurringTasks, toggleRecurringCompletion, deleteRecurringTask,
            addException, removeException } = useSchedulerStore();

    const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 }); // Mon start
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const items = getMergedItems(selectedDateStr, routineBlocks, exceptions, tasks, recurringTasks);

    const hasItemsOnDay = (date) => {
        const ds = format(date, 'yyyy-MM-dd');
        const hasBlocks = getScheduledBlocksForDate(ds, routineBlocks, exceptions).length > 0;
        const hasTasks = tasks.some((t) => t.scheduled_date === ds);
        const hasRecurring = getRecurringTasksForDate(ds, recurringTasks).length > 0;
        return hasBlocks || hasTasks || hasRecurring;
    };

    const handleMarkLeave = (block) => {
        // Clear any Modified exception first (mutually exclusive with Leave)
        const modified = exceptions.find(
            (e) => e.date === selectedDateStr && e.type === 'Modified' && e.routine_block_id === block.id
        );
        if (modified) removeException(modified.id);
        const alreadyLeave = exceptions.some(
            (e) => e.date === selectedDateStr && e.type === 'Leave' &&
                (e.routine_block_id === block.id || e.routine_block_id === null)
        );
        if (!alreadyLeave) {
            addException({ date: selectedDateStr, type: 'Leave', routine_block_id: block.id });
        }
    };

    const handleRemoveLeave = (exceptionId) => removeException(exceptionId);

    const handleSaveSpillover = (block) => {
        if (!spilloverTime) return;
        const existing = exceptions.find(
            (e) => e.date === selectedDateStr && e.type === 'Modified' && e.routine_block_id === block.id
        );
        if (existing) removeException(existing.id);
        addException({ date: selectedDateStr, type: 'Modified', routine_block_id: block.id, override_end_time: spilloverTime });
        setSpilloverBlockId(null);
        setSpilloverTime('');
    };

    const handleRemoveModified = (exceptionId) => removeException(exceptionId);

    return (
        <div className="flex flex-col h-full">
            {/* Week navigation header */}
            <div
                className="sticky top-0 z-10 pt-5 pb-3 px-5 backdrop-blur-xl"
                style={{ background: 'rgba(6,13,26,0.90)', borderBottom: '1px solid var(--snow-ice)' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-display text-snow-primary">
                        {format(weekStart, 'MMMM yyyy')}
                    </h1>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setWeekOffset((w) => w - 1)}
                            className="p-2 rounded-xl text-snow-muted hover:text-snow-secondary hover:bg-[var(--snow-surf)] transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => { setWeekOffset(0); setSelectedDate(today); }}
                            className="px-3 py-1.5 rounded-xl text-xs text-snow-muted hover:text-snow-secondary hover:bg-[var(--snow-surf)] transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setWeekOffset((w) => w + 1)}
                            className="p-2 rounded-xl text-snow-muted hover:text-snow-secondary hover:bg-[var(--snow-surf)] transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Day chips */}
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day) => {
                        const isToday = isSameDay(day, today);
                        const isSelected = isSameDay(day, selectedDate);
                        const hasItems = hasItemsOnDay(day);
                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
                                style={{
                                    background: isSelected ? 'var(--snow-surf2)' : 'transparent',
                                    border: `1px solid ${isSelected ? 'var(--snow-ice2)' : 'transparent'}`,
                                }}
                            >
                                <span className="text-[10px] uppercase tracking-wide text-snow-muted font-medium">
                                    {format(day, 'EEE')}
                                </span>
                                <span
                                    className="text-sm font-semibold leading-none"
                                    style={{ color: isToday ? '#5B9BD5' : isSelected ? '#EEF2FF' : '#8BACC8' }}
                                >
                                    {format(day, 'd')}
                                </span>
                                {/* Activity dot */}
                                <span
                                    className="w-1 h-1 rounded-full"
                                    style={{ background: hasItems ? '#5B9BD5' : 'transparent' }}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Day content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-2">
                {items.length === 0 && (
                    <p className="text-center text-snow-muted py-16 text-sm">
                        Nothing scheduled for {format(selectedDate, 'EEEE')}.
                    </p>
                )}

                <AnimatePresence mode="popLayout">
                    {items.map((item) => {
                        if (item._type === 'block') {
                            const cs = CARD_STYLES[item.category] ?? CARD_STYLES.Life;
                            const cat = CATEGORIES[item.category] ?? CATEGORIES.Life;
                            const isLeave = item.exception?.type === 'Leave';
                            const isModified = item.exception?.type === 'Modified';
                            const displayEndTime = (isModified && item.exception?.override_end_time)
                                ? item.exception.override_end_time
                                : item.end_time;
                            const isSpilloverOpen = spilloverBlockId === item.id;
                            const inputClass = 'flex-1 p-1.5 rounded-lg border border-[var(--snow-ice)] bg-[var(--snow-surf)] text-xs text-snow-primary outline-none focus:border-[var(--snow-ice2)]';
                            return (
                                <motion.div
                                    key={`block-${item.id}`}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -6 }}
                                    layout
                                >
                                    <div
                                        className="rounded-xl overflow-hidden backdrop-blur-md transition-all"
                                        style={{
                                            background: isLeave ? 'rgba(255,255,255,0.02)' : cs.bg,
                                            border: `1px solid ${isLeave ? 'rgba(255,255,255,0.06)' : cs.border}`,
                                            borderLeft: `3px solid ${isLeave ? 'rgba(255,255,255,0.10)' : cs.accent}`,
                                            opacity: isLeave ? 0.45 : 1,
                                        }}
                                    >
                                        {/* Main row */}
                                        <div className="p-3 flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-medium ${isLeave ? 'line-through text-snow-muted' : 'text-snow-primary'}`}>
                                                        {item.label}
                                                    </span>
                                                    {isLeave && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-snow-muted uppercase tracking-wide">
                                                            Leave
                                                        </span>
                                                    )}
                                                    {isModified && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide" style={{ background: `${cs.accent}20`, color: cs.accent }}>
                                                            +hours
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span
                                                        className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                                                        style={{ color: cat.color, backgroundColor: `${cat.color}20` }}
                                                    >
                                                        {cat.label}
                                                    </span>
                                                    {item.start_time && (
                                                        <span className="text-[10px] text-snow-muted font-mono">
                                                            {item.start_time}{displayEndTime ? `–${displayEndTime}` : ''}
                                                            {isModified && <span className="ml-0.5 text-[9px]" style={{ color: cs.accent }}>↑</span>}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isLeave ? (
                                                <button
                                                    onClick={() => handleRemoveLeave(item.exception.id)}
                                                    className="shrink-0 flex items-center gap-1 text-[11px] text-snow-muted/50 hover:text-snow-muted px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                                                >
                                                    <RotateCcw size={11} /> Undo
                                                </button>
                                            ) : isModified ? (
                                                <button
                                                    onClick={() => handleRemoveModified(item.exception.id)}
                                                    className="shrink-0 flex items-center gap-1 text-[11px] text-snow-muted/50 hover:text-snow-muted px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                                                >
                                                    <RotateCcw size={11} /> Undo
                                                </button>
                                            ) : isSpilloverOpen ? null : (
                                                <div className="shrink-0 flex gap-1">
                                                    <button
                                                        onClick={() => handleMarkLeave(item)}
                                                        className="flex items-center gap-1 text-[11px] text-snow-muted/50 hover:text-snow-muted px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                                                        title="Mark as leave day"
                                                    >
                                                        <Umbrella size={11} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSpilloverBlockId(item.id); setSpilloverTime(item.end_time || ''); }}
                                                        className="flex items-center gap-1 text-[11px] text-snow-muted/50 hover:text-snow-muted px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                                                        title="Log actual end time"
                                                    >
                                                        <Clock size={11} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Spillover time input */}
                                        {isSpilloverOpen && (
                                            <div className="px-3 pb-3 flex items-center gap-2 border-t border-white/5 pt-2">
                                                <label className="text-xs text-snow-muted shrink-0">Actual end:</label>
                                                <input
                                                    type="time"
                                                    value={spilloverTime}
                                                    onChange={(e) => setSpilloverTime(e.target.value)}
                                                    autoFocus
                                                    className={inputClass}
                                                />
                                                <button
                                                    onClick={() => handleSaveSpillover(item)}
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
                                </motion.div>
                            );
                        }

                        // Recurring task item
                        if (item._type === 'recurring') {
                            const cs = CARD_STYLES[item.category] ?? CARD_STYLES.Life;
                            const cat = CATEGORIES[item.category] ?? CATEGORIES.Life;
                            const pri = PRIORITIES[item.priority] ?? PRIORITIES.medium;
                            const done = item._completed;
                            return (
                                <motion.div key={`rec-${item.id}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -6 }} layout>
                                    <div
                                        className="rounded-xl p-3 flex items-center gap-3 group backdrop-blur-md transition-all"
                                        style={{
                                            background: done ? 'rgba(255,255,255,0.03)' : cs.bg,
                                            border: `1px solid ${done ? 'rgba(255,255,255,0.08)' : cs.border}`,
                                            borderLeft: `3px solid ${done ? 'rgba(255,255,255,0.12)' : cs.accent}`,
                                            opacity: done ? 0.55 : 1,
                                        }}
                                    >
                                        <button onClick={() => toggleRecurringCompletion(item.id, selectedDateStr)} className="shrink-0 transition-colors" style={{ color: done ? cs.accent : 'rgba(255,255,255,0.25)' }}>
                                            <motion.div animate={{ scale: done ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                                {done ? <CheckCircle size={20} /> : <Circle size={20} />}
                                            </motion.div>
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-sm ${done ? 'line-through text-snow-muted' : 'text-snow-primary'}`}>{item.title}</span>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ color: cat.color, backgroundColor: `${cat.color}20` }}>{cat.label}</span>
                                                {item.scheduled_start && <span className="text-[10px] text-snow-muted font-mono">{item.scheduled_start}{item.scheduled_end ? `–${item.scheduled_end}` : ''}</span>}
                                                <RefreshCw size={10} className="text-snow-muted/50 shrink-0" title="Recurring" />
                                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: pri.color }} title={pri.label + ' priority'} />
                                            </div>
                                        </div>
                                        <button onClick={() => deleteRecurringTask(item.id)} className="shrink-0 p-1.5 text-snow-muted/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        }

                        // One-off task item
                        const cs = CARD_STYLES[item.category] ?? CARD_STYLES.Life;
                        const cat = CATEGORIES[item.category] ?? CATEGORIES.Life;
                        const pri = PRIORITIES[item.priority] ?? PRIORITIES.medium;
                        const isStarted = Boolean(item.actual_start);
                        return (
                            <motion.div
                                key={`task-${item.id}`}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -6 }}
                                layout
                            >
                                <div
                                    className="rounded-xl p-3 flex items-center gap-3 group backdrop-blur-md transition-all"
                                    style={{
                                        background:  item.completed ? 'rgba(255,255,255,0.03)' : cs.bg,
                                        border:      `1px solid ${item.completed ? 'rgba(255,255,255,0.08)' : cs.border}`,
                                        borderLeft:  `3px solid ${item.completed ? 'rgba(255,255,255,0.12)' : cs.accent}`,
                                        opacity:     item.completed ? 0.55 : 1,
                                    }}
                                >
                                    <button
                                        onClick={() => toggleTask(item.id)}
                                        className="shrink-0 transition-colors"
                                        style={{ color: item.completed ? cs.accent : 'rgba(255,255,255,0.25)' }}
                                    >
                                        <motion.div
                                            animate={{ scale: item.completed ? 1.1 : 1 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        >
                                            {item.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                                        </motion.div>
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <span className={`text-sm ${item.completed ? 'line-through text-snow-muted' : 'text-snow-primary'}`}>
                                            {item.title}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span
                                                className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                                                style={{ color: cat.color, backgroundColor: `${cat.color}20` }}
                                            >
                                                {cat.label}
                                            </span>
                                            {item.scheduled_start && (
                                                <span className="text-[10px] text-snow-muted font-mono">
                                                    {item.scheduled_start}{item.scheduled_end ? `–${item.scheduled_end}` : ''}
                                                </span>
                                            )}
                                            {isStarted && !item.completed && (
                                                <span className="text-[9px] text-snow-muted/50 font-mono">
                                                    ▶ {format(new Date(item.actual_start), 'HH:mm')}
                                                </span>
                                            )}
                                            <span
                                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                                style={{ backgroundColor: pri.color }}
                                                title={pri.label + ' priority'}
                                            />
                                        </div>
                                    </div>

                                    {!item.completed && !isStarted && (
                                        <button
                                            onClick={() => startTask(item.id)}
                                            className="shrink-0 p-1.5 text-snow-muted/30 hover:text-green-400 transition-colors"
                                            title="Mark as started"
                                        >
                                            <Play size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteTask(item.id)}
                                        className="shrink-0 p-1.5 text-snow-muted/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
