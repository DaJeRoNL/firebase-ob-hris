import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Warning, Calendar, FileArrowUp, IdentificationCard, ShieldCheck, ChatCircleText, User, MapPin, Briefcase, LockKey } from '@phosphor-icons/react';
import { Person, VisaRule } from '../types';

interface Props {
    person: Person;
    onClose: () => void;
    onSave: () => void;
}

// Mock Master Data
const VISA_RULES: Record<string, VisaRule> = {
    'H1B': { 
        id: 'H1B', label: 'H-1B Specialty Occupation', maxDuration: '3 Years (Extendable to 6)', 
        description: 'Requires specialized knowledge. Employer must file LCA.',
        requirements: ['Bachelor Degree', 'Labor Condition App'] 
    },
    'T2_General': { 
        id: 'T2_General', label: 'Tier 2 (General)', maxDuration: '5 Years', 
        description: 'Skilled worker visa for UK. Requires Certificate of Sponsorship.',
        requirements: ['CoS Reference', 'Appropriate Salary']
    },
    'Blue_Card': { 
        id: 'Blue_Card', label: 'EU Blue Card', maxDuration: '4 Years', 
        description: 'Work and residence permit for non-EU/EEA nationals.',
        requirements: ['Higher Ed Degree', 'Binding Job Offer'] 
    }
};

export default function VisaResolutionModal({ person, onClose, onSave }: Props) {
    const navigate = useNavigate();
    
    // Form State
    const [visaType, setVisaType] = useState<string>('');
    const [expiryDate, setExpiryDate] = useState('');
    const [reminderThreshold, setReminderThreshold] = useState('90');
    const [docUploaded, setDocUploaded] = useState(false);

    // Derived State
    const activeRule = VISA_RULES[visaType];
    const isFieldsComplete = visaType !== '' && expiryDate !== ''; // Lock condition
    
    const reminderDateDisplay = useMemo(() => {
        if (!expiryDate) return '---';
        const d = new Date(expiryDate);
        d.setDate(d.getDate() - parseInt(reminderThreshold));
        return d.toLocaleDateString();
    }, [expiryDate, reminderThreshold]);

    const handleChat = () => {
        // In a real app, pass user ID to chat context
        navigate('/chat');
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10" onClick={e => e.stopPropagation()}>
                
                {/* 1. Enhanced Header with User Context */}
                <div className="bg-indigo-900 p-6 text-white shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold shadow-lg">
                                {person.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-['Montserrat'] flex items-center gap-2">
                                    {person.name}
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {person.status}
                                    </span>
                                </h2>
                                <div className="flex items-center gap-4 mt-1 text-xs opacity-70">
                                    <span className="flex items-center gap-1"><Briefcase weight="fill" /> {person.role}</span>
                                    <span className="flex items-center gap-1"><MapPin weight="fill" /> {person.loc}</span>
                                    <span className="font-mono">ID: {person.id}</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleChat}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2"
                        >
                            <ChatCircleText size={16} weight="fill" /> Message User
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    
                    {/* 2. Data Entry Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        
                        {/* Visa Type */}
                        <div className="col-span-2">
                            <label className="text-xs font-bold uppercase opacity-50 mb-2 block">1. Visa Classification</label>
                            <select 
                                value={visaType} 
                                onChange={(e) => setVisaType(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition appearance-none cursor-pointer"
                            >
                                <option value="">Select Visa Type...</option>
                                <option value="H1B">USA - H-1B Specialty Occupation</option>
                                <option value="T2_General">UK - Tier 2 (General)</option>
                                <option value="Blue_Card">EU - Blue Card</option>
                            </select>

                            {/* Context Rule Card */}
                            {activeRule && (
                                <div className="mt-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex gap-3 animate-fade-in">
                                    <div className="mt-1"><ShieldCheck size={20} className="text-indigo-500" /></div>
                                    <div>
                                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{activeRule.label}</div>
                                        <div className="text-[11px] opacity-70 mt-1 mb-2 leading-relaxed">{activeRule.description}</div>
                                        <span className="text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                                            Max Duration: {activeRule.maxDuration}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Expiration Date (With Icon) */}
                        <div>
                            <label className="text-xs font-bold uppercase opacity-50 mb-2 block">2. Expiration Date</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Reminder Threshold */}
                        <div>
                            <label className="text-xs font-bold uppercase opacity-50 mb-2 block">3. Warning Threshold</label>
                            <select 
                                value={reminderThreshold}
                                onChange={(e) => setReminderThreshold(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
                            >
                                <option value="30">30 Days Before</option>
                                <option value="60">60 Days Before</option>
                                <option value="90">90 Days Before</option>
                                <option value="120">120 Days Before</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline Preview */}
                    {expiryDate && (
                        <div className="mb-8 p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                            <span className="flex items-center gap-2 opacity-70"><Warning className="text-orange-500" /> System will alert Admin on:</span>
                            <span className="font-mono font-bold text-orange-500">{reminderDateDisplay}</span>
                        </div>
                    )}

                    {/* 3. Document Proof (Locked State) */}
                    <div className="relative">
                        {!isFieldsComplete && (
                            <div className="absolute inset-0 bg-gray-100/50 dark:bg-black/60 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/5">
                                <div className="bg-white dark:bg-[#1e293b] px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-white/10 flex items-center gap-2 text-xs font-bold opacity-80">
                                    <LockKey weight="fill" /> Fill details above to unlock upload
                                </div>
                            </div>
                        )}
                        
                        <label className="text-xs font-bold uppercase opacity-50 mb-2 block">4. Proof of Visa</label>
                        <div 
                            onClick={() => isFieldsComplete && setDocUploaded(!docUploaded)}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition mb-2 ${
                                !isFieldsComplete ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-white/10' :
                                docUploaded 
                                    ? 'border-emerald-500 bg-emerald-500/5 cursor-pointer' 
                                    : 'border-gray-300 dark:border-white/20 hover:border-indigo-500 hover:bg-indigo-500/5 cursor-pointer'
                            }`}
                        >
                            {docUploaded ? (
                                <>
                                    <CheckCircle size={32} className="text-emerald-500 mb-2" weight="fill" />
                                    <div className="text-sm font-bold text-emerald-600">Document Verified & Attached</div>
                                    <div className="text-[10px] opacity-50">scan_visa_2024.pdf (1.2 MB)</div>
                                </>
                            ) : (
                                <>
                                    <FileArrowUp size={32} className="opacity-30 mb-2" />
                                    <div className="text-sm font-bold">Upload Document</div>
                                    <div className="text-[10px] opacity-50">Drag & drop or click to browse</div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Disclaimer */}
                    <div className={`flex items-start gap-2 mb-2 px-1 transition-opacity duration-300 ${isFieldsComplete ? 'opacity-100' : 'opacity-30'}`}>
                        <input 
                            type="checkbox" 
                            id="verify" 
                            className="mt-1 rounded border-gray-300" 
                            checked={docUploaded} 
                            readOnly 
                            disabled={!isFieldsComplete}
                        />
                        <label htmlFor="verify" className="text-[10px] opacity-60 leading-tight">
                            I confirm that I have physically or digitally verified the original document against the details entered above.
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 bg-gray-50 dark:bg-black/20">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition">Cancel</button>
                    <button 
                        onClick={onSave}
                        disabled={!docUploaded || !isFieldsComplete}
                        className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        Confirm & Update
                    </button>
                </div>
            </div>
        </div>
    );
}