import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useHabitStore } from '../store/useHabitStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

const steps = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'mode', title: 'Experience' },
    { id: 'habits', title: 'First Habits' },
];

export default function Onboarding() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const { setName, toggleFaithMode, completeOnboarding, name, settings } = useUserStore();
    const { addHabit } = useHabitStore();

    const [localName, setLocalName] = useState(name);
    const [selectedHabits, setSelectedHabits] = useState(['Morning Hydration', 'Read 10 pages']);

    const handleNext = () => {
        if (currentStep === steps.length - 1) {
            completeSetup();
        } else {
            setCurrentStep(c => c + 1);
        }
    };

    const completeSetup = () => {
        console.log("Starting setup completion...");
        try {
            setName(localName);
            console.log("Name set:", localName);

            // Add selected sample habits
            selectedHabits.forEach(title => {
                addHabit({ title, frequency: 'daily' });
            });
            console.log("Habits added");

            completeOnboarding();
            console.log("Onboarding marked complete");

            // Force verify store state
            const state = useUserStore.getState();
            console.log("Current Store State:", state);

            navigate('/');
            console.log("Navigated to /");
            // Force reload if navigation fails to trigger re-render
            setTimeout(() => {
                console.log("Force reloading window...");
                window.location.reload();
            }, 500);
        } catch (e) {
            console.error("Setup failed:", e);
        }
    };

    const defaultHabits = [
        "Morning Prayer/Meditation",
        "Drink Water",
        "Read 10 Pages",
        "No Phone Before 8AM",
        "Workout 30 mins",
        "Review Goals"
    ];

    const toggleHabitSelection = (habit) => {
        if (selectedHabits.includes(habit)) {
            setSelectedHabits(prev => prev.filter(h => h !== habit));
        } else {
            setSelectedHabits(prev => [...prev, habit]);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="flex justify-between mb-8 opacity-50">
                    {steps.map((step, idx) => (
                        <div key={step.id} className={`h-1 flex-1 mx-1 rounded-full bg-primary ${idx <= currentStep ? '' : 'opacity-20'}`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === 0 && (
                            <div className="text-center space-y-6">
                                <h1 className="text-3xl font-light text-primary">SoulTrack Aligned</h1>
                                <p className="text-text-muted">A gentle space for your goals, habits, and peace of mind.</p>
                                <div className="pt-4">
                                    <Input
                                        placeholder="What should we call you?"
                                        value={localName}
                                        onChange={(e) => setLocalName(e.target.value)}
                                        className="text-center text-lg"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-light text-primary">Customize your space</h2>
                                    <p className="text-text-muted mt-2">Would you like to include faith-based spiritual encouragement?</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 pt-4">
                                    <Card
                                        onClick={() => !settings.faithMode && toggleFaithMode()}
                                        className={`border-2 ${settings.faithMode ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Yes, include Faith content</span>
                                            {settings.faithMode && <Check className="text-primary" />}
                                        </div>
                                    </Card>

                                    <Card
                                        onClick={() => settings.faithMode && toggleFaithMode()}
                                        className={`border-2 ${!settings.faithMode ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">No, keep it secular</span>
                                            {!settings.faithMode && <Check className="text-primary" />}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-light text-primary">Let's start small</h2>
                                    <p className="text-text-muted mt-2">Pick 2-3 habits to anchor your day.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 pt-2 max-h-[50vh] overflow-y-auto">
                                    {defaultHabits.map(habit => (
                                        <Card
                                            key={habit}
                                            onClick={() => toggleHabitSelection(habit)}
                                            className={`p-4 cursor-pointer transition-all ${selectedHabits.includes(habit) ? 'ring-2 ring-primary ring-inset bg-primary/5' : 'opacity-80'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{habit}</span>
                                                {selectedHabits.includes(habit) && <Check size={18} className="text-primary" />}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-10 flex justify-end">
                    <Button
                        onClick={handleNext}
                        disabled={currentStep === 0 && !localName.trim()}
                        className="w-full sm:w-auto"
                    >
                        {currentStep === steps.length - 1 ? "Let's Begin" : "Next"} <ChevronRight size={18} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
