// frontend/src/pages/TimeTracker/types.ts

export interface LeaveRequest {
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