// frontend/src/pages/TimeTracker/components/ui/CustomDatePicker.tsx
import { useState, useRef, useEffect } from 'react';
import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { getLocalDateStr } from '../../utils';

export const CustomDatePicker = ({ startDate, endDate, onStartChange, onEndChange, disabled }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(startDate)); 
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

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const startDayOffset = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const empties = Array.from({length: startDayOffset}, (_, i) => i);

    const handleDateClick = (day: number) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dStr = getLocalDateStr(d);
        
        if (startDate === endDate) {
            if (dStr < startDate) { onStartChange(dStr); }
            else { onEndChange(dStr); }
        } else {
            onStartChange(dStr);
            onEndChange(dStr);
        }
    };

    const isSelected = (day: number) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dStr = getLocalDateStr(d);
        return (dStr >= startDate && dStr <= endDate);
    };

    const isStartOrEnd = (day: number) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dStr = getLocalDateStr(d);
        return dStr === startDate || dStr === endDate;
    };

    return (
        <div className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-black/10 transition"
            >
                <div className="flex items-center gap-2">
                    <CalendarBlank className="opacity-60" />
                    <span className="text-sm font-medium">
                        {new Date(startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})} 
                        {' - '}
                        {new Date(endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 w-[300px] mt-2 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 p-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth()-1)))} className="p-1 hover:bg-black/5 rounded"><CaretLeft /></button>
                        <span className="text-sm font-bold">{viewDate.toLocaleDateString(undefined, {month:'long', year:'numeric'})}</span>
                        <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth()+1)))} className="p-1 hover:bg-black/5 rounded"><CaretRight /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-bold opacity-40 mb-2">{d}</div>)}
                        {empties.map((_, i) => <div key={`empty-${i}`} />)}
                        {days.map(d => (
                            <div 
                                key={d}
                                onClick={() => handleDateClick(d)}
                                className={`
                                    h-8 w-8 flex items-center justify-center text-xs rounded-full cursor-pointer transition
                                    ${isStartOrEnd(d) ? 'bg-indigo-500 text-white font-bold shadow-md' : 
                                      isSelected(d) ? 'bg-indigo-500/20 text-indigo-500' : 'hover:bg-black/5 dark:hover:bg-white/10'}
                                `}
                            >
                                {d}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};