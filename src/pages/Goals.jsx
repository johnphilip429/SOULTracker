import React, { useState } from 'react';
import { Target, Plus, Trash2, CheckSquare, Square, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoalStore } from '../store/useGoalStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const goalPrompts = [
    'What is the smallest kind step you can take right now?',
    'Can the next step be just five minutes?',
    'What would a gentle first version look like?',
    'What is the one thing that would make everything else easier?',
    'If you could only do one thing for this goal today, what would it be?',
    'What does good enough for today look like?',
    'What would you do if you knew you could not fail?',
    'Why does this goal matter to your alignment?',
    'What would your future self thank you for doing today?',
    'What does success actually look like in concrete, daily terms?',
    'How does this goal serve someone other than yourself?',
    'What value does achieving this reflect about who you want to be?',
    'Is this goal pulling you forward, or pushing you away from something?',
    'What is the one thing quietly blocking this goal?',
    'What could you remove to make space?',
    'What assumption are you making that might not be true?',
    'What would you advise a close friend in this exact situation?',
    'What part of this feels hardest, and why?',
    'Is there a simpler version of this goal that still matters?',
    'Who could support you with this today?',
    'Who has already done something like this that you could learn from?',
    'What resource, tool, or person are you not yet using?',
    'What have you already done toward this, even if it feels small?',
    'What would done for today look like?',
    'What does 10% progress look like, and can you hit that today?',
    'What is the next single physical action you can take?',
    'What would make this feel less like work and more like a game?',
];

export default function Goals() {
    const { goals, addGoal, deleteGoal, updateGoal } = useGoalStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newGoal, setNewGoal] = useState('');
    const [activePrompt, setActivePrompt] = useState(null); // stores goalId for expanded prompt

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newGoal.trim()) return;
        addGoal({ title: newGoal, category: 'Personal' });
        setNewGoal('');
        setIsAdding(false);
    };

    const toggleGoal = (goal) => {
        const willComplete = !goal.completed;
        updateGoal(goal.id, { completed: willComplete });
        if (willComplete) {
            import('../lib/confetti').then(mod => mod.triggerGoalConfetti());
        }
    };

    const getRandomPrompt = (goalId) => {
        if (activePrompt === goalId) {
            setActivePrompt(null);
        } else {
            setActivePrompt(goalId);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-display text-text-main">Key Goals</h1>
                <Button onClick={() => setIsAdding(true)} className="px-3 py-2">
                    <Plus size={20} />
                </Button>
            </div>

            {isAdding && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-surface/90 border border-primary/10 mb-4">
                        <form onSubmit={handleAdd} className="space-y-4">
                            <Input
                                placeholder="What matters most right now?"
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            )}

            <div className="space-y-3">
                {goals.length === 0 && !isAdding && (
                    <div className="text-center py-10 opacity-50">
                        <p>No goals yet. Set a gentle compass for the week.</p>
                    </div>
                )}

                {goals.map(goal => (
                    <motion.div key={goal.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card className={`p-0 overflow-hidden transition-all ${goal.completed ? 'opacity-70 bg-primary/5' : 'bg-surface/90 border-l-4 border-l-primary'}`}>
                            <div className="p-5 flex items-start justify-between">
                                <div className="flex gap-4 items-start">
                                    <button onClick={() => toggleGoal(goal)} className="mt-1 text-primary hover:scale-110 transition-transform">
                                        {goal.completed ? <CheckSquare /> : <Square />}
                                    </button>
                                    <div>
                                        <h3 className={`font-medium text-lg leading-tight ${goal.completed ? 'line-through text-text-muted' : ''}`}>{goal.title}</h3>
                                        <span className="text-xs uppercase tracking-wide text-text-muted mt-1 inline-block">
                                            {goal.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => getRandomPrompt(goal.id)}
                                        className={`p-2 rounded-full transition-colors ${activePrompt === goal.id ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-text-muted'}`}
                                        title="Get a suggestion"
                                    >
                                        <Lightbulb size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="p-2 text-text-muted/40 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Prompt Section */}
                            <AnimatePresence>
                                {activePrompt === goal.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-primary/5 px-5 overflow-hidden"
                                    >
                                        <div className="py-3 text-sm text-text-main flex items-start gap-2">
                                            <span className="font-bold">Try this:</span>
                                            <span>{goalPrompts[Math.floor(Math.random() * goalPrompts.length)]}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
