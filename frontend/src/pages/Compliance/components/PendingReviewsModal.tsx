import { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, Briefcase, CaretRight } from '@phosphor-icons/react';
import { Person } from '../../../types';
import VisaResolutionModal from './VisaResolutionModal';
import FlagDot from './ui/FlagDot';

interface Props {
    items: Person[];
    onClose: () => void;
}

export default function PendingReviewsModal({ items, onClose }: Props) {
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-[#1e293b] w-full max-w-4xl rounded-2xl shadow-2xl p-0 border border-white/10 overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50/90 dark:bg-white/5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center shadow-inner">
                                <Clock size={28} weight="duotone" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-['Montserrat']">Pending Actions</h2>
                                <div className="flex items-center gap-2 text-xs opacity-60">
                                    <span className="font-bold text-orange-500">{items.length} Requires Attention</span>
                                    <span>•</span>
                                    <span>Compliance Audit Queue</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="hover:text-red-500 transition p-2 bg-black/5 dark:bg-white/5 rounded-lg"><X size={20} /></button>
                    </div>

                    {/* List Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-100 dark:bg-black/20 text-[10px] font-bold uppercase opacity-50 border-b border-gray-200 dark:border-white/5 shrink-0">
                        <div className="col-span-4">Employee / ID</div>
                        <div className="col-span-3">Role & Dept</div>
                        <div className="col-span-3">Issue / Due Date</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* List Content */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar bg-gray-50 dark:bg-[#0f172a]/50">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 opacity-50">
                                <CheckCircle size={48} className="text-emerald-500 mb-4" />
                                <div className="text-sm font-bold">All clear! No pending reviews.</div>
                            </div>
                        ) : (
                            items.map((person) => (
                                <div key={person.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 transition items-center group">
                                    
                                    {/* Employee */}
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                            {person.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{person.name}</div>
                                            <div className="text-xs opacity-50 flex items-center gap-1 mt-0.5">
                                                <FlagDot country={person.loc} /> {person.loc}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div className="col-span-3">
                                        <div className="flex items-center gap-1.5 text-xs font-medium">
                                            <Briefcase size={12} className="opacity-50" /> {person.role}
                                        </div>
                                        <div className="text-[10px] opacity-50 mt-0.5">Engineering Dept</div>
                                    </div>

                                    {/* Issue */}
                                    <div className="col-span-3">
                                        <div className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-1 rounded text-[10px] font-bold border border-orange-500/20">
                                            Visa Review
                                        </div>
                                        <div className="text-[10px] text-red-400 font-mono mt-1 font-bold">Due in {Math.floor(Math.random() * 10) + 2} days</div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="col-span-2 flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition">
                                        <button 
                                            onClick={() => setSelectedPerson(person)}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-sm text-xs font-bold flex items-center gap-1"
                                        >
                                            Resolve <CaretRight weight="bold" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-white/10 text-center shrink-0">
                        <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition uppercase tracking-wide">
                            Close Action Center
                        </button>
                    </div>
                </div>
            </div>

            {/* Nested Resolution Modal */}
            {selectedPerson && (
                <VisaResolutionModal 
                    person={selectedPerson} 
                    onClose={() => setSelectedPerson(null)}
                    onSave={() => { setSelectedPerson(null); onClose(); }}
                />
            )}
        </>
    );
}