// frontend/src/pages/TimeTracker/utils.ts
import { LeaveRequest } from './types';
// Use 'import type' for interfaces to satisfy the linter
import type { TimeEntry } from '../../types'; 

// Helper to get consistent local date string (YYYY-MM-DD)
export const getLocalDateStr = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

export const generateTimeOptions = () => {
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

export const TIME_OPTIONS = generateTimeOptions();

export const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export const getSecondsFromTime = (timeStr: string) => {
    try {
        const [h, m, s] = timeStr.split(':').map(Number);
        return h * 3600 + m * 60 + (s || 0);
    } catch { return 0; }
};

export const calculateDuration = (startStr: string, endStr: string) => {
    try {
        const d1 = new Date(`2000-01-01T${startStr}`);
        const d2 = new Date(`2000-01-01T${endStr}`);
        let diff = (d2.getTime() - d1.getTime()) / 1000;
        if (diff < 0) diff += 24 * 3600; // Handle simple wrap-around for display
        return formatTime(diff);
    } catch (e) {
        return "--:--:--";
    }
};

export const getHourMarker = (timeStr: string) => {
    try {
        const h = parseInt(timeStr.split(':')[0], 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}${ampm}`;
    } catch { return ""; }
};

export const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const validateEntryOverlap = (
    dateStr: string, 
    start: string, 
    end: string, 
    leaveRequests: LeaveRequest[]
): { allowed: boolean, start: string, end: string, reason?: string } => {
    const activeLeaves = leaveRequests.filter(l => dateStr >= l.startDate && dateStr <= l.endDate && l.status === 'Confirmed');

    if (activeLeaves.length === 0) return { allowed: true, start, end };

    for (const leave of activeLeaves) {
        let leaveStart = "00:00:00";
        let leaveEnd = "23:59:59";

        if (dateStr === leave.startDate && leave.startTime) leaveStart = leave.startTime;
        if (dateStr === leave.startDate && leave.reportedAt && leave.type === 'Sick') leaveStart = leave.reportedAt;
        
        if (dateStr === leave.endDate && leave.endTime) leaveEnd = leave.endTime;
        if (dateStr === leave.endDate && leave.returnedAt && leave.type === 'Sick') leaveEnd = leave.returnedAt;

        const entStartSec = getSecondsFromTime(start);
        const entEndSec = getSecondsFromTime(end);
        const lStartSec = getSecondsFromTime(leaveStart);
        const lEndSec = getSecondsFromTime(leaveEnd);

        // Simple overlap check
        if (entStartSec < lEndSec && entEndSec > lStartSec) {
            return { allowed: false, start, end, reason: `Cannot edit entry: overlaps with ${leave.type} Leave.` };
        }
    }
    return { allowed: true, start, end };
};

// Validate Overlap Between Leaves (New vs Existing)
export const validateLeaveRequestOverlap = (
    newReq: Partial<LeaveRequest>,
    existingRequests: LeaveRequest[]
): { allowed: boolean, reason?: string } => {
    if (!newReq.startDate || !newReq.endDate) return { allowed: false, reason: "Dates are required." };

    const newStartStr = newReq.startDate;
    const newEndStr = newReq.endDate;
    const newStartTime = newReq.startTime || "00:00:00";
    const newEndTime = newReq.endTime || "23:59:59";

    const potentialOverlaps = existingRequests.filter(ex => {
        return (newStartStr <= ex.endDate) && (newEndStr >= ex.startDate);
    });

    for (const ex of potentialOverlaps) {
        let cursor = new Date(newStartStr);
        const end = new Date(newEndStr);

        while (cursor <= end) {
            const cursorStr = getLocalDateStr(cursor);
            
            if (cursorStr >= ex.startDate && cursorStr <= ex.endDate) {
                let tStartA = "00:00:00";
                let tEndA = "23:59:59";
                if (cursorStr === newStartStr) tStartA = newStartTime;
                if (cursorStr === newEndStr) tEndA = newEndTime;

                let tStartB = "00:00:00";
                let tEndB = "23:59:59";
                if (cursorStr === ex.startDate && ex.startTime) tStartB = ex.startTime;
                if (cursorStr === ex.startDate && ex.reportedAt) tStartB = ex.reportedAt;
                if (cursorStr === ex.endDate && ex.endTime) tEndB = ex.endTime;
                if (cursorStr === ex.endDate && ex.returnedAt) tEndB = ex.returnedAt;

                const startASec = getSecondsFromTime(tStartA);
                const endASec = getSecondsFromTime(tEndA);
                const startBSec = getSecondsFromTime(tStartB);
                const endBSec = getSecondsFromTime(tEndB);

                if (startASec < endBSec && endASec > startBSec) {
                    return { 
                        allowed: false, 
                        reason: `Overlap detected with existing ${ex.type} leave on ${cursorStr}.` 
                    };
                }
            }
            cursor.setDate(cursor.getDate() + 1);
        }
    }

    return { allowed: true };
};

export const createSplitEntries = (
    clientId: string,
    dateStr: string,
    startTime: string,
    endTime: string,
    notes: string,
    isManual: boolean
): TimeEntry[] => {
    const sSec = getSecondsFromTime(startTime);
    const eSec = getSecondsFromTime(endTime);

    // If End is BEFORE Start, we assume it crossed midnight
    if (eSec < sSec) {
        // Entry 1: Start Time -> 23:59:59 on Day 1
        const entry1: TimeEntry = {
            id: crypto.randomUUID(),
            clientId,
            date: dateStr,
            startTime: startTime,
            endTime: "23:59:59",
            duration: calculateDuration(startTime, "23:59:59"),
            notes: notes + " (Part 1)",
            isManual
        };

        // Entry 2: 00:00:00 -> End Time on Day 2
        const dateObj = new Date(dateStr);
        dateObj.setDate(dateObj.getDate() + 1);
        const nextDateStr = getLocalDateStr(dateObj);

        const entry2: TimeEntry = {
            id: crypto.randomUUID(),
            clientId,
            date: nextDateStr,
            startTime: "00:00:00",
            endTime: endTime,
            duration: calculateDuration("00:00:00", endTime),
            notes: notes + " (Part 2)",
            isManual
        };
        
        return [entry1, entry2];
    }

    // Normal single day entry
    return [{
        id: crypto.randomUUID(),
        clientId,
        date: dateStr,
        startTime,
        endTime,
        duration: calculateDuration(startTime, endTime),
        notes,
        isManual
    }];
};