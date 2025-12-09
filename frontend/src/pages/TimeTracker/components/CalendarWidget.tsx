// frontend/src/pages/TimeTracker/components/CalendarWidget.tsx
import { useMemo } from 'react';
import { Check, Flag } from '@phosphor-icons/react';
import { TimeEntry } from '../../../types';
import { LeaveRequest } from '../types';
import { getLocalDateStr, getWeekNumber, getSecondsFromTime } from '../utils';

interface Props {
    selectedDate: Date;
    onDateSelect: (d: Date) => void;
    entries: TimeEntry[];
    leaveRequests: LeaveRequest[];
    currentClientId: string;
    isRunning: boolean;
}

export default function CalendarWidget({ selectedDate, onDateSelect, entries, leaveRequests, currentClientId, isRunning }: Props) {
    const selectedDateStr = getLocalDateStr(selectedDate);

    // --- CALENDAR GRID LOGIC ---
    const calendarData = useMemo(() => {
        const weeks = [];
        const TOTAL_ROWS = 6; 
        const TARGET_ROW_INDEX = 4; // Today will always be in the 5th row (index 4)

        // 1. Anchor the grid to TODAY, not the selected date.
        // This ensures the calendar doesn't jump when you click a different day.
        const anchorDate = new Date(); 
        
        // 2. Find the start of the week for TODAY
        const startOfAnchorWeek = new Date(anchorDate);
        startOfAnchorWeek.setDate(anchorDate.getDate() - anchorDate.getDay()); // Go back to Sunday
        startOfAnchorWeek.setHours(0, 0, 0, 0);

        // 3. Calculate the start date of the entire grid
        // We subtract (TARGET_ROW_INDEX * 7) days from the start of the current week
        const gridStartDate = new Date(startOfAnchorWeek);
        gridStartDate.setDate(startOfAnchorWeek.getDate() - (TARGET_ROW_INDEX * 7));

        // 4. Generate the grid
        const headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const gridCursor = new Date(gridStartDate);

        for (let w = 0; w < TOTAL_ROWS; w++) {
            const weekDays = [];
            for (let d = 0; d < 7; d++) {
                weekDays.push(new Date(gridCursor));
                gridCursor.setDate(gridCursor.getDate() + 1);
            }
            weeks.push({ days: weekDays, weekNum: getWeekNumber(weekDays[0]) });
        }
        return { weeks, headers };
    }, []); // Empty dependency array ensures grid is static relative to "Today"

    // --- DAY STATUS CHECKER ---
    const getDayStatus = (date: Date) => {
        const dateStr = getLocalDateStr(date);
        const todayStr = getLocalDateStr(new Date());
        const dayEntries = entries.filter(e => e.date === dateStr && e.clientId === currentClientId);
        
        const isActive = dateStr === todayStr && isRunning; 
        const hasEntries = dayEntries.length > 0;
        const hasManual = dayEntries.some(e => e.isManual);
        const hasDescription = dayEntries.some(e => e.notes && e.notes.trim().length > 0) && !hasManual; 
    
        const leaveDetails = leaveRequests.find(l => dateStr >= l.startDate && dateStr <= l.endDate);
        const leaveStatus = leaveDetails ? leaveDetails.status : 'none';
    
        let isCompleteDay = false;
        let isLiveComplete = false;
        if (hasEntries) {
            const startTimes = dayEntries.map(e => getSecondsFromTime(e.startTime));
            const endTimes = dayEntries.map(e => getSecondsFromTime(e.endTime));
            // Check if spread covers roughly 8 hours (simple logic)
            if ((Math.max(...endTimes) - Math.min(...startTimes)) >= 8 * 3600) { 
                isCompleteDay = true; 
                isLiveComplete = !dayEntries.every(e => e.isManual); 
            }
        }
        
        const isPast = dateStr < todayStr;
        const isFuture = dateStr > todayStr;
        const isToday = dateStr === todayStr;
        
        if (leaveStatus === 'Confirmed' && !isFuture) { isCompleteDay = true; isLiveComplete = true; }
        
        return { hasEntries, hasDescription, hasManual, isActive, isCompleteDay, isLiveComplete, isPast, isFuture, isToday, leaveStatus, leaveDetails };
    };

    return (
        <div className="glass-card p-6 overflow-hidden">
            <div className="flex flex-wrap justify-between items-end mb-4 gap-2">
                <div className="flex gap-2 items-center">
                    <div>
                        <h3 className="font-bold">Rolling Schedule</h3>
                        <p className="text-xs opacity-50 capitalize">
                            {/* Title still reflects the SELECTED date's month/year */}
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase font-bold opacity-60 justify-end">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 border-2 border-dashed border-orange-500"></div> Requested</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 border-2 border-green-500"></div> Confirmed</span>
                    <span className="flex items-center gap-1"><Check weight="bold" className="text-green-500" /> Confirmed</span>
                </div>
            </div>
            
            <div className="mb-2">
                {/* Headers */}
                <div className="grid grid-cols-8 gap-1 mb-2 border-b border-gray-500/10 pb-2">
                    <div className="text-center text-[10px] font-bold opacity-30">#</div>
                    {calendarData.headers.map((d,i) => <div key={i} className="text-center text-xs font-bold opacity-40">{d}</div>)}
                </div>
                
                {/* Weeks Grid */}
                <div className="space-y-1">
                    {calendarData.weeks.map((week, wIdx) => {
                        // Highlight Week Row if it contains Selected Date
                        const isSelectedWeek = week.days.some(d => getLocalDateStr(d) === selectedDateStr);

                        return (
                            <div 
                                key={wIdx} 
                                className={`grid grid-cols-8 gap-1 items-center p-1 rounded-xl transition-colors duration-300 ${isSelectedWeek ? 'bg-indigo-500/10 dark:bg-indigo-500/5' : ''}`}
                            >
                                {/* Week Number - Highlight White if Selected Week */}
                                <div className={`text-center text-[10px] font-mono font-bold transition-all duration-300 ${isSelectedWeek ? 'text-indigo-600 dark:text-white opacity-100 scale-110' : 'opacity-30'}`}>
                                    {week.weekNum}
                                </div>
                                
                                {week.days.map((date, dIdx) => {
                                    const status = getDayStatus(date);
                                    const isSelected = getLocalDateStr(date) === selectedDateStr;
                                    
                                    let groupingClasses = 'rounded-xl border-2 border-transparent'; 
                                    let bgClass = '';

                                    // Leave Grouping Logic
                                    if (status.leaveDetails) {
                                        const isSick = status.leaveDetails.type === 'Sick';
                                        let borderColor = 'border-orange-400';
                                        let borderStyle = 'border-dashed';

                                        if (isSick) { borderColor = 'border-red-500'; borderStyle = 'border-solid'; bgClass = 'bg-red-500/20'; } 
                                        else if (status.leaveStatus === 'Confirmed') { borderColor = 'border-green-500'; borderStyle = 'border-solid'; }

                                        const { startDate, endDate } = status.leaveDetails;
                                        const dStr = getLocalDateStr(date);
                                        const isStart = dStr === startDate;
                                        const isEnd = dStr === endDate;

                                        // Connect adjacent days visually
                                        if (isStart && !isEnd) { groupingClasses = `rounded-l-xl rounded-r-none border-r-0 border-2 ${borderStyle} ${borderColor}`; } 
                                        else if (!isStart && !isEnd) { groupingClasses = `rounded-none border-x-0 border-2 ${borderStyle} ${borderColor}`; } 
                                        else if (!isStart && isEnd) { groupingClasses = `rounded-r-xl rounded-l-none border-l-0 border-2 ${borderStyle} ${borderColor}`; } 
                                        else { groupingClasses = `rounded-xl border-2 ${borderStyle} ${borderColor}`; }
                                    }

                                    // Selected Ring (High Z-Index to sit on top of leave bars)
                                    if (isSelected) groupingClasses = `${groupingClasses} ring-2 ring-indigo-500 shadow-lg z-20`;

                                    return (
                                        <div 
                                            key={dIdx} 
                                            onClick={() => onDateSelect(date)}
                                            className={`
                                                group relative h-12 flex items-center justify-center text-sm font-semibold cursor-pointer transition overflow-visible 
                                                ${groupingClasses} 
                                                ${bgClass} 
                                                ${!isSelected && !status.leaveDetails && !bgClass ? 'hover:bg-gray-500/5' : ''} 
                                                ${status.isPast ? 'opacity-50' : 'opacity-100'} 
                                                ${status.isToday ? 'ring-1 ring-indigo-500/50' : ''}
                                            `}
                                        >
                                            <span className={`relative z-0 ${isSelected ? 'text-indigo-600 dark:text-white font-bold' : ''}`}>{date.getDate()}</span>
                                            
                                            {/* Status Dots (Top Left) */}
                                            <div className="absolute top-1 left-1 flex gap-0.5 z-10">
                                                {status.isActive && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>}
                                                {status.hasEntries && !status.isActive && !status.isCompleteDay && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                            </div>

                                            {/* Flags (Top Right) */}
                                            <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-10">
                                                {status.hasDescription && <Flag size={8} weight="fill" className="text-green-500" />}
                                                {status.hasManual && <Flag size={8} weight="fill" className="text-gray-400" />}
                                            </div>

                                            {/* Completed Checkmark (Center) */}
                                            {status.isCompleteDay && (
                                                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                                    <Check weight="bold" size={24} className={`${status.isLiveComplete ? 'text-green-500' : 'text-gray-400'} opacity-20`} />
                                                </div>
                                            )}

                                            {/* Tooltip */}
                                            {status.leaveDetails && (
                                                <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 w-max whitespace-nowrap">
                                                    <div className="font-bold">{status.leaveDetails.type}</div>
                                                    <div className="opacity-80">{status.leaveDetails.status}</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}