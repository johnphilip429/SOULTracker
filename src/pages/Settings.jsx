import React from 'react';
import { useUserStore } from '../store/useUserStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
// import { Switch } from 'lucide-react'; // Conceptual switch, implementing toggle manually

export default function Settings() {
    const { name, settings, toggleFaithMode, setName } = useUserStore();

    const handleReset = () => {
        if (confirm("Are you sure? This will wipe all progress.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-display text-text-main">Settings</h1>

            <section className="space-y-4">
                <h2 className="text-lg font-medium text-text-muted uppercase tracking-wider text-sm">Profile</h2>
                <Card className="p-4">
                    <label className="text-sm text-text-muted">Display Name</label>
                    <input
                        className="w-full mt-1 text-lg font-medium bg-transparent border-b border-primary/20 focus:outline-none focus:border-primary py-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-medium text-text-muted uppercase tracking-wider text-sm">Experience</h2>
                <Card className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer" onClick={toggleFaithMode}>
                    <div>
                        <h3 className="font-medium">Faith Mode</h3>
                        <p className="text-sm text-text-muted">Show gentle spiritual prompts and verses</p>
                    </div>
                    <div className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${settings.faithMode ? 'bg-primary' : 'bg-primary/20'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.faithMode ? 'translate-x-5' : ''}`} />
                    </div>
                </Card>
            </section>

            <section className="pt-8 text-center text-sm text-text-muted">
                <p>SoulTrack Aligned v0.1</p>
                <button onClick={handleReset} className="text-red-400 mt-4 hover:underline">Reset Data</button>
            </section>
        </div>
    );
}
