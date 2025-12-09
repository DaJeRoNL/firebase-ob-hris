// frontend/src/pages/TimeTracker/components/LeaveModal.tsx
import { useState, useEffect } from 'react';
import { Suitcase, Smiley, FirstAid, User, Clock, CheckCircle } from '@phosphor-icons/react';
import { CustomSelect } from './ui/CustomSelect';
import { CustomDatePicker } from './ui/CustomDatePicker';
import { CustomTimePicker } from './ui/CustomTimePicker';

export default function LeaveModal({ onClose, onSubmit, form, setForm }: any) {
    const [isFullDay, setIsFullDay] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Reset internal state when form opens
    useEffect(() => {
        setIsFullDay(false);
        setIsSubmitting(false);
        setShowSuccess(false);
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        
        // If Full Day, we might want to standardize times or set a flag
        // For now, let's enforce standard business hours if full day is checked
        if (isFullDay) {
            setForm((prev: any) => ({
                ...prev,
                startTime: '09:00:00',
                endTime: '17:00:00'
            }));
        }

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        onSubmit();
        setIsSubmitting(false);
        setShowSuccess(true);

        // Close after showing success briefly
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-8 border border-white/10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 text-green-500">
                        <CheckCircle weight="fill" size={32} />
                    </div>
                    <h2 className="text-xl font-bold font-['Montserrat'] mb-2">Request Submitted</h2>
                    <p className="text-sm opacity-70">
                        Your request has been sent to your manager for approval. You will be notified once confirmed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white dark:bg-[#1e293b] w-full max-w-xl rounded-2xl shadow-2xl p-8 border border-white/10">
                 <h2 className="text-2xl font-bold font-['Montserrat'] mb-6">Request Time Off</h2>
                 <div className="space-y-6">
                     {/* Leave Type */}
                     <div>
                         <label className="block text-xs font-bold uppercase opacity-60 mb-2">Leave Type</label>
                         <CustomSelect 
                            value={form.type} 
                            onChange={(val: any) => setForm((prev: any) => ({ ...prev, type: val }))}
                            options={[
                                { value: 'Vacation', label: 'Vacation', icon: Smiley },
                                { value: 'Sick', label: 'Sick Leave', icon: FirstAid },
                                { value: 'Personal', label: 'Personal Leave', icon: User }
                            ]}
                            icon={Suitcase}
                         />
                     </div>

                     {/* Single Date Range Picker */}
                     <div>
                         <label className="block text-xs font-bold uppercase opacity-60 mb-2">Date Range</label>
                         <CustomDatePicker 
                            startDate={form.startDate} 
                            endDate={form.endDate} 
                            onStartChange={(d: string) => setForm((prev: any) => ({...prev, startDate: d}))} 
                            onEndChange={(d: string) => setForm((prev: any) => ({...prev, endDate: d}))}
                            disabled={form.type === 'Sick'}
                         />
                     </div>

                     {/* Full Day Toggle & Time Pickers */}
                     {form.type !== 'Sick' && (
                        <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="fullDay" 
                                    checked={isFullDay} 
                                    onChange={(e) => setIsFullDay(e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <label htmlFor="fullDay" className="text-sm font-bold cursor-pointer select-none">Full Day (09:00 - 17:00)</label>
                             </div>

                             {!isFullDay && (
                                 <div className="grid grid-cols-2 gap-6 animate-fade-in">
                                     <div>
                                         <label className="block text-xs font-bold uppercase opacity-60 mb-2 flex items-center gap-2">
                                             <Clock weight="fill" className="opacity-50" /> Start Time
                                         </label>
                                         <CustomTimePicker 
                                            value={form.startTime} 
                                            onChange={(t: string) => setForm((prev: any) => ({...prev, startTime: t}))} 
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold uppercase opacity-60 mb-2 flex items-center gap-2">
                                             <Clock weight="fill" className="opacity-50" /> End Time
                                         </label>
                                         <CustomTimePicker 
                                            value={form.endTime} 
                                            onChange={(t: string) => setForm((prev: any) => ({...prev, endTime: t}))} 
                                         />
                                     </div>
                                 </div>
                             )}
                        </div>
                     )}

                     {/* Notes */}
                     <div>
                         <label className="block text-xs font-bold uppercase opacity-60 mb-2">Notes</label>
                         <textarea 
                             value={form.notes}
                             onChange={e => setForm({...form, notes: e.target.value})}
                             className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 h-24 resize-none"
                             placeholder="Reason (optional)..."
                         />
                     </div>

                     {/* Mock Admin Toggle */}
                     {form.type !== 'Sick' && (
                        <div className="flex items-center gap-2 text-xs opacity-50">
                             <input type="checkbox" id="mockAdmin" onChange={(e) => { 
                                 // @ts-ignore
                                 window.confirmMockAdmin = e.target.checked 
                             }} />
                             <label htmlFor="mockAdmin">Auto-Confirm (Demo)</label>
                        </div>
                     )}

                     <div className="flex gap-4 mt-2">
                         <button onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-black/5 font-semibold disabled:opacity-50">Cancel</button>
                         <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex justify-center items-center gap-2">
                             {isSubmitting ? 'Sending...' : (form.type === 'Sick' ? 'Submit Report' : 'Submit Request')}
                         </button>
                     </div>
                 </div>
             </div>
         </div>
    );
}