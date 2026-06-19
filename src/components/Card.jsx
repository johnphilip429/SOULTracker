import { cn } from '../lib/utils';

export function Card({ children, className, onClick }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "rounded-2xl border p-5 transition-all backdrop-blur-md",
                "bg-[var(--snow-surf)] border-[var(--snow-ice)]",
                onClick && "cursor-pointer hover:bg-[var(--snow-surf2)] active:scale-[0.99]",
                className
            )}
        >
            {children}
        </div>
    );
}
