import { useState } from 'react';
import { X, ShieldCheck, Scroll, FileText, Bank, Briefcase, Buildings, CaretDown } from '@phosphor-icons/react';
import { getCountryCode } from '../utils';

interface Props {
    country: string;
    onClose: () => void;
}

export default function PolicyModal({ country, onClose }: Props) {
    const flagCode = getCountryCode(country).toLowerCase();
    const [showEntities, setShowEntities] = useState(false);

    // Dynamic Mock Entities based on country name
    const entities = [
        { name: `Acme ${country} Operations Ltd.`, id: `LE-${Math.floor(Math.random() * 9000) + 1000}`, status: 'Active' },
        { name: `Acme Sales ${country}`, id: `LE-${Math.floor(Math.random() * 9000) + 1000}`, status: 'Dormant' },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-4xl rounded-3xl shadow-2xl p-0 border border-white/10 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                <div className="bg-gradient-to-r from-indigo-900 to-[#0f172a] p-10 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex items-center gap-8">
                            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur border-4 border-white/20 shadow-2xl relative overflow-hidden shrink-0">
                                <img 
                                    src={`https://flagcdn.com/w160/${flagCode}.png`}
                                    alt={country}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold font-['Montserrat'] tracking-tight mb-2">{country}</h2>
                                <div className="flex items-center gap-3 opacity-90">
                                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">Active Region</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                                    <span className="text-sm font-mono opacity-80">Policy Framework v2.4</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition"><X size={24} /></button>
                    </div>
                </div>
                
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-50/50 dark:bg-[#0f172a]/30 flex-1 overflow-y-auto">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-bold uppercase opacity-50 tracking-widest mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Regulatory Framework</h3>
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-indigo-500/30 transition group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition"><Bank size={24} weight="duotone" /></div>
                                        <div>
                                            <h4 className="font-bold text-sm mb-1">Tax & Payroll</h4>
                                            <p className="text-xs opacity-70 leading-relaxed">Double taxation treaty in effect. Payroll processed via local entity (Acme GmbH/Inc). Monthly filing required by day 25.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-indigo-500/30 transition group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition"><Briefcase size={24} weight="duotone" /></div>
                                        <div>
                                            <h4 className="font-bold text-sm mb-1">Employment Standards</h4>
                                            <p className="text-xs opacity-70 leading-relaxed">Standard 40h work week. 25 days mandatory PTO. Strict severance protection logic applied for tenures &gt; 2 years.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-bold uppercase opacity-50 tracking-widest mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Entity Status</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                 <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
                                     <div className="text-emerald-500 mb-3 flex justify-center"><ShieldCheck size={32} weight="fill" /></div>
                                     <div className="text-2xl font-bold dark:text-white mb-1">Active</div>
                                     <div className="text-[10px] uppercase font-bold opacity-50">Legal Entity</div>
                                 </div>
                                 <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center">
                                     <div className="text-blue-500 mb-3 flex justify-center"><Scroll size={32} weight="fill" /></div>
                                     <div className="text-2xl font-bold dark:text-white mb-1">GDPR</div>
                                     <div className="text-[10px] uppercase font-bold opacity-50">Data Privacy</div>
                                 </div>
                            </div>

                            {/* Entity Dropdown */}
                            <div className="mb-4">
                                <button 
                                    onClick={() => setShowEntities(!showEntities)}
                                    className="w-full py-3 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-xl flex justify-between items-center px-4 hover:bg-gray-50 dark:hover:bg-white/5 transition group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Buildings className="text-indigo-500" size={20} />
                                        <span className="text-sm font-bold">Registered Entities ({entities.length})</span>
                                    </div>
                                    <CaretDown className={`transition-transform ${showEntities ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showEntities && (
                                    <div className="mt-2 space-y-2 animate-fade-in-down">
                                        {entities.map(ent => (
                                            <div key={ent.id} className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg flex justify-between items-center ml-2 border-l-4 border-l-indigo-500">
                                                <span className="text-xs font-bold dark:text-white">{ent.name}</span>
                                                <span className="text-[10px] font-mono opacity-50">{ent.id}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10">
                                <button className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-3 group">
                                    <FileText size={20} /> Download Full PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}