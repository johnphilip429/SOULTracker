import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from './store/useUserStore';
import { Layout } from './components/Layout';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Habits from './pages/Habits';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import CheckIn from './pages/CheckIn';

// Guard component to redirect if not onboarded
const PrivateRoute = () => {
    const { isOnboardingCompleted } = useUserStore();
    // If not completed, force to onboarding
    if (!isOnboardingCompleted) {
        return <Navigate to="/onboarding" replace />;
    }
    // Otherwise show the layout
    return <Layout />;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background text-text-main font-sans">
                <main className="max-w-md mx-auto min-h-screen bg-surface/50 shadow-sm relative overflow-hidden">
                    <Routes>
                        {/* Public Route */}
                        <Route path="/onboarding" element={<Onboarding />} />

                        {/* Standalone Check-in Routes */}
                        <Route path="/checkin/:type" element={<CheckIn />} />

                        {/* Protected Routes (Wrapped in Layout) */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/habits" element={<Habits />} />
                            <Route path="/goals" element={<Goals />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/settings" element={<Settings />} />
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
