// frontend/src/pages/TimeTracker/index.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLocalDateStr } from './utils';

// Hooks
import { useTimer } from './hooks/useTimer';
import { useTimeEntries } from './hooks/useTimeEntries';
import { useLeaveRequest } from './hooks/useLeaveRequest';

// Components
import CalendarWidget from './components/CalendarWidget';
import EntryList from './components/EntryList';
import LiveTrackerCard from './components/LiveTrackerCard';
import StatsSidebar from './components/StatsSidebar';
import UpcomingLeavesWidget from './components/UpcomingLeavesWidget';
import TimelineModal from './components/TimelineModal';
import LeaveModal from './components/LeaveModal';
import { StatusModals } from './components/StatusModals';
import TimezoneDisplay from './components/TimezoneDisplay'; // New Import

export default function TimeTracker() {
  const { currentClientId } = useAuth();
  
  // -- Logic Hooks --
  const timeEntries = useTimeEntries(currentClientId);
  const timer = useTimer(currentClientId, timeEntries.addEntryDirectly);
  const leave = useLeaveRequest();
  
  // -- Page State --
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showTimeline, setShowTimeline] = useState(false);

  // -- Handlers --
  const handleToggleTimer = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const sel = new Date(selectedDate);
    sel.setHours(0,0,0,0);
    
    if (sel > today && !timer.isRunning) return alert("Cannot start live tracker for a future date.");

    // Check Sick Leave
    if (leave.activeSickLeave) {
        leave.setShowEndSickModal(true);
        return;
    }

    if (timer.isRunning) {
      timer.stopTimer();
    } else {
      timer.startTimer();
      setSelectedDate(new Date()); // Jump to today
    }
  };

  const isSelectedDateFuture = getLocalDateStr(selectedDate) > getLocalDateStr(new Date());

  return (
    <div className="p-8 animate-fade-in text-[var(--text-main)] relative">
      {/* Header with Timezone Widget */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold font-['Montserrat']">Time & Monitoring</h1>
            <p className="text-sm opacity-70">Track your work hours and leave</p>
        </div>
        <TimezoneDisplay />
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Calendar & List */}
        <div className="lg:col-span-2 space-y-6">
            <CalendarWidget 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate}
                entries={timeEntries.entries}
                leaveRequests={leave.requests}
                currentClientId={currentClientId}
                isRunning={timer.isRunning}
            />
            <EntryList 
                selectedDate={selectedDate}
                entries={timeEntries.entries}
                leaveRequests={leave.requests}
                currentClientId={currentClientId}
                onManualAdd={() => timeEntries.addManual(selectedDate, leave.requests)}
                onUpdate={(id, field, val) => timeEntries.updateEntryTime(id, field, val, leave.requests)}
                onNoteUpdate={timeEntries.updateEntryNoteLine}
                onAddNote={timeEntries.addNote}
                onDelete={timeEntries.deleteEntry}
                onShowTimeline={() => setShowTimeline(true)}
                isRunning={timer.isRunning}
                startTime={timer.startTime}
                seconds={timer.seconds}
            />
        </div>

        {/* RIGHT COLUMN: Timer & Stats */}
        <div className="space-y-4 lg:col-span-1 sticky top-6">
            <StatsSidebar 
                entries={timeEntries.entries} 
                currentClientId={currentClientId}
                selectedDate={selectedDate}
                onOpenLeavePopup={() => leave.setShowLeavePopup(true)}
            />
            
            <LiveTrackerCard 
                timer={timer} 
                handleToggleTimer={handleToggleTimer}
                isSickLeaveActive={!!leave.activeSickLeave}
                isSelectedDateFuture={isSelectedDateFuture}
            />

            <UpcomingLeavesWidget 
                upcomingLeaves={leave.upcoming}
                onDeleteLeave={leave.cancel}
            />
        </div>
      </div>

      {/* MODALS */}
      {showTimeline && (
        <TimelineModal 
            date={selectedDate} 
            entries={timeEntries.entries} 
            leaveRequests={leave.requests}
            currentClientId={currentClientId}
            onClose={() => setShowTimeline(false)} 
        />
      )}
      
      {leave.showLeavePopup && (
        <LeaveModal 
            form={leave.form} 
            setForm={leave.setForm} 
            onSubmit={() => leave.submit(timer.isRunning ? timer.stopTimer : undefined)} 
            onClose={() => leave.setShowLeavePopup(false)} 
        />
      )}

      <StatusModals states={leave} />
    </div>
  );
}