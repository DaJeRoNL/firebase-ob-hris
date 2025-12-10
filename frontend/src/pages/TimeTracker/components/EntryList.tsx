// frontend/src/pages/TimeTracker/components/EntryList.tsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { ChartBar, Plus, Trash, Info, FirstAid, Smiley, User, Flag, Clock, CaretDown, CaretUp, Stack } from '@phosphor-icons/react';
import type { TimeEntry } from '../../../types'; 
import { LeaveRequest } from '../types';
import { getLocalDateStr, calculateDuration, getHourMarker, formatTime, getSecondsFromTime } from '../utils';

interface Props {
    selectedDate: Date;
    entries: TimeEntry[];
    leaveRequests: LeaveRequest[];
    currentClientId: string;
    onManualAdd: () => void;
    onUpdate: (id: string | undefined, field: any, val: any) => void;
    onNoteUpdate: (id: string | undefined, idx: number, val: string) => void;
    onAddNote: (id: string) => void;
    onDelete: (id: string | undefined) => void;
    onShowTimeline: () => void;
    isRunning: boolean;
    startTime: Date | null;
    seconds: number;
    onExpandedChange?: (isExpanded: boolean) => void;
}

export default function EntryList({ 
    selectedDate, entries, leaveRequests, currentClientId, 
    onManualAdd, onUpdate, onNoteUpdate, onAddNote, onDelete, onShowTimeline,
    isRunning, startTime, seconds, onExpandedChange
}: Props) {
    const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
    const [showOlder, setShowOlder] = useState(false);
    const [hasScrollBelow, setHasScrollBelow] = useState(false);
    
    const closeTimerRef = useRef<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const selectedDateStr = getLocalDateStr(selectedDate);
    const isSelectedDateFuture = selectedDateStr > getLocalDateStr(new Date());
    const isToday = selectedDateStr === getLocalDateStr(new Date());

    useEffect(() => {
        if (onExpandedChange) {
            onExpandedChange(showOlder);
        }
    }, [showOlder]);

    // --- DATA PREPARATION ---
    const displayEntries = useMemo(() => {
        const combined: any[] = entries.filter(e => e.date === selectedDateStr && e.clientId === currentClientId);
        
        const activeLeaves = leaveRequests.filter(l => selectedDateStr >= l.startDate && selectedDateStr <= l.endDate);
        
        activeLeaves.forEach(leave => {
            let sStart = "00:00:00";
            let sEnd = "23:59:59";
            
            if (leave.type === 'Sick') {
                if (selectedDateStr === leave.startDate && leave.reportedAt) sStart = leave.reportedAt;
                if (selectedDateStr === leave.endDate && leave.returnedAt) sEnd = leave.returnedAt;
            } else {
                if (selectedDateStr === leave.startDate && leave.startTime) sStart = leave.startTime;
                if (selectedDateStr === leave.endDate && leave.endTime) sEnd = leave.endTime;
            }
            
            const dur = calculateDuration(sStart, sEnd);
    
            combined.push({
                id: `leave-${leave.id}`,
                clientId: currentClientId,
                date: selectedDateStr,
                startTime: sStart,
                endTime: sEnd,
                duration: dur,
                notes: `${leave.type} Leave • ${leave.status}`,
                isManual: false,
                isVirtualLeave: true,
                leaveType: leave.type,
                leaveStatus: leave.status
            });
        });
        
        return combined.sort((a,b) => getSecondsFromTime(b.startTime) - getSecondsFromTime(a.startTime));
    }, [entries, leaveRequests, selectedDateStr, currentClientId]);

    const activeSick = leaveRequests.find(l => l.type === 'Sick' && selectedDateStr >= l.startDate && selectedDateStr <= l.endDate);

    // --- GROUPING LOGIC ---
    const threshold = 3;
    const shouldGroup = displayEntries.length > threshold;
    const recentEntries = displayEntries.slice(0, threshold);
    const olderEntries = displayEntries.slice(threshold);

    // --- SCROLL CHECK LOGIC ---
    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            setHasScrollBelow(scrollHeight - scrollTop > clientHeight + 10);
        }
    };

    useEffect(() => {
        const t = setTimeout(checkScroll, 600);
        return () => clearTimeout(t);
    }, [displayEntries, showOlder]);

    // --- INTERACTION HANDLERS ---
    const clearCloseTimer = () => {
        if (closeTimerRef.current) { 
            clearTimeout(closeTimerRef.current); 
            closeTimerRef.current = null; 
        }
    };

    const handleMouseLeaveGroup = () => {
        if (showOlder) {
            closeTimerRef.current = window.setTimeout(() => {
                setShowOlder(false);
            }, 1000); 
        }
    };

    const handleMouseEnterGroup = () => {
        clearCloseTimer();
    };

    const handleClickGroup = () => {
        clearCloseTimer();
        setShowOlder(prev => !prev);
    };

    // --- RENDER ENTRY HELPER ---
    const renderEntry = (entry: any, idx: number) => {
        const isHovered = hoveredEntryId === entry.id;

        if (entry.isVirtualLeave) {
            const lType = entry.leaveType;
            let theme = { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/50', icon: Info };
            if (lType === 'Sick') theme = { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50', icon: FirstAid };
            if (lType === 'Vacation') theme = { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', icon: Smiley };
            if (lType === 'Personal') theme = { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/50', icon: User };

            return (
                <div key={entry.id} onMouseEnter={() => entry.id && setHoveredEntryId(entry.id)} onMouseLeave={() => setHoveredEntryId(null)} className={`mb-3 p-4 rounded-xl border ${theme.border} ${theme.bg} transition ${isHovered ? 'scale-[1.01] shadow-lg' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${theme.color.replace('text','bg').replace('500','500')} flex items-center justify-center text-white`}><theme.icon weight="fill" /></div>
                            <div><div className={`font-bold ${theme.color}`}>{lType} Leave</div><div className="text-xs opacity-70 font-mono">{entry.startTime} - {entry.endTime}</div></div>
                        </div>
                    </div>
                    <div className="pl-11 text-xs opacity-60 italic">Locked Entry • Contact HR for adjustments.</div>
                </div>
            );
        }

        const displayIndex = displayEntries.length - idx;

        return (
            <div key={entry.id} onMouseEnter={() => entry.id && setHoveredEntryId(entry.id)} onMouseLeave={() => setHoveredEntryId(null)} className={`mb-3 p-4 rounded-xl border group transition ${isHovered ? 'bg-indigo-500/10 border-indigo-500/50 scale-[1.01]' : 'bg-gray-500/5 border-gray-500/10 hover:border-indigo-500/30'}`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end w-8 shrink-0">
                            <span className="text-xs font-bold text-green-500 font-mono">{getHourMarker(entry.startTime)}</span>
                            <span className="text-xl font-bold opacity-20 leading-none">{displayIndex}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <input type="time" step="1" value={entry.startTime} onChange={(e) => onUpdate(entry.id, 'startTime', e.target.value)} className="bg-transparent font-bold text-sm w-20 focus:bg-white/10 rounded px-1 outline-none" />
                            <span className="opacity-50">-</span>
                            <input type="time" step="1" value={entry.endTime} onChange={(e) => onUpdate(entry.id, 'endTime', e.target.value)} className="bg-transparent font-bold text-sm w-20 focus:bg-white/10 rounded px-1 outline-none" />
                        </div>
                        {entry.isManual && <div title="Retroactive Entry"><Flag size={12} weight="fill" className="text-gray-400" /></div>}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="font-mono text-xs font-bold bg-gray-500/10 px-2 py-1 rounded">{entry.duration}</div>
                        <button onClick={() => onDelete(entry.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition"><Trash size={14} /></button>
                    </div>
                </div>
                <div className="pl-11 space-y-1">
                    {(entry.notes ? entry.notes.split('\n') : ['']).map((line: string, lIdx: number) => (
                        <input 
                            key={lIdx} 
                            value={line} 
                            onChange={(e) => onNoteUpdate(entry.id, lIdx, e.target.value)} 
                            placeholder="Add note..." 
                            className="w-full bg-transparent text-xs opacity-80 focus:opacity-100 focus:bg-white/5 rounded px-2 py-0.5 outline-none transition placeholder-gray-500 border-b border-dashed border-gray-500/20 focus:border-indigo-500" 
                        />
                    ))}
                    <button onClick={() => onAddNote(entry.id)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-500 flex items-center gap-1 opacity-50 hover:opacity-100 transition px-2 py-0.5"><Plus /> Add note</button>
                </div>
            </div>
        );
    };

    return (
        // UPDATED: h-full to take remaining vertical space in the parent flex column
        <div className="glass-card p-0 overflow-hidden flex flex-col h-full !shadow-none relative">
            {/* Header */}
            <div className="p-6 pb-2 shrink-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2">Entries for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</h3>
                    <div className="flex gap-2">
                        <button onClick={onShowTimeline} className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition flex items-center gap-1 font-bold"><ChartBar weight="bold" /> Timeline</button>
                        <button onClick={onManualAdd} disabled={isSelectedDateFuture} className={`text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-bold text-white ${isSelectedDateFuture ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'bg-indigo-500 hover:bg-indigo-600'}`}><Plus weight="bold" /> Retroactive</button>
                    </div>
                </div>
            </div>
            
            {/* Scrollable Content */}
            <div 
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="overflow-y-auto px-6 pb-6 relative custom-scrollbar space-y-2 flex-1"
            >
                {/* 1. SICK LEAVE ALERT */}
                {activeSick && (
                    <div className="text-center font-bold text-red-500 bg-red-500/10 p-2 rounded-lg mb-4 border border-red-500/20">
                        Sick Leave Active
                        {activeSick.reportedAt && selectedDateStr === activeSick.startDate && <span className="block text-xs font-normal opacity-70 mt-1">Since {activeSick.reportedAt}</span>}
                    </div>
                )}

                {/* 2. LIVE RECORDING BOX */}
                {isToday && isRunning && startTime && (
                    <div className="p-4 rounded-xl border border-orange-500/50 bg-orange-500/10 mb-4 animate-pulse relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                        <div className="flex justify-between items-start mb-2 pl-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0">
                                    <Clock size={16} weight="fill" />
                                </div>
                                <div>
                                    <div className="font-bold text-orange-500 flex items-center gap-2">
                                        Live Session
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                    </div>
                                    <div className="text-xs opacity-70 font-mono">
                                        {startTime.toLocaleTimeString('en-US', {hour12: false})} - ...
                                    </div>
                                </div>
                            </div>
                            <div className="font-mono text-sm font-bold bg-orange-500 text-white px-2 py-1 rounded shadow-lg">
                                {formatTime(seconds)}
                            </div>
                        </div>
                        <div className="pl-14 text-xs opacity-60 italic text-orange-400">
                            Recording in progress...
                        </div>
                    </div>
                )}

                {/* 3. RECENT ENTRIES */}
                {recentEntries.map((e, i) => renderEntry(e, i))}

                {/* 4. OLDER ENTRIES GROUP */}
                {shouldGroup && (
                    <div 
                        className="mt-4 border-t border-gray-200 dark:border-white/10 pt-2"
                        onMouseEnter={handleMouseEnterGroup}
                        onMouseLeave={handleMouseLeaveGroup}
                    >
                        <div 
                            onClick={handleClickGroup}
                            className={`
                                cursor-pointer rounded-xl p-3 flex items-center justify-between transition-all duration-300
                                ${showOlder ? 'bg-indigo-500/5 mb-2' : 'bg-gray-500/5 hover:bg-gray-500/10'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-400/20 flex items-center justify-center text-gray-500">
                                    <Stack weight="fill" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold opacity-70">{olderEntries.length} Previous Entries</div>
                                    <div className="text-[10px] opacity-50">
                                        {olderEntries[0].startTime.substring(0,5)} - {olderEntries[olderEntries.length-1].endTime.substring(0,5)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs opacity-50">
                                {showOlder ? <CaretUp weight="bold" /> : <CaretDown weight="bold" />}
                            </div>
                        </div>

                        {/* Collapsible Content */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showOlder ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="pl-4 border-l-2 border-dashed border-gray-200 dark:border-white/10 pt-2">
                                {olderEntries.map((e, i) => renderEntry(e, i + threshold))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. EMPTY STATE */}
                {displayEntries.length === 0 && !isRunning && (
                    <div className="text-center py-12 opacity-30 text-sm font-medium flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center">
                            <Clock size={24} weight="duotone" />
                        </div>
                        No entries recorded.
                    </div>
                )}
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-[#1e1b4b] to-transparent pointer-events-none opacity-80" />
            
            {/* Scroll Down Indicator Arrow */}
            {hasScrollBelow && (
                <div className="absolute bottom-2 left-6 z-20 animate-bounce text-indigo-500 dark:text-indigo-400 opacity-70 pointer-events-none">
                    <CaretDown weight="bold" size={20} />
                </div>
            )}
        </div>
    );
}