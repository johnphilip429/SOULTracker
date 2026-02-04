import { cn } from '../lib/utils'; // Assuming we create a utils file for clsx/tailwind-merge

export function Button({ children, variant = 'primary', className, ...props }) {
    const baseStyles = "inline-flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md",
        secondary: "bg-white text-primary border-2 border-primary/20 hover:bg-primary/5",
        ghost: "bg-transparent text-text-muted hover:bg-black/5 hover:text-text-main",
        danger: "bg-red-50 text-red-600 hover:bg-red-100",
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
