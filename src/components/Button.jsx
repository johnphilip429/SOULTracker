import { cn } from '../lib/utils'; // Assuming we create a utils file for clsx/tailwind-merge

export function Button({ children, variant = 'primary', className, ...props }) {
    const baseStyles = "inline-flex items-center justify-center px-5 py-3 rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary:   "bg-[var(--snow-surf2)] text-snow-primary border border-[var(--snow-ice2)] hover:bg-[rgba(255,255,255,0.12)]",
        secondary: "bg-[var(--snow-surf)] text-snow-secondary border border-[var(--snow-ice)] hover:bg-[var(--snow-surf2)]",
        ghost:     "bg-transparent text-snow-muted hover:bg-[var(--snow-surf)] hover:text-snow-secondary",
        danger:    "bg-red-900/30 text-red-400 border border-red-900/50 hover:bg-red-900/50",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
}
