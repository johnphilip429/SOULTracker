import { cn } from '../lib/utils';

export function Card({ children, className, onClick }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-shadow",
                onClick && "cursor-pointer hover:shadow-md active:bg-gray-50",
                className
            )}
        >
            {children}
        </div>
    );
}
