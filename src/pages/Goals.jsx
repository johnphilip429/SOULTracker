import React, { useState } from 'react';
import { Target, Plus, Trash2, CheckSquare, Square, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoalStore } from '../store/useGoalStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const goalPrompts = [
    "What is the smallest step you can take right now?",
    "Who can you ask for help or advice?",
    "Why is this goal important to you today?",
    "Visualize the feeling of completing this.",
    "Can you break this down into a 5-minute task?",
    "What distraction can you remove to focus on this?",
    "Is there a different approach you haven't tried?",
    "Set a timer for 20 minutes and just start."
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
                <h1 className="text-2xl font-light text-primary">Key Goals</h1>
                <Button onClick={() => setIsAdding(true)} className="px-3 py-2">
                    <Plus size={20} />
                </Button>
            </div>

            {isAdding && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-white border-2 border-primary/10 mb-4">
                        <form onSubmit={handleAdd} className="space-y-4">
                            <Input
                                placeholder="What is your main focus? (e.g. Lose 10lbs)"
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
                        <p>No goals defined. Set a compass for your week.</p>
                    </div>
                )}

                {goals.map(goal => (
                    <motion.div key={goal.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card className={`p-0 overflow-hidden transition-all ${goal.completed ? 'opacity-70 bg-gray-50' : 'bg-white border-l-4 border-l-primary'}`}>
                            <div className="p-5 flex items-start justify-between">
                                <div className="flex gap-4 items-start">
                                    <button onClick={() => toggleGoal(goal)} className="mt-1 text-primary hover:scale-110 transition-transform">
                                        {goal.completed ? <CheckSquare /> : <Square />}
                                    </button>
                                    <div>
                                        <h3 className={`font-medium text-lg leading-tight ${goal.completed ? 'line-through text-gray-400' : ''}`}>{goal.title}</h3>
                                        <span className="text-xs uppercase tracking-wide text-text-muted mt-1 inline-block">
                                            {goal.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => getRandomPrompt(goal.id)}
                                        className={`p-2 rounded-full transition-colors ${activePrompt === goal.id ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100 text-gray-400'}`}
                                        title="Get a suggestion"
                                    >
                                        <Lightbulb size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
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
                                        className="bg-yellow-50 px-5 overflow-hidden"
                                    >
                                        <div className="py-3 text-sm text-yellow-800 flex items-start gap-2">
                                            <span className="font-bold">✨ Try this:</span>
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
