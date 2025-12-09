import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flag, Play, Stop, Clock, Trash, Plus, Check, ChartBar, X, Info, CalendarPlus, CaretLeft, CaretRight, Phone, EnvelopeSimple, FirstAid, Suitcase, User, Smiley, Sparkle, CalendarBlank, CaretDown, Clock as ClockIcon } from '@phosphor-icons/react';
import { TimeEntry } from '../types';

// -- Types --
interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  startTime?: string; // HH:MM:SS
  endTime?: string;   // HH:MM:SS
  type: 'Sick' | 'Vacation' | 'Personal';
  status: 'Requested' | 'Confirmed';
  notes: string;
  reportedAt?: string; 
  returnedAt?: string; 
}

// -- Helpers --
const getLocalDateStr = (date: Date) => date.toLocaleDateString('en-CA');
const generateTimeOptions = () => {
    const times = [];
    for(let h=0; h<24; h++) {
        for(let m=0; m<60; m+=15) {
            const hh = h.toString().padStart(2,'0');
            const mm = m.toString().padStart(2,'0');
            times.push(`${hh}:${mm}:00`);
        }
    }
    return times;
};
const TIME_OPTIONS = generateTimeOptions();

// -- Custom UI Components --

// 1. Custom Select Dropdown
const CustomSelect = ({ value, onChange, options, icon: Icon }: any) => {
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

// 2. Custom Time Picker
const CustomTimePicker = ({ value, onChange, disabled }: any) => {
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

    const displayValue = value ? value.substring(0, 5) : '--:--';

    return (
        <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-black/10 transition"
            >
                <div className="flex items-center gap-2">
                    <ClockIcon className="opacity-60" />
                    <span className="text-sm font-mono">{displayValue}</span>
                </div>
                <CaretDown className="opacity-50" size={12} />
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 h-48 overflow-y-auto bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 custom-scrollbar">
                    {TIME_OPTIONS.map(t => (
                        <div 
                            key={t}
                            onClick={() => { onChange(t); setIsOpen(false); }}
                            className={`px-4 py-2 text-xs font-mono cursor-pointer hover:bg-indigo-50 dark:hover:bg-white/5
                                ${value === t ? 'text-indigo-500 font-bold bg-indigo-50/50' : 'opacity-80'}`}
                        >
                            {t.substring(0,5)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 3. Custom Date Range Picker (Litepicker style)
const CustomDatePicker = ({ startDate, endDate, onStartChange, onEndChange, disabled }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(startDate)); // Controls calendar month view
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

    // Generate days for viewDate month
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const startDayOffset = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const empties = Array.from({length: startDayOffset}, (_, i) => i);

    const handleDateClick = (day: number) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dStr = getLocalDateStr(d);
        
        // Simple logic: if picking, update start first, or end if start is set? 
        // For simplicity in this demo: if start == end, set end. Else set start and reset end.
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
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth()-1)))} className="p-1 hover:bg-black/5 rounded"><CaretLeft /></button>
                        <span className="text-sm font-bold">{viewDate.toLocaleDateString(undefined, {month:'long', year:'numeric'})}</span>
                        <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth()+1)))} className="p-1 hover:bg-black/5 rounded"><CaretRight /></button>
                    </div>
                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-bold opacity-40 mb-2">{d}</div>)}
                        {empties.map(e => <div key={`empty-${e}`} />)}
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
}


