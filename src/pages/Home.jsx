import React from 'react';
import { format } from 'date-fns';
import { Sun, Moon, CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useHabitStore } from '../store/useHabitStore';
import { getDailyQuote } from '../lib/quotes';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export default function Home() {
    const { name, settings } = useUserStore();
    const { habits, toggleHabitCompletion } = useHabitStore();
    const navigate = useNavigate();

    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    const quote = getDailyQuote(settings.faithMode);

    // Filter active habits (simplification: showing all for now)
    const todaysHabits = habits.filter(h => !h.archived);

    const completedCount = todaysHabits.filter(h => h.completedDates.includes(dateStr)).length;
    const progress = todaysHabits.length > 0 ? (completedCount / todaysHabits.length) * 100 : 0;

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-light text-primary">Good {today.getHours() < 12 ? 'Morning' : 'Evening'}, {name || 'Friend'}</h1>
                    <p className="text-text-muted text-sm mt-1">{format(today, 'EEEE, MMMM do')}</p>
                </div>
            </header>

            {/* Quote Card */}
            <Card className="bg-primary/5 border-primary/10">
                <p className="text-center font-medium italic text-primary/80">"{quote}"</p>
            </Card>

            {/* Quick Actions */}
            <div className="flex flex-col gap-4">
                {today.getHours() < 17 ? (
                    <Button variant="secondary" className="h-auto flex-col gap-2 py-6 bg-orange-50 border-orange-100 hover:bg-orange-100" onClick={() => navigate('/checkin/morning')}>
                        <Sun size={32} className="text-orange-400" />
                        <span className="text-lg font-light text-orange-900">Start Morning Check-in</span>
                    </Button>
                ) : (
                    <Button variant="secondary" className="h-auto flex-col gap-2 py-6 bg-indigo-50 border-indigo-100 hover:bg-indigo-100" onClick={() => navigate('/checkin/evening')}>
                        <Moon size={32} className="text-indigo-400" />
                        <span className="text-lg font-light text-indigo-900">Begin Evening Reflection</span>
                    </Button>
                )}

                <div className="flex justify-center">
                    <button
                        onClick={() => navigate(today.getHours() < 17 ? '/checkin/evening' : '/checkin/morning')}
                        className="text-xs text-text-muted hover:text-primary transition-colors"
                    >
                        Need the {today.getHours() < 17 ? 'evening' : 'morning'} one instead?
                    </button>
                </div>
            </div>

            {/* Today's Habits */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-lg font-medium">Daily Anchors</h2>
                    <span className="text-xs text-text-muted">{completedCount}/{todaysHabits.length} Done</span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {todaysHabits.length === 0 ? (
                    <p className="text-center text-text-muted py-8">No habits set yet. Go to the Habits tab to add some!</p>
                ) : (
                    <div className="space-y-3">
                        {todaysHabits.map(habit => {
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
                                                import('../lib/confetti').then(mod => mod.triggerHabitConfetti());
                                            }
                                        }}
                                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors duration-300 ${isCompleted ? 'bg-primary/10 border-primary/30' : 'hover:border-primary/20'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                initial={false}
                                                animate={{ scale: isCompleted ? 1.2 : 1 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            >
                                                {isCompleted ? <CheckCircle className="text-primary fill-primary/10" /> : <Circle className="text-gray-300" />}
                                            </motion.div>
                                            <span className={`${isCompleted ? 'text-primary line-through opacity-70' : 'text-text-main'} transition-all`}>{habit.title}</span>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
