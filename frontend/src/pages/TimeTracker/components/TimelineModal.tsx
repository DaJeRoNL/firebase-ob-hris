// frontend/src/pages/TimeTracker/components/TimelineModal.tsx
import { useState } from 'react';
import { X, FirstAid, Smiley, User, Info } from '@phosphor-icons/react';
import { TimeEntry } from '../../../types';
import { LeaveRequest } from '../types';
import { getSecondsFromTime, calculateDuration } from '../utils';

interface Props {
    date: Date;
    entries: TimeEntry[];
    leaveRequests: LeaveRequest[];
    currentClientId: string;
    onClose: () => void;
}

export default function TimelineModal({ date, entries, leaveRequests, currentClientId, onClose }: Props) {
    const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
    const dateStr = date.toLocaleDateString('en-CA');

    // Reconstruct display entries for visualization (merged logic)
    const dayEntries: any[] = entries.filter(e => e.date === dateStr && e.clientId === currentClientId);
    const activeLeaves = leaveRequests.filter(l => dateStr >= l.startDate && dateStr <= l.endDate);
    
    activeLeaves.forEach(leave => {
        let sStart = "00:00:00";
        let sEnd = "23:59:59";
        if (leave.type === 'Sick') {
            if (dateStr === leave.startDate && leave.reportedAt) sStart = leave.reportedAt;
            if (dateStr === leave.endDate && leave.returnedAt) sEnd = leave.returnedAt;
        } else {
            if (dateStr === leave.startDate && leave.startTime) sStart = leave.startTime;
            if (dateStr === leave.endDate && leave.endTime) sEnd = leave.endTime;
        }
        dayEntries.push({
            id: `leave-${leave.id}`,
            startTime: sStart,
            endTime: sEnd,
            isVirtualLeave: true,
            leaveType: leave.type
        });
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1e1b4b] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] mt-[-10vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-white dark:bg-[#1e1b4b] border-b border-gray-100 dark:border-white/10 shrink-0 z-20">
                    <div className="p-4 flex justify-between items-center">
                        <h2 className="text-lg font-bold font-['Montserrat']">Timeline: {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</h2>
                        <button onClick={onClose} className="hover:text-red-500 transition"><X size={20} /></button>
                    </div>
                    <div className="px-6 pb-4">
                        <div className="flex justify-between text-[10px] opacity-50 uppercase font-bold mb-1"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
                        <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full relative overflow-hidden flex">
                            {dayEntries.map((e, idx) => {
                                if (e.isVirtualLeave) return null; 
                                const leftPct = (getSecondsFromTime(e.startTime) / 86400) * 100;
                                const widthPct = ((getSecondsFromTime(e.endTime) - getSecondsFromTime(e.startTime)) / 86400) * 100;
                                const isHovered = hoveredEntryId === e.id;
                                return <div key={idx} onMouseEnter={() => e.id && setHoveredEntryId(e.id)} onMouseLeave={() => setHoveredEntryId(null)} className={`absolute h-full border-r-2 border-white/30 transition-colors duration-200 cursor-pointer ${isHovered ? 'bg-indigo-400' : 'bg-indigo-600'}`} style={{ left: `${leftPct}%`, width: `${widthPct}%` }} title={`${e.startTime} - ${e.endTime}`} />;
                            })}
                            
                            {dayEntries.filter(e => e.isVirtualLeave).map(e => {
                                const lType = e.leaveType;
                                let colorClass = 'bg-gray-500/40 border-gray-500';
                                if (lType === 'Sick') colorClass = 'bg-red-500/40 border-red-500';
                                else if (lType === 'Vacation') colorClass = 'bg-emerald-500/40 border-emerald-500';
                                else if (lType === 'Personal') colorClass = 'bg-indigo-500/40 border-indigo-500';

                                return <div key={e.id} onMouseEnter={() => e.id && setHoveredEntryId(e.id)} onMouseLeave={() => setHoveredEntryId(null)} className={`absolute h-full ${colorClass} border-l`} style={{ left: `${(getSecondsFromTime(e.startTime) / 86400) * 100}%`, width: `${((getSecondsFromTime(e.endTime) - getSecondsFromTime(e.startTime)) / 86400) * 100}%` }} title={`${lType} Leave`} />;
                            })}
                        </div>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto relative">
                    <div className="relative pl-4 ml-2 flex flex-col gap-6 border-l-2 border-dashed border-gray-200 dark:border-white/10 pb-6">
                        {dayEntries.sort((a,b) => a.startTime.localeCompare(b.startTime)).map((e, idx) => {
                             const isHovered = hoveredEntryId === e.id;
                             if (e.isVirtualLeave) {
                                const lType = e.leaveType;
                                let color = 'text-gray-500'; let bg = 'bg-gray-500/10'; let border = 'border-gray-500/50'; let Icon = Info;
                                if (lType === 'Sick') { color = 'text-red-500'; bg = 'bg-red-500/10'; border = 'border-red-500/50'; Icon = FirstAid; }
                                else if (lType === 'Vacation') { color = 'text-emerald-500'; bg = 'bg-emerald-500/10'; border = 'border-emerald-500/50'; Icon = Smiley; }
                                else if (lType === 'Personal') { color = 'text-indigo-500'; bg = 'bg-indigo-500/10'; border = 'border-indigo-500/50'; Icon = User; }

                                return (
                                    <div key={e.id} className="relative pl-6">
                                        <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-white dark:border-[#1e1b4b] ${color.replace('text', 'bg')}`}></div>
                                        <div onMouseEnter={() => setHoveredEntryId(e.id || null)} onMouseLeave={() => setHoveredEntryId(null)} className={`glass-card !p-4 !${bg} !border-${border.split('-')[1]} transition duration-200 cursor-pointer ${isHovered ? 'scale-[1.01] shadow-lg' : ''}`} style={{ borderColor: border.includes('red') ? 'rgba(239,68,68,0.5)' : border.includes('emerald') ? 'rgba(16,185,129,0.5)' : 'rgba(99,102,241,0.5)' }}>
                                            <div className={`flex items-center gap-2 mb-2 font-bold ${color}`}><Icon weight="fill" /> {lType} Leave</div>
                                            <div className="text-xs opacity-80">Automatic Entry • {e.startTime} - {e.endTime}</div>
                                        </div>
                                    </div>
                                );
                             }
                             return (
                                <div key={idx} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-white dark:border-[#1e1b4b] transition-colors ${isHovered ? 'bg-indigo-400' : 'bg-indigo-600'}`}></div>
                                    <div onMouseEnter={() => setHoveredEntryId(e.id || null)} onMouseLeave={() => setHoveredEntryId(null)} className={`glass-card !p-4 !bg-gray-50/50 dark:!bg-white/5 transition duration-200 cursor-pointer ${isHovered ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.01]' : ''}`}>
                                        <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><span className="font-bold text-sm text-indigo-500">{e.startTime} - {e.endTime}</span><span className="text-[10px] font-bold opacity-40">#{idx + 1}</span></div><span className="text-xs font-mono opacity-60 bg-white/10 px-2 py-0.5 rounded">{calculateDuration(e.startTime, e.endTime)}</span></div>
                                        <div className="text-xs opacity-80 whitespace-pre-wrap">{e.notes || "No notes provided."}</div>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}