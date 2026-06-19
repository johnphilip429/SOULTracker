import { Outlet, NavLink } from 'react-router-dom';
import { Home, CheckCircle2, Target, BarChart2, Settings, CalendarDays } from 'lucide-react';
import { cn } from '../lib/utils';

function NavItem({ to, icon: Icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300",
                isActive
                    ? "text-snow-primary bg-[var(--snow-surf2)]"
                    : "text-snow-muted hover:text-snow-secondary"
            )}
        >
            <Icon size={24} strokeWidth={2} />
        </NavLink>
    );
}

export function Layout() {
    return (
        <div className="flex flex-col h-full min-h-screen bg-snow-page">
            <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
                <Outlet />
            </div>

            <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[rgba(6,13,26,0.85)] backdrop-blur-xl border-t border-[var(--snow-ice)] p-4 pb-6 z-50">
                <div className="flex justify-around items-center">
                    <NavItem to="/" icon={Home} label="Today" />
                    <NavItem to="/calendar" icon={CalendarDays} label="Calendar" />
                    <NavItem to="/habits" icon={CheckCircle2} label="Habits" />
                    <NavItem to="/goals" icon={Target} label="Goals" />
                    <NavItem to="/analytics" icon={BarChart2} label="Progress" />
                    <NavItem to="/settings" icon={Settings} label="Settings" />
                </div>
            </nav>
        </div>
    );
}
