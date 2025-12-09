// frontend/src/pages/TimeTracker/components/StatsSidebar.tsx
import { Clock, CalendarPlus, CalendarCheck } from '@phosphor-icons/react';
import { TimeEntry } from '../../../types';
import { getLocalDateStr } from '../utils';

interface Props {
    entries: TimeEntry[];
    currentClientId: string;
    selectedDate: Date;
    onOpenLeavePopup: () => void;
}

export default function StatsSidebar({ entries, currentClientId, selectedDate, onOpenLeavePopup }: Props) {
    
    // --- Daily Calculation ---
    const getDailyTotal = () => {
        const dateStr = getLocalDateStr(selectedDate);
        const dailyEntries = entries.filter(e => e.date === dateStr && e.clientId === currentClientId);
        
        const totalSeconds = dailyEntries.reduce((acc, curr) => {
             const parts = curr.duration.split(':').map(Number);
             const dur = parts.length === 3 ? parts[0]*3600 + parts[1]*60 + parts[2] : 0;
             return acc + dur;
        }, 0);

        const totalHours = totalSeconds / 3600;
        // Round to nearest 0.25
        const increments = Math.round(totalHours * 4) / 4; 
        return `${increments}h`;
    };

    // --- Weekly Calculation ---
    const getWeeklyTotal = () => {
        const d = new Date(selectedDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
        const monday = new Date(d.setDate(diff));
        monday.setHours(0,0,0,0);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23,59,59,999);
    
        const weekEntries = entries.filter(e => {
            const entryDate = new Date(e.date);
            return entryDate >= monday && entryDate <= sunday && e.clientId === currentClientId;
        });
    
        const totalSeconds = weekEntries.reduce((acc, curr) => {
            const parts = curr.duration.split(':').map(Number);
            const dur = parts.length === 3 ? parts[0]*3600 + parts[1]*60 + parts[2] : 0;
            return acc + dur;
        }, 0);
    
        const totalHours = totalSeconds / 3600;
        const increments = Math.round(totalHours * 4) / 4;
        return `${increments}h`;
    };

    return (
        <>
            {/* Merged Stats Widget */}
            <div className="glass-card p-4 h-32 flex items-center">
                {/* Left: Daily */}
                <div className="flex-1 border-r border-gray-200 dark:border-white/10 pr-4 flex flex-col justify-center h-full">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                        <CalendarCheck size={18} weight="duotone" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold opacity-60">Daily</div>
                        <div className="text-xl font-bold">{getDailyTotal()}</div>
                    </div>
                </div>

                {/* Right: Weekly */}
                <div className="flex-1 pl-4 flex flex-col justify-center h-full">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
                        <Clock size={18} weight="duotone" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold opacity-60">Weekly</div>
                        <div className="text-xl font-bold">{getWeeklyTotal()}</div>
                    </div>
                </div>
            </div>

            {/* Time Off Request Widget */}
            <div className="glass-card p-4 flex flex-col justify-between h-28">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
                    <CalendarPlus size={20} weight="duotone" />
                </div>
                <div>
                    <div className="text-xs uppercase font-bold opacity-60 mb-1">Time Off</div>
                    <button 
                        onClick={onOpenLeavePopup} 
                        className="text-xs font-bold bg-indigo-500 text-white px-3 py-1.5 rounded-lg w-full hover:bg-indigo-600 transition"
                    >
                        Request
                    </button>
                </div>
            </div>
        </>
    );
}