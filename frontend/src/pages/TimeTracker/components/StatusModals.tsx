// frontend/src/pages/TimeTracker/components/StatusModals.tsx
import { FirstAid, Smiley, User, Check, Sparkle, Phone, EnvelopeSimple } from '@phosphor-icons/react';

export function StatusModals({ states }: any) {
    const { 
        showSickPolicyModal, setShowSickPolicyModal,
        showVacationModal, setShowVacationModal,
        showPersonalModal, setShowPersonalModal,
        showEndSickModal, setShowEndSickModal,
        showAiSummary, setShowAiSummary,
        deactivateSick
    } = states;

    return (
        <>
            {/* SICK POLICY MODAL */}
            {showSickPolicyModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <FirstAid weight="fill" size={24} />
                            </div>
                            <h2 className="text-xl font-bold font-['Montserrat']">Sick Leave Active</h2>
                        </div>
                        
                        <p className="text-sm opacity-80 mb-4">
                            Your sick leave has been logged. Access to work systems is now restricted to ensure rest.
                        </p>

                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-6">
                            <h4 className="font-bold text-red-500 text-xs uppercase mb-3">Emergency / HR Contact</h4>
                            
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-red-400">
                                    <Phone weight="fill" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold opacity-50 uppercase">Hotline</div>
                                    <div className="font-mono text-sm font-bold">+1 (555) 012-3456</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-red-400">
                                    <EnvelopeSimple weight="fill" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold opacity-50 uppercase">Email</div>
                                    <div className="font-mono text-sm font-bold">hr-benefits@acme.com</div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowSickPolicyModal(false)} 
                            className="w-full py-3 rounded-xl bg-gray-200 dark:bg-white/10 font-bold hover:bg-gray-300 dark:hover:bg-white/20 transition"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}
            
            {showVacationModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"><div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10"><div className="flex items-center gap-3 mb-4 text-emerald-500"><div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><Smiley weight="fill" size={24} /></div><h2 className="text-xl font-bold font-['Montserrat']">Vacation Request Sent!</h2></div><p className="text-sm opacity-80 mb-6">Enjoy your time off! Recharge and relax. We've notified your manager.</p><button onClick={() => setShowVacationModal(false)} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition">Awesome</button></div></div>}
            
            {showPersonalModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"><div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10"><div className="flex items-center gap-3 mb-4 text-indigo-500"><div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center"><User weight="fill" size={24} /></div><h2 className="text-xl font-bold font-['Montserrat']">Personal Leave Logged</h2></div><p className="text-sm opacity-80 mb-6">Your personal leave request has been submitted for approval.</p><button onClick={() => setShowPersonalModal(false)} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition">Close</button></div></div>}
            
            {showEndSickModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"><div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10"><div className="flex items-center gap-3 mb-4 text-emerald-500"><div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><Check weight="bold" size={24} /></div><h2 className="text-xl font-bold font-['Montserrat']">Return to Work?</h2></div><p className="text-sm opacity-80 mb-6">Confirming this will mark your return from Sick Leave as of now. You will be able to clock in immediately.</p><div className="flex gap-3 mt-4"><button onClick={() => setShowEndSickModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-black/5">Cancel</button><button onClick={deactivateSick} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/30">Confirm Return</button></div></div></div>}
            
            {showAiSummary && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in"><div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10 relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div><div className="flex items-center gap-3 mb-4 text-indigo-500"><div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center animate-pulse"><Sparkle weight="fill" size={24} /></div><h2 className="text-xl font-bold font-['Montserrat']">Welcome Back!</h2></div><p className="text-sm opacity-80 mb-6">Here is an AI-generated summary of what you missed while you were away:</p><div className="space-y-3 mb-6"><div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div><div className="text-sm opacity-70"><span className="font-bold block text-gray-900 dark:text-gray-100">3 Team Meetings</span>Notes are available in the #general channel.</div></div><div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div><div className="text-sm opacity-70"><span className="font-bold block text-gray-900 dark:text-gray-100">Project Alpha Update</span>Client feedback was positive. New tasks assigned.</div></div><div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></div><div className="text-sm opacity-70"><span className="font-bold block text-gray-900 dark:text-gray-100">12 New Emails</span>Priority: High (2) from HR regarding benefits.</div></div></div><button onClick={() => setShowAiSummary(false)} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">Thanks, I'm caught up</button></div></div>}
        </>
    );
}