export default function TimeTracker() {
  const { currentClientId } = useAuth();
  
  // -- State --
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0); 
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Live Notes State
  const [liveNoteInput, setLiveNoteInput] = useState('');
  const [sessionNotes, setSessionNotes] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  
  // Calendar State
  const [todayRef] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [showTimeline, setShowTimeline] = useState(false);
  const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
  
  // Leave Request State
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showLeavePopup, setShowLeavePopup] = useState(false);
  
  // Modals
  const [showSickPolicyModal, setShowSickPolicyModal] = useState(false);
  const [showEndSickModal, setShowEndSickModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  
  // Form State
  const [leaveForm, setLeaveForm] = useState({
    startDate: getLocalDateStr(new Date()),
    endDate: getLocalDateStr(new Date()),
    startTime: '09:00:00',
    endTime: '17:00:00',
    type: 'Vacation' as 'Sick' | 'Vacation' | 'Personal',
    notes: ''
  });

  // Mock Data
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  // -- Timer Logic --
  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // -- Helpers --
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getSecondsFromTime = (timeStr: string) => {
    try {
        const [h, m, s] = timeStr.split(':').map(Number);
        return h * 3600 + m * 60 + s;
    } catch { return 0; }
  };

  const calculateDuration = (startStr: string, endStr: string) => {
    try {
        const d1 = new Date(`2000-01-01T${startStr}`);
        const d2 = new Date(`2000-01-01T${endStr}`);
        let diff = (d2.getTime() - d1.getTime()) / 1000;
        if (diff < 0) diff += 24 * 3600; 
        return formatTime(diff);
    } catch (e) {
        return "--:--:--";
    }
  };

  const getHourMarker = (timeStr: string) => {
    try {
        const h = parseInt(timeStr.split(':')[0], 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}${ampm}`;
    } catch { return ""; }
  };

  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

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

  // -- Overlap & Time Logic --
  const adjustEntryForSickLeave = (dateStr: string, start: string, end: string): { allowed: boolean, start: string, end: string, reason?: string } => {
    const sick = leaveRequests.find(l => l.type === 'Sick' && dateStr >= l.startDate && dateStr <= l.endDate && l.status === 'Confirmed');
    if (!sick) return { allowed: true, start, end };

    let sickStart = "00:00:00";
    let sickEnd = "23:59:59";

    if (dateStr === sick.startDate && sick.reportedAt) sickStart = sick.reportedAt;
    if (dateStr === sick.endDate && sick.returnedAt) sickEnd = sick.returnedAt;

    const entStartSec = getSecondsFromTime(start);
    const entEndSec = getSecondsFromTime(end);
    const sickStartSec = getSecondsFromTime(sickStart);
    const sickEndSec = getSecondsFromTime(sickEnd);

    const overlaps = (entStartSec < sickEndSec) && (entEndSec > sickStartSec);

    if (overlaps) {
        if (entStartSec >= sickStartSec && entEndSec <= sickEndSec) {
            return { allowed: false, start, end, reason: "Entry falls within active sick leave." };
        }
        if (entStartSec < sickStartSec && entEndSec > sickStartSec) {
            return { allowed: true, start, end: sickStart, reason: "Entry end time adjusted to Sick Start." };
        }
        if (entStartSec < sickEndSec && entEndSec > sickEndSec) {
            return { allowed: true, start: sickEnd, end, reason: "Entry start time adjusted to Sick End." };
        }
    }
    return { allowed: true, start, end };
  };

  const stopTimer = () => {
      const now = new Date();
      const finalNotes = liveNoteInput.trim() ? [...sessionNotes, liveNoteInput.trim()] : sessionNotes;
      const endStr = now.toLocaleTimeString('en-US', { hour12: false });
      const startStr = startTime?.toLocaleTimeString('en-US', { hour12: false }) || endStr;
      
      const newEntry: TimeEntry = {
        clientId: currentClientId,
        id: Math.random().toString(36).substr(2, 9),
        date: getLocalDateStr(now),
        startTime: startStr,
        endTime: endStr,
        duration: formatTime(seconds),
        notes: finalNotes.join('\n'), 
        isManual: false 
      };
      setEntries(prev => [newEntry, ...prev]);
      setIsRunning(false);
      setSeconds(0);
      setStartTime(null);
      setLiveNoteInput('');
      setSessionNotes([]);
  };

  const handleToggleTimer = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const sel = new Date(selectedDate);
    sel.setHours(0,0,0,0);
    if (sel > today && !isRunning) return alert("Cannot start live tracker for a future date.");

    const activeSickLeave = leaveRequests.find(l => l.type === 'Sick' && l.status === 'Confirmed' && !l.returnedAt);
    if (activeSickLeave) {
        setShowEndSickModal(true);
        return;
    }

    if (isRunning) {
      stopTimer();
    } else {
      const now = new Date();
      setStartTime(now);
      setIsRunning(true);
      setSelectedDate(now);
      setSessionNotes([]);
    }
  };

  const deactivateSickLeave = () => {
    const todayStr = getLocalDateStr(new Date());
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLeaveRequests(prev => prev.map(l => {
        if (l.type === 'Sick' && !l.returnedAt) return { ...l, endDate: todayStr, returnedAt: nowTime };
        return l;
    }));
    setShowEndSickModal(false);
    setShowAiSummary(true);
  };

  const handleManualAdd = () => {
    const dateStr = getLocalDateStr(selectedDate);
    const valid = adjustEntryForSickLeave(dateStr, "09:00:00", "10:00:00");
    if (!valid.allowed) return alert(valid.reason);

    const newEntry: TimeEntry = {
        clientId: currentClientId,
        id: Math.random().toString(36).substr(2, 9),
        date: dateStr,
        startTime: valid.start,
        endTime: valid.end,
        duration: calculateDuration(valid.start, valid.end),
        notes: "", 
        isManual: true
    };
    setEntries([newEntry, ...entries]);
  };

  const updateEntryTime = (id: string | undefined, field: 'startTime' | 'endTime', value: string) => {
    if (!id || id.startsWith('leave-')) return;
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    const tentativeStart = field === 'startTime' ? value : entry.startTime;
    const tentativeEnd = field === 'endTime' ? value : entry.endTime;
    const valid = adjustEntryForSickLeave(entry.date, tentativeStart, tentativeEnd);
    if (!valid.allowed) return alert(valid.reason);
    
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: (field==='startTime'?valid.start:valid.end), duration: calculateDuration(valid.start, valid.end), isManual: true } : e));
  };

  const updateEntryNoteLine = (id: string | undefined, lineIndex: number, newValue: string) => {
    if (!id || id.startsWith('leave-')) return;
    setEntries(prev => prev.map(e => {
        if (e.id === id) {
            const lines = e.notes ? e.notes.split('\n') : [];
            lines[lineIndex] = newValue;
            return { ...e, notes: lines.join('\n'), isManual: true };
        }
        return e;
    }));
  };

  const deleteEntry = (id: string | undefined) => {
    if(!id || id.startsWith('leave-')) return;
    if(!window.confirm("Delete this time entry?")) return;
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  // -- Leave Form Handlers --
  const submitLeaveRequest = () => {
    if (isRunning && leaveForm.type === 'Sick') stopTimer();

    const newReq: LeaveRequest = {
        id: Math.random().toString(36).substr(2, 9),
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        startTime: leaveForm.startTime,
        endTime: leaveForm.endTime,
        type: leaveForm.type,
        status: 'Requested',
        notes: leaveForm.notes
    };

    if (leaveForm.type === 'Sick') {
        newReq.status = 'Confirmed'; 
        newReq.reportedAt = new Date().toLocaleTimeString('en-US', {hour12: false});
        setShowSickPolicyModal(true);
    } else {
        // @ts-ignore
        if (window.confirmMockAdmin) newReq.status = 'Confirmed';
        if (leaveForm.type === 'Vacation') setShowVacationModal(true);
        if (leaveForm.type === 'Personal') setShowPersonalModal(true);
    }

    setLeaveRequests(prev => [...prev, newReq]);
    setShowLeavePopup(false);
    setSelectedDate(new Date(leaveForm.startDate));
  };

  const deleteLeaveRequest = (id: string) => {
    if(window.confirm("Are you sure you want to cancel this leave request?")) {
        setLeaveRequests(prev => prev.filter(l => l.id !== id));
    }
  };

  // -- Display Merged Entries (Real + Virtual Leave Cards) --
  const displayEntries = useMemo(() => {
    const combined = [...entries];
    const dateStr = getLocalDateStr(selectedDate);
    
    // Find all leaves for this day
    const activeLeaves = leaveRequests.filter(l => dateStr >= l.startDate && dateStr <= l.endDate);
    
    activeLeaves.forEach(leave => {
        let sStart = "00:00:00";
        let sEnd = "23:59:59";
        
        // Sick Logic
        if (leave.type === 'Sick') {
            if (dateStr === leave.startDate && leave.reportedAt) sStart = leave.reportedAt;
            if (dateStr === leave.endDate && leave.returnedAt) sEnd = leave.returnedAt;
        } 
        // Vacation/Personal Logic (respects time range if set)
        else {
            if (dateStr === leave.startDate && leave.startTime) sStart = leave.startTime;
            if (dateStr === leave.endDate && leave.endTime) sEnd = leave.endTime;
            // If middle day, it remains 00:00 - 23:59
        }
        
        const dur = calculateDuration(sStart, sEnd);

        combined.push({
            id: `leave-${leave.id}`,
            clientId: currentClientId,
            date: dateStr,
            startTime: sStart,
            endTime: sEnd,
            duration: dur,
            notes: `${leave.type} Leave • ${leave.status}`,
            isManual: false,
            // @ts-ignore
            isVirtualLeave: true,
            leaveType: leave.type,
            leaveStatus: leave.status
        });
    });
    return combined;
  }, [entries, leaveRequests, selectedDate, currentClientId]);

  // -- Derived Data --
  const upcomingLeaves = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateStr(tomorrow);
    const limit = new Date();
    limit.setMonth(limit.getMonth() + 6);
    const limitStr = getLocalDateStr(limit);
    return leaveRequests.filter(req => req.startDate >= tomorrowStr && req.startDate <= limitStr).sort((a,b) => a.startDate.localeCompare(b.startDate));
  }, [leaveRequests]);

  const calendarData = useMemo(() => {
    const weeks = [];
    const today = new Date(todayRef);
    today.setHours(0,0,0,0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 28);
    const headers = [];
    const d = new Date(startDate);
    for(let i=0; i<7; i++) { headers.push(d.toLocaleDateString('en-US', { weekday: 'narrow' })); d.setDate(d.getDate() + 1); }
    const gridCursor = new Date(startDate);
    for (let w = 0; w < 6; w++) {
        const weekDays = [];
        for (let d = 0; d < 7; d++) { weekDays.push(new Date(gridCursor)); gridCursor.setDate(gridCursor.getDate() + 1); }
        weeks.push({ days: weekDays, weekNum: getWeekNumber(weekDays[0]) });
    }
    return { weeks, headers };
  }, [todayRef]);

  const getDayStatus = (date: Date) => {
    const dateStr = getLocalDateStr(date);
    const todayStr = getLocalDateStr(new Date());
    const dayEntries = entries.filter(e => e.date === dateStr && e.clientId === currentClientId);
    
    const isActive = dateStr === todayStr && isRunning; 
    const hasEntries = dayEntries.length > 0;
    const hasManual = dayEntries.some(e => e.isManual);
    const hasDescription = dayEntries.some(e => e.notes && e.notes.trim().length > 0) && !hasManual; 

    // Find if date is in any leave request
    const leaveDetails = leaveRequests.find(l => dateStr >= l.startDate && dateStr <= l.endDate);
    const leaveStatus = leaveDetails ? leaveDetails.status : 'none';

    let isCompleteDay = false;
    let isLiveComplete = false;
    if (hasEntries) {
        const startTimes = dayEntries.map(e => getSecondsFromTime(e.startTime));
        const endTimes = dayEntries.map(e => getSecondsFromTime(e.endTime));
        if ((Math.max(...endTimes) - Math.min(...startTimes)) >= 8 * 3600) { isCompleteDay = true; isLiveComplete = !dayEntries.every(e => e.isManual); }
    }
    const isPast = dateStr < todayStr;
    const isFuture = dateStr > todayStr;
    const isToday = dateStr === todayStr;
    if (leaveStatus === 'Confirmed' && !isFuture) { isCompleteDay = true; isLiveComplete = true; }
    
    // Add flags for UI grouping
    let leaveContext = null;
    if (leaveDetails) {
        leaveContext = {
            ...leaveDetails,
            isStart: dateStr === leaveDetails.startDate,
            isEnd: dateStr === leaveDetails.endDate
        };
    }

    return { hasEntries, hasDescription, hasManual, isActive, isCompleteDay, isLiveComplete, isPast, isFuture, isToday, leaveStatus, leaveDetails: leaveContext };
  };

  const selectedDateStr = getLocalDateStr(selectedDate);
  const selectedDayEntries = displayEntries.filter(e => e.date === selectedDateStr && e.clientId === currentClientId);
  const isSelectedDateFuture = selectedDateStr > getLocalDateStr(new Date());
  const selectedDateStatus = getDayStatus(selectedDate);
  const activeSickLeave = leaveRequests.find(l => l.type === 'Sick' && !l.returnedAt);
  const isSickLeaveActive = !!activeSickLeave;

    const addLiveNote = () => {
        if (liveNoteInput.trim()) {
            setSessionNotes(prev => [...prev, liveNoteInput.trim()]);
            setLiveNoteInput('');
        }
    };

  return (
    <div className="p-8 animate-fade-in text-[var(--text-main)] relative">
      <header className="mb-6"><h1 className="text-2xl font-bold font-['Montserrat']">Time & Monitoring</h1></header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
            {/* Calendar */}
            <div className="glass-card p-6">
                <div className="flex flex-wrap justify-between items-end mb-4 gap-2">
                    <div className="flex gap-2 items-center">
                        <div>
                            <h3 className="font-bold">Rolling Schedule</h3>
                            <p className="text-xs opacity-50 capitalize">
                                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase font-bold opacity-60 justify-end">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 border-2 border-dashed border-orange-500"></div> Requested</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 border-2 border-green-500"></div> Confirmed</span>
                        <span className="flex items-center gap-1"><Check weight="bold" className="text-green-500" /> &gt;8h/Confirmed</span>
                        <span className="flex items-center gap-1"><Check weight="bold" className="text-gray-400" /> Retro</span>
                    </div>
                </div>
                
                <div className="mb-2">
                    <div className="grid grid-cols-8 gap-1 mb-2 border-b border-gray-500/10 pb-2">
                        <div className="text-center text-[10px] font-bold opacity-30">#</div>
                        {calendarData.headers.map((d,i) => <div key={i} className="text-center text-xs font-bold opacity-40">{d}</div>)}
                    </div>
                    
                    <div className="space-y-1">
                        {calendarData.weeks.map((week, wIdx) => {
                            const isSelectedWeek = week.days.some(d => getLocalDateStr(d) === selectedDateStr);
                            return (
                                <div key={wIdx} className={`grid grid-cols-8 gap-1 items-center p-1 rounded-xl transition ${isSelectedWeek ? 'bg-gray-500/5' : ''}`}>
                                    <div className="text-center text-[10px] font-mono opacity-30 font-bold">{week.weekNum}</div>
                                    {week.days.map((date, dIdx) => {
                                        const status = getDayStatus(date);
                                        const isSelected = getLocalDateStr(date) === selectedDateStr;
                                        
                                        let groupingClasses = 'rounded-xl border-2 border-transparent'; 
                                        let bgClass = '';

                                        if (status.leaveDetails) {
                                            const isSick = status.leaveDetails.type === 'Sick';
                                            let borderColor = 'border-orange-400';
                                            let borderStyle = 'border-dashed';

                                            if (isSick) { borderColor = 'border-red-500'; borderStyle = 'border-solid'; bgClass = 'bg-red-500/20'; } 
                                            else if (status.leaveStatus === 'Confirmed') { borderColor = 'border-green-500'; borderStyle = 'border-solid'; }

                                            const { isStart, isEnd } = status.leaveDetails;
                                            if (isStart && !isEnd) { groupingClasses = `rounded-l-xl rounded-r-none border-r-0 border-2 ${borderStyle} ${borderColor}`; } 
                                            else if (!isStart && !isEnd) { groupingClasses = `rounded-none border-x-0 border-2 ${borderStyle} ${borderColor}`; } 
                                            else if (!isStart && isEnd) { groupingClasses = `rounded-r-xl rounded-l-none border-l-0 border-2 ${borderStyle} ${borderColor}`; } 
                                            else { groupingClasses = `rounded-xl border-2 ${borderStyle} ${borderColor}`; }
                                        }

                                        if (isSelected) groupingClasses = `${groupingClasses} ring-2 ring-indigo-500 shadow-lg z-10`;

                                        return (
                                            <div 
                                                key={dIdx} 
                                                onClick={() => setSelectedDate(date)}
                                                className={`group relative h-12 flex items-center justify-center text-sm font-semibold cursor-pointer transition overflow-visible ${groupingClasses} ${bgClass} ${isSelected && !status.leaveDetails ? 'bg-indigo-500/10' : ''} ${!isSelected && !status.leaveDetails && !bgClass ? 'hover:bg-gray-500/5' : ''} ${status.isPast ? 'opacity-50' : 'opacity-100'} ${status.isToday ? 'ring-1 ring-indigo-500/50' : ''}`}
                                            >
                                                <span className={`relative z-0`}>{date.getDate()}</span>
                                                <div className="absolute top-1 left-1 flex gap-0.5 z-10">
                                                    {status.isActive && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>}
                                                    {status.hasEntries && !status.isActive && !status.isCompleteDay && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                                </div>
                                                <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-10">
                                                    {status.hasDescription && <Flag size={8} weight="fill" className="text-green-500" />}
                                                    {status.hasManual && <Flag size={8} weight="fill" className="text-gray-400" />}
                                                </div>
                                                {status.isCompleteDay && <div className="absolute inset-0 flex items-center justify-center z-20"><Check weight="bold" size={24} className={`${status.isLiveComplete ? 'text-green-500' : 'text-gray-400'} opacity-90 drop-shadow-md`} /></div>}
                                                {status.leaveDetails && <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 w-max whitespace-nowrap"><div className="font-bold">{status.leaveDetails.type}</div><div className="opacity-80">{status.leaveDetails.status}</div></div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Entry List */}
            <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2">Entries for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setShowTimeline(true)} className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition flex items-center gap-1 font-bold"><ChartBar weight="bold" /> Timeline</button>
                        <button onClick={handleManualAdd} disabled={isSelectedDateFuture} className={`text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-bold text-white ${isSelectedDateFuture ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'bg-indigo-500 hover:bg-indigo-600'}`}><Plus weight="bold" /> Retroactive</button>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {selectedDateStatus.leaveDetails?.type === 'Sick' && (
                        <div className="text-center font-bold text-red-500 bg-red-500/10 p-2 rounded-lg mb-2 border border-red-500/20">
                            Sick Leave Active
                            {selectedDateStatus.leaveDetails.reportedAt && <span className="block text-xs font-normal opacity-70 mt-1">Since {selectedDateStatus.leaveDetails.reportedAt}</span>}
                        </div>
                    )}

                    {selectedDayEntries.length === 0 && !selectedDateStatus.isToday && (
                        <div className="text-center py-8 opacity-40 text-sm font-medium">
                            {selectedDateStatus.leaveStatus === 'Confirmed' ? `On Leave: ${selectedDateStatus.leaveDetails!.type}` : selectedDateStatus.leaveStatus === 'Requested' ? `Leave Requested: ${selectedDateStatus.leaveDetails!.type}` : "No entries recorded for this day."}
                        </div>
                    )}
                    
                    {selectedDayEntries.sort((a,b) => a.startTime.localeCompare(b.startTime)).map((entry, idx) => {
                        // @ts-ignore
                        const isVirtual = entry.isVirtualLeave;
                        // @ts-ignore
                        const lType = entry.leaveType;
                        
                        const isHovered = hoveredEntryId === entry.id;

                        if (isVirtual) {
                            let theme = { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/50', icon: Info };
                            if (lType === 'Sick') theme = { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50', icon: FirstAid };
                            if (lType === 'Vacation') theme = { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', icon: Smiley };
                            if (lType === 'Personal') theme = { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/50', icon: User };

                            return (
                                <div key={entry.id} onMouseEnter={() => entry.id && setHoveredEntryId(entry.id)} onMouseLeave={() => setHoveredEntryId(null)} className={`p-4 rounded-xl border ${theme.border} ${theme.bg} transition ${isHovered ? 'scale-[1.01] shadow-lg' : ''}`}>
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

                        // Normal Entry
                        return (
                            <div key={entry.id} onMouseEnter={() => entry.id && setHoveredEntryId(entry.id)} onMouseLeave={() => setHoveredEntryId(null)} className={`p-4 rounded-xl border group transition ${isHovered ? 'bg-indigo-500/10 border-indigo-500/50 scale-[1.01]' : 'bg-gray-500/5 border-gray-500/10 hover:border-indigo-500/30'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end w-8 shrink-0"><span className="text-xs font-bold text-green-500 font-mono">{getHourMarker(entry.startTime)}</span><span className="text-lg font-bold opacity-20 leading-none">{idx + 1}</span></div>
                                        <div className="flex items-center gap-1">
                                            <input type="time" step="1" value={entry.startTime} onChange={(e) => updateEntryTime(entry.id, 'startTime', e.target.value)} className="bg-transparent font-bold text-sm w-20 focus:bg-white/10 rounded px-1 outline-none" />
                                            <span className="opacity-50">-</span>
                                            <input type="time" step="1" value={entry.endTime} onChange={(e) => updateEntryTime(entry.id, 'endTime', e.target.value)} className="bg-transparent font-bold text-sm w-20 focus:bg-white/10 rounded px-1 outline-none" />
                                        </div>
                                        {entry.isManual && <div title="Retroactive Entry"><Flag size={12} weight="fill" className="text-gray-400" /></div>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="font-mono text-xs font-bold bg-gray-500/10 px-2 py-1 rounded">{entry.duration}</div>
                                        <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition"><Trash size={14} /></button>
                                    </div>
                                </div>
                                <div className="pl-11 space-y-2">
                                    {(entry.notes ? entry.notes.split('\n') : ['']).map((line, lIdx) => (
                                        <input key={lIdx} value={line} onChange={(e) => updateEntryNoteLine(entry.id, lIdx, e.target.value)} placeholder="Add note..." className="w-full bg-transparent text-xs opacity-80 focus:opacity-100 focus:bg-white/5 rounded px-2 py-1 outline-none transition placeholder-gray-500 border-b border-dashed border-gray-500/20 focus:border-indigo-500" />
                                    ))}
                                    <button onClick={() => { const newNotes = entry.notes ? entry.notes + "\n" : " "; setEntries(prev => prev.map(e => e.id === entry.id ? { ...entry, notes: newNotes, isManual: true } : e)); }} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-500 flex items-center gap-1 opacity-50 hover:opacity-100 transition px-2"><Plus /> Add note</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 lg:col-span-1 sticky top-6">
            <div className="glass-card p-4 flex flex-col justify-between h-28">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2"><Clock size={20} weight="duotone" /></div>
                <div><div className="text-xs uppercase font-bold opacity-60">Weekly</div><div className="text-xl font-bold">{getWeeklyTotal()}</div></div>
            </div>

            <div className="glass-card p-4 flex flex-col justify-between h-28">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2"><CalendarPlus size={20} weight="duotone" /></div>
                <div><div className="text-xs uppercase font-bold opacity-60 mb-1">Time Off</div><button onClick={() => setShowLeavePopup(true)} className="text-xs font-bold bg-indigo-500 text-white px-3 py-1.5 rounded-lg w-full hover:bg-indigo-600 transition">Request</button></div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col min-h-[350px] justify-center items-center group">
                <div className="absolute top-4 right-4 z-20">
                    <button onClick={() => setShowInfo(!showInfo)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"><Info weight="bold" /></button>
                    {showInfo && <div className="absolute top-10 right-0 w-64 bg-slate-800 text-xs p-4 rounded-xl shadow-2xl border border-white/10 z-30 animate-fade-in"><h4 className="font-bold mb-2 text-white">Legend</h4><ul className="space-y-2 text-white/80"><li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Live Tracking</li><li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Entry (&lt;8h)</li><li className="flex items-center gap-2"><div className="w-2 h-2 border border-dashed border-orange-500"></div> Requested Leave</li><li className="flex items-center gap-2"><div className="w-2 h-2 border border-green-500"></div> Confirmed Leave</li><li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> &gt;8h/Confirmed</li><li className="flex items-center gap-2"><Check weight="bold" className="text-gray-400" /> Retroactive</li><li className="flex items-center gap-2"><Flag weight="fill" className="text-green-500" /> Description</li><li className="flex items-center gap-2"><Flag weight="fill" className="text-gray-400" /> Retroactive</li></ul></div>}
                </div>
                <div className="w-full max-w-[280px] flex flex-col gap-6">
                    <h3 className="font-bold opacity-80 flex items-center justify-center gap-3 w-full">{isRunning && <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>}Live Tracker</h3>
                    <div className="text-center"><div className="text-5xl font-bold font-mono tracking-wider mb-1">{formatTime(seconds)}</div>{sessionNotes.length > 0 && <div className="text-xs opacity-50 font-mono mb-2">{sessionNotes.length} notes added</div>}<div className="text-sm opacity-60">{isRunning ? 'Tracking Time' : (isSickLeaveActive ? 'Out Sick' : 'Ready')}</div></div>
                    <div className="flex gap-2 w-full"><input disabled={!isRunning} value={liveNoteInput} onChange={(e) => setLiveNoteInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addLiveNote(); }} placeholder={isRunning ? "Add note to session..." : "Start timer..."} className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm placeholder-white/40 focus:outline-none focus:bg-white/20 transition" />{isRunning && <button onClick={addLiveNote} className="px-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition text-white"><Plus weight="bold" size={20} /></button>}</div>
                    <button onClick={handleToggleTimer} disabled={isSelectedDateFuture && !isRunning} className={`w-full py-4 rounded-xl text-sm font-bold border transition backdrop-blur flex items-center justify-center gap-2 ${isSickLeaveActive ? 'bg-orange-500/20 text-orange-100 border-orange-500/30 hover:bg-orange-500/30' : isSelectedDateFuture && !isRunning ? 'opacity-50 cursor-not-allowed bg-gray-500/20 text-gray-400 border-gray-500/30' : isRunning ? 'bg-red-500/20 text-red-100 border-red-500/30 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30 hover:bg-emerald-500/30'}`}>{isSickLeaveActive ? "I'm Back" : (isRunning ? <><Stop weight="fill" /> Stop & Save</> : <><Play weight="fill" /> Clock In</>)}</button>
                </div>
            </div>

            <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-1"><h3 className="text-xs uppercase font-bold opacity-60 flex items-center gap-2"><CalendarPlus size={16} weight="fill" className="text-indigo-500" />Upcoming Time Off</h3></div>
                <div className="text-[10px] opacity-40 italic mb-3 ml-6">(next 6 months)</div>
                {upcomingLeaves.length === 0 ? <div className="text-xs opacity-40 italic">No upcoming leave scheduled.</div> : <ul className="space-y-3">{upcomingLeaves.map(leave => <li key={leave.id} className="flex gap-3 items-start text-xs group"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div><div className="flex-1"><div className="font-bold opacity-80">{new Date(leave.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}{leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}`}</div><div className="opacity-60">{leave.type} • {leave.status}</div></div>{leave.status === 'Requested' && <button onClick={() => deleteLeaveRequest(leave.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition"><Trash size={14} /></button>}</li>)}</ul>}
            </div>
        </div>
      </div>

      {/* TIMELINE MODAL */}
      {showTimeline && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowTimeline(false)}>
            <div className="bg-white dark:bg-[#1e1b4b] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] mt-[-10vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-white dark:bg-[#1e1b4b] border-b border-gray-100 dark:border-white/10 shrink-0 z-20">
                    <div className="p-4 flex justify-between items-center">
                        <h2 className="text-lg font-bold font-['Montserrat']">Timeline: {selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</h2>
                        <button onClick={() => setShowTimeline(false)} className="hover:text-red-500 transition"><X size={20} /></button>
                    </div>
                    <div className="px-6 pb-4">
                        <div className="flex justify-between text-[10px] opacity-50 uppercase font-bold mb-1"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
                        <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full relative overflow-hidden flex">
                            {selectedDayEntries.map((e, idx) => {
                                // @ts-ignore
                                if (e.isVirtualLeave) return null; // Standard bars first
                                const leftPct = (getSecondsFromTime(e.startTime) / 86400) * 100;
                                const widthPct = ((getSecondsFromTime(e.endTime) - getSecondsFromTime(e.startTime)) / 86400) * 100;
                                const isHovered = hoveredEntryId === e.id;
                                return <div key={idx} onMouseEnter={() => e.id && setHoveredEntryId(e.id)} onMouseLeave={() => setHoveredEntryId(null)} className={`absolute h-full border-r-2 border-white/30 transition-colors duration-200 cursor-pointer ${isHovered ? 'bg-indigo-400' : 'bg-indigo-600'}`} style={{ left: `${leftPct}%`, width: `${widthPct}%` }} title={`${e.startTime} - ${e.endTime}`} />;
                            })}
                            
                            {/* Render All Leave Bars */}
                            {selectedDayEntries.filter(e => e.id && e.id.startsWith('leave-')).map(e => {
                                // @ts-ignore
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
                        {selectedDayEntries.sort((a,b) => a.startTime.localeCompare(b.startTime)).map((e, idx) => {
                             const isHovered = hoveredEntryId === e.id;
                             // @ts-ignore
                             if (e.isVirtualLeave) {
                                // @ts-ignore
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
                                        <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><span className="font-bold text-sm text-indigo-500">{e.startTime} - {e.endTime}</span><span className="text-[10px] font-bold opacity-40">#{idx + 1}</span></div><span className="text-xs font-mono opacity-60 bg-white/10 px-2 py-0.5 rounded">{e.duration}</span></div>
                                        <div className="text-xs opacity-80 whitespace-pre-wrap">{e.notes || "No notes provided."}</div>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODALS */}
      {showSickPolicyModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"><div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10"><div className="flex items-center gap-3 mb-4 text-red-500"><div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center"><FirstAid weight="fill" size={24} /></div><h2 className="text-xl font-bold font-['Montserrat']">Sick Leave Active</h2></div><p className="text-sm opacity-80 mb-6">Your sick leave has been logged. Please follow company policy.</p><button onClick={() => setShowSickPolicyModal(false)} className="w-full py-3 rounded-xl bg-gray-200 dark:bg-white/10 font-bold hover:bg-gray-300 dark:hover:bg-white/20 transition">Understood</button></div></div>}
      {showVacationModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"><div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10"><div className="flex items-center gap-3 mb-4 text-emerald-500"><div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><Smiley weight="fill" size={24} /></div><h2 className="text-xl font-bold font-['Montserrat']">Vacation Request Sent!</h2></div><p className="text-sm opacity-80 mb-6">Enjoy your time off! Recharge and relax. We've notified your manager.</p><button onClick={() => setShowVacationModal(false)} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition">Awesome</button></div></div>}
      {showPersonalModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"><div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10"><div className="flex items-center gap-3 mb-4 text-indigo-500"><div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center"><User weight="fill" size={24} /></div><h2 className="text-xl font-bold font-['Montserrat']">Personal Leave Logged</h2></div><p className="text-sm opacity-80 mb-6">Your personal leave request has been submitted for approval.</p><button onClick={() => setShowPersonalModal(false)} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition">Close</button></div></div>}
      {showEndSickModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"><div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10"><div className="flex items-center gap-3 mb-4 text-emerald-500"><div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><Check weight="bold" size={24} /></div><h2 className="text-xl font-bold font-['Montserrat']">Return to Work?</h2></div><p className="text-sm opacity-80 mb-6">Confirming this will mark your return from Sick Leave as of now. You will be able to clock in immediately.</p><div className="flex gap-3 mt-4"><button onClick={() => setShowEndSickModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-black/5">Cancel</button><button onClick={deactivateSickLeave} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/30">Confirm Return</button></div></div></div>}
      {showAiSummary && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in"><div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10 relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div><div className="flex items-center gap-3 mb-4 text-indigo-500"><div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center animate-pulse"><Sparkle weight="fill" size={24} /></div><h2 className="text-xl font-bold font-['Montserrat']">Welcome Back!</h2></div><p className="text-sm opacity-80 mb-6">Here is an AI-generated summary of what you missed while you were away:</p><div className="space-y-3 mb-6"><div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div><div className="text-sm opacity-70"><span className="font-bold block text-gray-900 dark:text-gray-100">3 Team Meetings</span>Notes are available in the #general channel.</div></div><div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div><div className="text-sm opacity-70"><span className="font-bold block text-gray-900 dark:text-gray-100">Project Alpha Update</span>Client feedback was positive. New tasks assigned.</div></div><div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></div><div className="text-sm opacity-70"><span className="font-bold block text-gray-900 dark:text-gray-100">12 New Emails</span>Priority: High (2) from HR regarding benefits.</div></div></div><button onClick={() => setShowAiSummary(false)} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">Thanks, I'm caught up</button></div></div>}

      {/* Main Leave Request Modal - Refined & Bigger */}
      {showLeavePopup && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white dark:bg-[#1e293b] w-full max-w-xl rounded-2xl shadow-2xl p-8 border border-white/10">
                 <h2 className="text-2xl font-bold font-['Montserrat'] mb-6">Request Time Off</h2>
                 <div className="space-y-6">
                     {/* Type Selector */}
                     <div>
                         <label className="block text-xs font-bold uppercase opacity-60 mb-2">Leave Type</label>
                         <CustomSelect 
                            value={leaveForm.type} 
                            onChange={(val: any) => setLeaveForm(prev => ({ ...prev, type: val }))}
                            options={[
                                { value: 'Vacation', label: 'Vacation', icon: Smiley },
                                { value: 'Sick', label: 'Sick Leave', icon: FirstAid },
                                { value: 'Personal', label: 'Personal Leave', icon: User }
                            ]}
                            icon={Suitcase}
                         />
                     </div>

                     {/* Date & Time Grid */}
                     <div className="grid grid-cols-2 gap-6">
                         {/* FROM Column */}
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-xs font-bold uppercase opacity-60 mb-2">From Date</label>
                                 <CustomDatePicker 
                                    startDate={leaveForm.startDate} 
                                    endDate={leaveForm.endDate} 
                                    onStartChange={(d: string) => setLeaveForm(prev => ({...prev, startDate: d}))} 
                                    onEndChange={(d: string) => setLeaveForm(prev => ({...prev, endDate: d}))}
                                    disabled={leaveForm.type === 'Sick'}
                                 />
                             </div>
                             {leaveForm.type !== 'Sick' && (
                                 <div>
                                     <label className="block text-xs font-bold uppercase opacity-60 mb-2">From Time</label>
                                     <CustomTimePicker 
                                        value={leaveForm.startTime} 
                                        onChange={(t: string) => setLeaveForm(prev => ({...prev, startTime: t}))} 
                                     />
                                 </div>
                             )}
                         </div>

                         {/* TO Column */}
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-xs font-bold uppercase opacity-60 mb-2">To Date</label>
                                 <CustomDatePicker 
                                    startDate={leaveForm.startDate} 
                                    endDate={leaveForm.endDate} 
                                    onStartChange={(d: string) => setLeaveForm(prev => ({...prev, startDate: d}))} 
                                    onEndChange={(d: string) => setLeaveForm(prev => ({...prev, endDate: d}))}
                                    disabled={leaveForm.type === 'Sick'}
                                 />
                             </div>
                             {leaveForm.type !== 'Sick' && (
                                 <div>
                                     <label className="block text-xs font-bold uppercase opacity-60 mb-2">To Time</label>
                                     <CustomTimePicker 
                                        value={leaveForm.endTime} 
                                        onChange={(t: string) => setLeaveForm(prev => ({...prev, endTime: t}))} 
                                     />
                                 </div>
                             )}
                         </div>
                     </div>

                     {/* Notes */}
                     <div>
                         <label className="block text-xs font-bold uppercase opacity-60 mb-2">Notes</label>
                         <textarea 
                             value={leaveForm.notes}
                             onChange={e => setLeaveForm({...leaveForm, notes: e.target.value})}
                             className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 h-24 resize-none"
                             placeholder="Reason (optional)..."
                         />
                     </div>

                     {/* Mock Admin Toggle */}
                     {leaveForm.type !== 'Sick' && (
                        <div className="flex items-center gap-2 text-xs opacity-50">
                             <input type="checkbox" id="mockAdmin" onChange={(e) => { 
                                 // @ts-ignore
                                 window.confirmMockAdmin = e.target.checked 
                             }} />
                             <label htmlFor="mockAdmin">Auto-Confirm (Demo)</label>
                        </div>
                     )}

                     {/* Actions */}
                     <div className="flex gap-4 mt-2">
                         <button onClick={() => setShowLeavePopup(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-black/5 font-semibold">Cancel</button>
                         <button onClick={submitLeaveRequest} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">{leaveForm.type === 'Sick' ? 'Submit Report' : 'Submit Request'}</button>
                     </div>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
}