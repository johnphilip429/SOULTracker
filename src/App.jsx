import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/useUserStore';
import { Layout } from './components/Layout';
import Onboarding from './pages/Onboarding';
import Today from './pages/Today';
import Habits from './pages/Habits';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import CheckIn from './pages/CheckIn';
import Routine from './pages/Routine';
import Calendar from './pages/Calendar';

// Only guards onboarding — check-in is a nudge inside Today, not a wall
const PrivateRoute = () => {
    const { isOnboardingCompleted } = useUserStore();
    if (!isOnboardingCompleted) {
        return <Navigate to="/onboarding" replace />;
    }
    return <Layout />;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background bg-calm text-text-main font-sans">
                <main className="max-w-lg mx-auto min-h-screen bg-surface/80 shadow-soft relative overflow-hidden">
                    <Routes>
                        {/* Public Route */}
                        <Route path="/onboarding" element={<Onboarding />} />

                        {/* Standalone Check-in Routes */}
                        <Route path="/checkin/:type" element={<CheckIn />} />

                        {/* Protected Routes (Wrapped in Layout) */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/" element={<Today />} />
                            <Route path="/habits" element={<Habits />} />
                            <Route path="/goals" element={<Goals />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/routine" element={<Routine />} />
                            <Route path="/calendar" element={<Calendar />} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
