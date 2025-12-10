import { X, MapPin, CaretRight, Users } from '@phosphor-icons/react';
import { Person } from '../../../types';

interface Props {
    type: 'Remote' | 'Hybrid';
    people: Person[];
    onClose: () => void;
    onSelectCountry: (country: string) => void;
}

export default function UserDistributionModal({ type, people, onClose, onSelectCountry }: Props) {
    
    // Group people by country
    const countryGroups = people.reduce((acc, p) => {
        acc[p.loc] = (acc[p.loc] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl shadow-2xl p-0 border border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${type === 'Remote' ? 'bg-blue-500' : 'bg-indigo-500'}`}>
                            <Users size={20} weight="duotone" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold font-['Montserrat']">{type} Workforce</h2>
                            <p className="text-xs opacity-60 uppercase font-bold">{people.length} Users total</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:text-red-500 transition"><X size={20} /></button>
                </div>
                
                {/* Country List */}
                <div className="p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-bold uppercase opacity-40 mb-2 px-2">Active Regions</div>
                    <div className="space-y-2">
                        {Object.entries(countryGroups).map(([country, count]) => (
                            <div 
                                key={country}
                                onClick={() => {
                                    onSelectCountry(country);
                                    onClose(); // Close this modal, main page will open HUD or Policy
                                }}
                                className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                                        <MapPin weight="fill" className="text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div className="font-bold text-sm">{country}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono font-bold bg-white dark:bg-white/10 px-2 py-0.5 rounded-md">{count}</span>
                                    <CaretRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 text-center">
                    <p className="text-[10px] opacity-50">Select a region to view specific compliance policies.</p>
                </div>
            </div>
        </div>
    );
}