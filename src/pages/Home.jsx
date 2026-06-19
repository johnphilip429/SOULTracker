import React from 'react';
import { format } from 'date-fns';
import { Sun, Moon, CheckCircle, Circle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useHabitStore } from '../store/useHabitStore';
import { useLogStore } from '../store/useLogStore';
import { getDailyQuote } from '../lib/quotes';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export default function Home() {
    const { name, settings } = useUserStore();
    const { habits, toggleHabitCompletion } = useHabitStore();
    const { logs } = useLogStore();
    const navigate = useNavigate();

    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    const quote = getDailyQuote(settings.faithMode);
    const todayLog = logs.find(l => l.date === dateStr);
    const morningDone = Boolean(todayLog?.morningCheckIn);
    const eveningDone = Boolean(todayLog?.eveningReflection);
    const morningAt = todayLog?.morningCheckInAt ? new Date(todayLog.morningCheckInAt) : null;
    const hoursSinceMorning = morningAt ? (today - morningAt) / 3600000 : (morningDone ? 6 : 0);
    const eveningAvailable = morningDone && !eveningDone && hoursSinceMorning >= 5;
    const eveningOverdue = morningDone && !eveningDone && hoursSinceMorning >= 8;
    const hoursToEvening = morningDone && !eveningDone && hoursSinceMorning < 5
        ? Math.max(0, 5 - hoursSinceMorning)
        : 0;
    const hoursLeft = Math.floor(hoursToEvening);
    const minutesLeft = Math.max(0, Math.round((hoursToEvening - hoursLeft) * 60));

    // Filter active habits (simplification: showing all for now)
    const todaysHabits = habits.filter(h => !h.archived);

    const completedCount = todaysHabits.filter(h => h.completedDates.includes(dateStr)).length;
    const progress = todaysHabits.length > 0 ? (completedCount / todaysHabits.length) * 100 : 0;

    return (
        <div className="p-6 space-y-10">
            {/* Header */}
            <header className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Today</p>
                <h1 className="text-3xl font-display text-text-main">
                    Good {today.getHours() < 12 ? 'morning' : 'evening'}, {name || 'Friend'}.
                </h1>
                <p className="text-text-muted text-sm">{format(today, 'EEEE, MMMM do')}</p>
            </header>

            {/* Quote Card */}
            <Card className="bg-surface/80 border-primary/10">
                <p className="text-center font-medium text-primary/80">“{quote}”</p>
            </Card>

            {/* Check-in Focus */}
            <Card className="p-6">
                {!morningDone && (
                    <div className="space-y-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-primary">
                            <Sun size={20} />
                            <span className="text-sm uppercase tracking-[0.2em]">Morning Check-in</span>
                        </div>
                        <h2 className="text-2xl font-display text-text-main">Set the tone gently</h2>
                        <p className="text-sm text-text-muted">
                            A few quiet questions to align your day before it begins.
                        </p>
                        <Button onClick={() => navigate('/checkin/morning')} className="w-full">
                            Begin Morning Check-in
                        </Button>
                    </div>
                )}

                {morningDone && !eveningDone && (
                    <div className="space-y-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-primary">
                            <Moon size={20} />
                            <span className="text-sm uppercase tracking-[0.2em]">Evening Reflection</span>
                        </div>
                        <h2 className="text-2xl font-display text-text-main">
                            {eveningAvailable ? 'Close the day with care' : 'Reflection unlocks soon'}
                        </h2>
                        <p className="text-sm text-text-muted">
                            {eveningAvailable
                                ? (eveningOverdue ? "It's been a while. A short reflection can still help you reset." : "When you're ready, take a few minutes to land the day.")
                                : `Available in ${hoursLeft}h ${minutesLeft}m. We'll be here.`}
                        </p>
                        <Button
                            onClick={() => navigate('/checkin/evening')}
                            className="w-full"
                            disabled={!eveningAvailable}
                        >
                            Begin Evening Reflection
                        </Button>
                    </div>
                )}

                {morningDone && eveningDone && (
                    <div className="space-y-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-primary">
                            <Sparkles size={18} />
                            <span className="text-sm uppercase tracking-[0.2em]">Aligned</span>
                        </div>
                        <h2 className="text-2xl font-display text-text-main">Both check-ins complete</h2>
                        <p className="text-sm text-text-muted">
                            You showed up for yourself today. Rest is part of the plan.
                        </p>
                    </div>
                )}
            </Card>

            {/* Today's Habits */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-lg font-medium">Daily Anchors</h2>
                    <span className="text-xs text-text-muted">{completedCount}/{todaysHabits.length} Done</span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-primary/10 rounded-full mb-6 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {todaysHabits.length === 0 ? (
                    <p className="text-center text-text-muted py-8">No anchors yet. Add a small one when you’re ready.</p>
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
                                                {isCompleted ? <CheckCircle className="text-primary fill-primary/10" /> : <Circle className="text-text-muted/40" />}
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
