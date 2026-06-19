import React, { useState } from 'react';
import { Plus, Trash2, Flame, X } from 'lucide-react';
import { useHabitStore } from '../store/useHabitStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export default function Habits() {
    const { habits, addHabit, deleteHabit } = useHabitStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;
        addHabit({ title: newHabitTitle, frequency: 'daily' });
        setNewHabitTitle('');
        setIsAdding(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-display text-text-main">Daily Anchors</h1>
                <Button onClick={() => setIsAdding(true)} className="px-3 py-2">
                    <Plus size={20} />
                </Button>
            </div>

            {isAdding && (
                <Card className="bg-surface/90 border border-primary/10">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <Input
                            placeholder="Habit name (e.g., Read, Walk, Pray)"
                            value={newHabitTitle}
                            onChange={(e) => setNewHabitTitle(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-3">
                {habits.length === 0 && !isAdding && (
                    <div className="text-center py-10 opacity-50">
                        <p>No anchors yet. Start with one small habit.</p>
                    </div>
                )}

                {habits.map(habit => {
                    // Calculate Streak (naive)
                    const streak = habit.completedDates.length; // Placeholder logic

                    return (
                        <Card key={habit.id} className="p-4 flex items-center justify-between group">
                            <div>
                                <h3 className="font-medium">{habit.title}</h3>
                                <div className="flex items-center text-xs text-text-muted mt-1 gap-2">
                                    <div className="flex items-center text-primary">
                                        <Flame size={12} className="mr-0.5" /> {streak} days
                                    </div>
                                    <span>• {habit.frequency}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => deleteHabit(habit.id)}
                                    className="text-text-muted/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
