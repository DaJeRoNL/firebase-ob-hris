// frontend/src/pages/TimeTracker/components/UpcomingLeavesWidget.tsx
import { CalendarPlus, Trash } from '@phosphor-icons/react';
import { LeaveRequest } from '../types';

interface Props {
    upcomingLeaves: LeaveRequest[];
    onDeleteLeave: (id: string) => void;
}

export default function UpcomingLeavesWidget({ upcomingLeaves, onDeleteLeave }: Props) {
    return (
        <div className="glass-card p-4">
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs uppercase font-bold opacity-60 flex items-center gap-2">
                    <CalendarPlus size={16} weight="fill" className="text-indigo-500" />
                    Upcoming Time Off
                </h3>
            </div>
            <div className="text-[10px] opacity-40 italic mb-3 ml-6">(next 6 months)</div>
            
            {upcomingLeaves.length === 0 ? (
                <div className="text-xs opacity-40 italic">No upcoming leave scheduled.</div>
            ) : (
                <ul className="space-y-3">
                    {upcomingLeaves.map(leave => (
                        <li key={leave.id} className="flex gap-3 items-start text-xs group">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                            <div className="flex-1">
                                <div className="font-bold opacity-80">
                                    {new Date(leave.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                    {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}`}
                                </div>
                                <div className="opacity-60">{leave.type} • {leave.status}</div>
                            </div>
                            {leave.status === 'Requested' && (
                                <button onClick={() => onDeleteLeave(leave.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition">
                                    <Trash size={14} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}