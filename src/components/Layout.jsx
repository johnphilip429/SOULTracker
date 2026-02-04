import { Outlet, NavLink } from 'react-router-dom';
import { Home, CheckCircle2, Target, BarChart2, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

function NavItem({ to, icon: Icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300",
                isActive ? "text-primary bg-primary/10" : "text-gray-400 hover:text-text-main"
            )}
        >
            <Icon size={24} strokeWidth={2} />
            {/* <span className="text-[10px] font-medium mt-1">{label}</span> */}
        </NavLink>
    );
}

export function Layout() {
    return (
        <div className="flex flex-col h-full min-h-screen">
            <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
                <Outlet />
            </div>

            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-gray-100 p-4 pb-6 z-50">
                <div className="flex justify-around items-center">
                    <NavItem to="/" icon={Home} label="Today" />
                    <NavItem to="/habits" icon={CheckCircle2} label="Habits" />
                    <NavItem to="/goals" icon={Target} label="Goals" />
                    <NavItem to="/analytics" icon={BarChart2} label="Progress" />
                    <NavItem to="/settings" icon={Settings} label="Settings" />
                </div>
            </nav>
        </div>
    );
}
