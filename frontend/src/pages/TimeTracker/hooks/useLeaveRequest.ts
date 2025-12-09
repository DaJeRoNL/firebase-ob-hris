// frontend/src/pages/TimeTracker/hooks/useLeaveRequest.ts
import { useState, useMemo } from 'react';
import { LeaveRequest } from '../types';
import { getLocalDateStr, validateLeaveRequestOverlap } from '../utils';

export function useLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  
  // Modals Control
  const [showLeavePopup, setShowLeavePopup] = useState(false);
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

  const submitLeaveRequest = (onStopTimer?: () => void) => {
    // 1. Check for Overlaps First
    const validation = validateLeaveRequestOverlap(leaveForm, leaveRequests);
    
    if (!validation.allowed) {
        alert(`Request Failed: ${validation.reason}`);
        return null; // Return null to signal failure
    }

    // 2. Proceed if Valid
    if (leaveForm.type === 'Sick' && onStopTimer) onStopTimer();

    const newReq: LeaveRequest = {
        id: crypto.randomUUID(), // Use secure ID
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
    return newReq;
  };

  const deleteLeaveRequest = (id: string) => {
    if(window.confirm("Are you sure you want to cancel this leave request?")) {
        setLeaveRequests(prev => prev.filter(l => l.id !== id));
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

  const upcomingLeaves = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateStr(tomorrow);
    const limit = new Date();
    limit.setMonth(limit.getMonth() + 6);
    const limitStr = getLocalDateStr(limit);
    return leaveRequests.filter(req => req.startDate >= tomorrowStr && req.startDate <= limitStr).sort((a,b) => a.startDate.localeCompare(b.startDate));
  }, [leaveRequests]);

  const activeSickLeave = leaveRequests.find(l => l.type === 'Sick' && !l.returnedAt);

  return {
    requests: leaveRequests,
    upcoming: upcomingLeaves,
    activeSickLeave,
    showLeavePopup, setShowLeavePopup,
    showSickPolicyModal, setShowSickPolicyModal,
    showEndSickModal, setShowEndSickModal,
    showVacationModal, setShowVacationModal,
    showPersonalModal, setShowPersonalModal,
    showAiSummary, setShowAiSummary,
    form: leaveForm, setForm: setLeaveForm,
    submit: submitLeaveRequest,
    cancel: deleteLeaveRequest,
    deactivateSick: deactivateSickLeave
  };
}