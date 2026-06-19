import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchedulerStore, CATEGORIES } from '../store/useSchedulerStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMPTY_FORM = {
    label: '',
    category: 'Office',
    days_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    start_time: '',
    end_time: '',
};

const selectClass =
    'w-full p-2.5 rounded-xl border border-[var(--snow-ice)] bg-[var(--snow-surf)] text-sm text-snow-primary outline-none focus:ring-2 focus:ring-white/10 focus:border-[var(--snow-ice2)]';

const CARD_STYLES = {
    Office:           { bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.18)',  accent: '#3B82F6' },
    Gym:              { bg: 'rgba(20,184,166,0.07)',  border: 'rgba(20,184,166,0.18)',  accent: '#14B8A6' },
    GamingChannel:    { bg: 'rgba(168,85,247,0.07)', border: 'rgba(168,85,247,0.18)', accent: '#A855F7' },
    FaithTechChannel: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.18)', accent: '#F59E0B' },
    Life:             { bg: 'rgba(20,184,166,0.07)',  border: 'rgba(20,184,166,0.18)',  accent: '#14B8A6' },
};

export default function Routine() {
    const navigate = useNavigate();
    const { routineBlocks, addRoutineBlock, deleteRoutineBlock } = useSchedulerStore();
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const toggleDay = (day) => {
        setForm((f) => ({
            ...f,
            days_of_week: f.days_of_week.includes(day)
                ? f.days_of_week.filter((d) => d !== day)
                : [...f.days_of_week, day],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.label.trim() || form.days_of_week.length === 0) return;
        addRoutineBlock(form);
        setForm(EMPTY_FORM);
        setIsAdding(false);
    };

    // Sort blocks by start_time for display
    const sorted = [...routineBlocks].sort((a, b) => {
        if (!a.start_time && !b.start_time) return 0;
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return a.start_time.localeCompare(b.start_time);
    });

    return (
        <div className="p-6 space-y-6 pb-24">
            {/* Header */}
            <header className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl text-snow-muted hover:text-snow-secondary hover:bg-[var(--snow-surf)] transition-colors"
                    aria-label="Back"
                >
                    <ChevronLeft size={22} />
                </button>
                <div>
                    <h1 className="text-2xl font-display text-snow-primary">Routine Schedule</h1>
                    <p className="text-xs text-snow-muted mt-0.5">Recurring blocks that populate your day view</p>
                </div>
                <Button
                    onClick={() => setIsAdding((v) => !v)}
                    className="ml-auto px-3 py-2"
                    aria-label="Add block"
                >
                    <Plus size={20} />
                </Button>
            </header>

            {/* Add form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <div
                            className="rounded-2xl p-5 space-y-4 backdrop-blur-md"
                            style={{ background: 'var(--snow-surf)', border: '1px solid var(--snow-ice)' }}
                        >
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Block label"
                                    placeholder="e.g. Office — Altrata"
                                    value={form.label}
                                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                                    autoFocus
                                />

                                <div>
                                    <label className="text-xs text-snow-muted block mb-1.5 ml-1">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                        className={selectClass}
                                    >
                                        {Object.entries(CATEGORIES).map(([key, { label }]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-snow-muted block mb-2 ml-1">Days</label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {DAYS.map((day) => {
                                            const active = form.days_of_week.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                                    style={{
                                                        background: active ? CARD_STYLES[form.category]?.accent ?? '#8BACC8' : 'var(--snow-surf)',
                                                        color: active ? '#fff' : 'var(--snow-muted, #4D6882)',
                                                        border: `1px solid ${active ? CARD_STYLES[form.category]?.accent ?? '#8BACC8' : 'var(--snow-ice)'}`,
                                                        opacity: active ? 1 : 0.7,
                                                    }}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-snow-muted block mb-1 ml-1">Start time</label>
                                        <input
                                            type="time"
                                            value={form.start_time}
                                            onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                                            className={selectClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-snow-muted block mb-1 ml-1">End time</label>
                                        <input
                                            type="time"
                                            value={form.end_time}
                                            onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                                            className={selectClass}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Save Block</Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Block list */}
            {sorted.length === 0 && !isAdding && (
                <p className="text-center text-snow-muted py-10 text-sm">
                    No routine blocks yet. Tap + to add your recurring schedule.
                </p>
            )}

            <div className="space-y-2">
                <AnimatePresence>
                    {sorted.map((block) => {
                        const cs = CARD_STYLES[block.category] ?? CARD_STYLES.Life;
                        const cat = CATEGORIES[block.category] ?? CATEGORIES.Life;
                        return (
                            <motion.div
                                key={block.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                layout
                            >
                                <div
                                    className="rounded-xl p-4 flex items-center gap-3 group backdrop-blur-md"
                                    style={{
                                        background: cs.bg,
                                        border: `1px solid ${cs.border}`,
                                        borderLeft: `3px solid ${cs.accent}`,
                                    }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-snow-primary">{block.label}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span
                                                className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                                                style={{ color: cat.color, backgroundColor: `${cat.color}20` }}
                                            >
                                                {cat.label}
                                            </span>
                                            {block.start_time && (
                                                <span className="text-[10px] text-snow-muted font-mono">
                                                    {block.start_time}{block.end_time ? `–${block.end_time}` : ''}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-snow-muted">
                                                {block.days_of_week?.join(', ')}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => deleteRoutineBlock(block.id)}
                                        className="shrink-0 p-1.5 text-snow-muted/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Delete block"
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
