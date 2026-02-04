import { cn } from '../lib/utils';

export function Input({ label, className, ...props }) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <label className="text-sm font-medium text-text-muted ml-1">{label}</label>}
            <input
                className={cn(
                    "w-full px-4 py-3 rounded-xl bg-background border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400",
                    className
                )}
                {...props}
            />
        </div>
    );
}
