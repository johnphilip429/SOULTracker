import { cn } from '../lib/utils';

export function Input({ label, className, ...props }) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <label className="text-sm font-medium text-text-muted ml-1">{label}</label>}
            <input
                className={cn(
                    "w-full px-4 py-3 rounded-2xl bg-[var(--snow-surf)] border border-[var(--snow-ice)] text-snow-primary focus:bg-[var(--snow-surf2)] focus:border-[var(--snow-ice2)] focus:ring-2 focus:ring-white/10 outline-none transition-all placeholder:text-snow-muted",
                    className
                )}
                {...props}
            />
        </div>
    );
}
