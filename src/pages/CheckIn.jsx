import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogStore } from '../store/useLogStore';
import { useUserStore } from '../store/useUserStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const questions = {
    morning: [
        "How are you feeling this morning?",
        "What is your #1 focus for today?",
        "Who can you serve or help today?",
        "What is one thing you are looking forward to?",
        "How can you make today 1% better?",
        "A small gratitude to start the day?"
    ],
    evening: [
        "How would you rate your alignment today? (1-10)",
        "What went well?",
        "What drained your energy?",
        "Did you live by your core values today?",
        "What is one lesson you learned?",
        "One thing to let go of before sleep?"
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
            const date = new Date().toISOString().split('T')[0];
            if (type === 'morning') {
                addMorningCheckIn(date, newAnswers);
            } else {
                addEveningReflection(date, newAnswers);
            }
            navigate('/');
        }
    };

    if (!currentQ) return <div className="p-6">Invalid Check-in Type</div>;

    return (
        <div className="min-h-screen bg-surface p-6 flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-md">
                <span className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4 block">
                    {type} Check-in
                </span>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="min-h-[200px] flex flex-col justify-center gap-6"
                    >
                        <h2 className="text-2xl font-light text-primary leading-tight">{currentQ}</h2>

                        {type === 'evening' && step === 0 ? (
                            /* Rating Scale for first evening question */
                            <div className="flex justify-center gap-2 flex-wrap">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setCurrentAnswer(num.toString())}
                                        className={`w-10 h-10 rounded-full border transition-all ${currentAnswer === num.toString() ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                className="w-full p-4 bg-background rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none resize-none"
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
