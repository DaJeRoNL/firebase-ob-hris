// frontend/src/pages/TimeTracker/hooks/useTimeEntries.ts
import { useState, useEffect } from 'react';
import type { TimeEntry } from '../../../types';
import { LeaveRequest } from '../types';
import { 
    getLocalDateStr, 
    validateEntryOverlap, 
    calculateDuration, 
    createSplitEntries 
} from '../utils';

export function useTimeEntries(currentClientId: string) {
  // Initialize from LocalStorage
  const [entries, setEntries] = useState<TimeEntry[]>(() => {
      const saved = localStorage.getItem(`time_entries_${currentClientId}`);
      return saved ? JSON.parse(saved) : [];
  });

  // Persist whenever entries change
  useEffect(() => {
      localStorage.setItem(`time_entries_${currentClientId}`, JSON.stringify(entries));
  }, [entries, currentClientId]);

  const addManual = (date: Date, leaveRequests: LeaveRequest[]) => {
    const dateStr = getLocalDateStr(date);
    
    const start = "09:00:00";
    const end = "10:00:00";

    const valid = validateEntryOverlap(dateStr, start, end, leaveRequests);
    if (!valid.allowed) { alert(valid.reason); return; }

    const newEntries = createSplitEntries(
        currentClientId,
        dateStr,
        start,
        end,
        "",
        true // Explicitly Manual because it was created via "Retroactive" button
    );
    
    setEntries(prev => [...newEntries, ...prev]);
  };

  const updateEntryTime = (id: string | undefined, field: 'startTime' | 'endTime', value: string, leaveRequests: LeaveRequest[]) => {
    if (!id || id.startsWith('leave-')) return;
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    const tentativeStart = field === 'startTime' ? value : entry.startTime;
    const tentativeEnd = field === 'endTime' ? value : entry.endTime;
    
    const valid = validateEntryOverlap(entry.date, tentativeStart, tentativeEnd, leaveRequests);
    if (!valid.allowed) { alert(valid.reason); return; }
    
    const sSec = parseInt(tentativeStart.replace(/:/g,''));
    const eSec = parseInt(tentativeEnd.replace(/:/g,''));
    
    if (eSec < sSec) {
        if(window.confirm("This entry crosses midnight. It will be split into two separate daily entries. Continue?")) {
            const splitResult = createSplitEntries(
                entry.clientId, 
                entry.date, 
                tentativeStart, 
                tentativeEnd, 
                entry.notes, 
                true // Split operation is considered a manual adjustment
            );
            
            setEntries(prev => {
                const filtered = prev.filter(e => e.id !== id);
                return [...splitResult, ...filtered];
            });
            return;
        } else {
            return;
        }
    }

    // Normal update
    setEntries(prev => prev.map(e => e.id === id ? { 
        ...e, 
        [field]: value, 
        duration: calculateDuration(tentativeStart, tentativeEnd), 
        isManual: true // Changing TIME triggers the flag
    } : e));
  };

  const updateEntryNoteLine = (id: string | undefined, lineIndex: number, newValue: string) => {
    if (!id || id.startsWith('leave-')) return;
    setEntries(prev => prev.map(e => {
        if (e.id === id) {
            const lines = e.notes ? e.notes.split('\n') : [];
            lines[lineIndex] = newValue;
            // UPDATED: Do NOT set isManual: true here. Preserve existing state.
            return { ...e, notes: lines.join('\n') }; 
        }
        return e;
    }));
  };

  const addNote = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if(!entry) return;
    const newNotes = entry.notes ? entry.notes + "\n" : " "; 
    // UPDATED: Do NOT set isManual: true here. Preserve existing state.
    setEntries(prev => prev.map(e => e.id === id ? { ...entry, notes: newNotes } : e));
  };

  const deleteEntry = (id: string | undefined) => {
    if(!id || id.startsWith('leave-')) return;
    if(!window.confirm("Delete this time entry?")) return;
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const addEntryDirectly = (newEntries: TimeEntry[]) => {
      setEntries(prev => [...newEntries, ...prev]);
  };

  return {
    entries,
    addManual,
    updateEntryTime,
    updateEntryNoteLine,
    addNote,
    deleteEntry,
    addEntryDirectly
  };
}