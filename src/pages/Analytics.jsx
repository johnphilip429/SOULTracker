import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subDays, format } from 'date-fns';
import { useHabitStore } from '../store/useHabitStore';
import { Card } from '../components/Card';

export default function Analytics() {
    const { habits } = useHabitStore();

    // Calculate Last 7 Days Completion
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');

        let completed = 0;
        habits.forEach(h => {
            if (h.completedDates.includes(dateStr)) completed++;
        });

        data.push({
            name: format(date, 'EEE'),
            completed: completed,
            date: dateStr
        });
    }

    const activeHabitsCount = habits.filter(h => !h.archived).length;

    // Calculate average completion rate
    const totalCompleted = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
    const totalDays = 7; // simplified logic
    // Real alignment score would go here
    const alignmentScore = Math.min(100, Math.round((totalCompleted / (activeHabitsCount * 7 || 1)) * 100));

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-display text-text-main">Your Progress</h1>

            <Card className="bg-primary/10 text-text-main p-6">
                <div className="text-center">
                    <p className="text-text-muted text-sm mb-1">Weekly Alignment</p>
                    <div className="text-5xl font-display text-primary">{alignmentScore}%</div>
                    <p className="text-xs mt-2 text-text-muted">Based on habit consistency</p>
                </div>
            </Card>

            <div>
                <h2 className="text-lg font-medium mb-4">Habits this week</h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#7A857D" fontSize={12} />
                            <Tooltip
                                cursor={{ fill: '#f3f1ec' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#5F6F63" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-medium mb-4">Streaks</h2>
                <div className="grid grid-cols-2 gap-3">
                    {habits.map(h => (
                        <Card key={h.id} className="p-3">
                            <div className="text-sm font-medium truncate">{h.title}</div>
                            <div className="text-2xl text-primary mt-1">{h.completedDates.length} <span className="text-xs text-text-muted">days</span></div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
