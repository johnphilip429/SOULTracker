import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogStore } from '../store/useLogStore';
import { format } from 'date-fns';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const questions = {
    morning: [
        "How did you sleep, and how does your body feel right now?",
        "What would make today feel aligned, not just productive?",
        "What is one small, clear priority to honor today?",
        "Who or what deserves your gentle attention today?",
        "What can you release or do less of to stay grounded?",
        "A quiet gratitude to begin the day?"
    ],
    evening: [
        "How aligned did today feel overall? (1-10)",
        "What felt nourishing or steady today?",
        "What pulled you off center?",
        "Did you honor your values in a small way?",
        "What is one lesson or insight from today?",
        "What do you want to set down before sleep?"
    ]
};

export default function CheckIn() {
    const { type } = useParams(); // 'morning' or 'evening'
    const navigate = useNavigate();
    const { addMorningCheckIn, addEveningReflection } = useLogStore();

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [currentAnswer, setCurrentAnswer] = useState('');

    const qList = questions[type] || [];
    const currentQ = qList[step];

    const handleNext = () => {
        const newAnswers = { ...answers, [currentQ]: currentAnswer };
        setAnswers(newAnswers);
        setCurrentAnswer('');

        if (step < qList.length - 1) {
            setStep(s => s + 1);
        } else {
            // Finish
            const now = new Date();
            const date = format(now, 'yyyy-MM-dd');
            if (type === 'morning') {
                addMorningCheckIn(date, newAnswers, now.toISOString());
            } else {
                addEveningReflection(date, newAnswers, now.toISOString());
            }
            navigate('/');
        }
    };

    if (!currentQ) return <div className="p-6">Invalid Check-in Type</div>;

    return (
        <div className="min-h-screen bg-background bg-calm p-6 flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-lg">
                <span className="text-xs font-medium text-text-muted uppercase tracking-[0.2em] mb-3 block">
                    {type} Check-in
                </span>
                <h1 className="text-3xl font-display text-text-main mb-2">
                    {type === 'morning' ? 'Start softly' : 'Land the day'}
                </h1>
                <p className="text-sm text-text-muted mb-8">
                    Take a breath. Answer what feels true, not what feels perfect.
                </p>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="min-h-[220px] flex flex-col justify-center gap-6"
                    >
                        <Card className="p-6 bg-surface/90 border border-primary/10 shadow-soft">
                            <h2 className="text-2xl font-display text-text-main leading-tight">{currentQ}</h2>
                        </Card>

                        {type === 'evening' && step === 0 ? (
                            /* Rating Scale for first evening question */
                            <div className="flex justify-center gap-2 flex-wrap">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setCurrentAnswer(num.toString())}
                                        className={`w-10 h-10 rounded-full border transition-all text-sm ${currentAnswer === num.toString() ? 'bg-primary text-white border-primary' : 'border-primary/20 hover:border-primary'}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                className="w-full p-4 bg-surface/90 rounded-2xl border border-primary/10 focus:ring-2 focus:ring-primary/20 outline-none resize-none shadow-soft"
                                rows={4}
                                placeholder="Type here..."
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                autoFocus
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex justify-between items-center">
                    <span className="text-xs text-text-muted">Question {step + 1} of {qList.length}</span>
                    <Button onClick={handleNext} disabled={!currentAnswer}>
                        {step === qList.length - 1 ? "Complete" : "Next"}
                    </Button>
                </div>

                <button onClick={() => navigate('/')} className="mt-8 text-sm text-text-muted hover:text-text-main">
                    Cancel
                </button>
            </div>
        </div>
    );
}
