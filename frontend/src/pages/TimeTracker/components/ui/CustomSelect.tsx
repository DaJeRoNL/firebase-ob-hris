// frontend/src/pages/TimeTracker/components/ui/CustomSelect.tsx
import { useState, useRef, useEffect } from 'react';
import { CaretDown } from '@phosphor-icons/react';

export const CustomSelect = ({ value, onChange, options, icon: Icon }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find((o: any) => o.value === value)?.label || value;

    return (
        <div className="relative" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition"
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="opacity-60" />}
                    <span className="text-sm font-medium">{selectedLabel}</span>
                </div>
                <CaretDown className={`opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                    {options.map((opt: any) => (
                        <div 
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-white/5 flex items-center gap-2
                                ${value === opt.value ? 'text-indigo-500 font-bold bg-indigo-50/50' : 'opacity-80'}`}
                        >
                            {opt.icon && <opt.icon size={16} />}
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};