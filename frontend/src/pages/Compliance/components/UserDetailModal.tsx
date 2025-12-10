import { X, User, MapPin, Briefcase, IdentificationCard, Trash, Warning, CalendarCheck, ShieldCheck } from '@phosphor-icons/react';
import { Person } from '../../types';
import FlagDot from './ui/FlagDot';

interface Props {
    person: Person;
    onClose: () => void;
    onRemove: (id: string) => void;
}

export default function UserDetailModal({ person, onClose, onRemove }: Props) {
    
    // Mock Expiry Logic Logic
    const isCitizen = person.visa === 'Citizen';
    const mockExpiry = new Date();
    mockExpiry.setFullYear(mockExpiry.getFullYear() + 1); // 1 year from now
    const expiryStr = isCitizen ? 'N/A' : mockExpiry.toLocaleDateString();
    
    // Can we delete?
    const canDelete = isCitizen; // For demo: Citizens can be removed, Visa holders need expiry check
    
    const handleDelete = () => {
        if (!canDelete) {
            alert(`Cannot remove ${person.name}. Active ${person.visa} is valid until ${expiryStr}.`);
            return;
        }
        if(window.confirm(`Permanently remove ${person.name} from compliance tracking?`)) {
            onRemove(person.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10" onClick={e => e.stopPropagation()}>
                
                {/* Hero Header */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white relative">
                    <div className="flex justify-between items-start z-10 relative">
                        <div className="flex gap-5 items-center">
                            <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-bold shadow-xl backdrop-blur-sm">
                                {person.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold font-['Montserrat']">{person.name}</h2>
                                <div className="flex items-center gap-2 mt-1 opacity-80 text-sm">
                                    <Briefcase weight="fill" className="text-indigo-400" /> {person.role}
                                </div>
                                <div className="flex items-center gap-2 mt-1 opacity-60 text-xs font-mono">
                                    ID: {person.id} • <span className="uppercase text-emerald-400 font-bold">{person.status}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"><X size={20} /></button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 bg-gray-50 dark:bg-[#0f172a]/50 flex-1">
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <div className="text-xs uppercase font-bold opacity-50 mb-2 flex items-center gap-2">
                                <MapPin className="text-blue-500" /> Location
                            </div>
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <FlagDot country={person.loc} size="md" /> {person.loc}
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <div className="text-xs uppercase font-bold opacity-50 mb-2 flex items-center gap-2">
                                <IdentificationCard className="text-purple-500" /> Visa Type
                            </div>
                            <div className="font-bold text-lg">{person.visa}</div>
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                <CalendarCheck weight="fill" /> Authorization Expiry
                            </div>
                            {isCitizen && <span className="text-[10px] bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded font-bold">Permanent</span>}
                        </div>
                        <div className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100">{expiryStr}</div>
                        {!isCitizen && <div className="text-xs opacity-60 mt-1">Renewal required 90 days prior.</div>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button className="flex-1 py-3 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-2">
                            <User /> Edit Profile
                        </button>
                        
                        <button 
                            onClick={handleDelete}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                                canDelete 
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20' 
                                : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed border border-transparent'
                            }`}
                            title={!canDelete ? "Cannot delete active visa holder" : "Remove User"}
                        >
                            {canDelete ? <><Trash weight="fill" /> Remove User</> : <><ShieldCheck weight="fill" /> Protected</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}