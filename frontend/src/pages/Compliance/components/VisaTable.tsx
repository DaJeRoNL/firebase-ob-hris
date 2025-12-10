import { useState } from 'react';
import { IdentificationCard, MagnifyingGlass, Funnel, Plus } from '@phosphor-icons/react';
import { Person } from '../../../types';
import StatusPill from './ui/StatusPill';
import FlagDot from './ui/FlagDot';

interface Props {
    people: Person[];
    onAddUser: () => void;
    onUserClick: (p: Person) => void;
}

export default function VisaTable({ people, onAddUser, onUserClick }: Props) {
    const [search, setSearch] = useState('');

    const filtered = people.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.visa.toLowerCase().includes(search.toLowerCase()) ||
        p.loc.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="glass-card h-full flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <IdentificationCard size={18} weight="fill" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Authorization Status</h3>
                        <p className="text-[10px] opacity-60 uppercase font-bold">{filtered.length} Records found</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={14} />
                        <input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 transition w-32 focus:w-48"
                        />
                    </div>
                    <button 
                        onClick={onAddUser}
                        className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-lg flex items-center gap-1 px-3"
                    >
                        <Plus size={14} weight="bold" /> <span className="text-xs font-bold">Add</span>
                    </button>
                </div>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white dark:bg-[#1e293b] z-10 shadow-sm">
                        <tr className="text-left text-[10px] uppercase font-bold tracking-wider opacity-50">
                            <th className="py-3 px-4">Employee</th>
                            <th className="py-3 px-4">Location</th>
                            <th className="py-3 px-4">Visa Type</th>
                            <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {filtered.map(p => (
                            <tr 
                                key={p.id} 
                                onClick={() => onUserClick(p)} // Row Click!
                                className="group hover:bg-indigo-50/50 dark:hover:bg-white/5 transition cursor-pointer"
                            >
                                <td className="py-3 px-4">
                                    <div className="font-bold text-xs text-gray-900 dark:text-gray-100">{p.name}</div>
                                    <div className="text-[10px] opacity-50 font-mono">{p.id}</div>
                                </td>
                                <td className="py-3 px-4 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <FlagDot country={p.loc} />
                                        {p.loc}
                                    </div>
                                </td>
                                <td className="py-3 px-4 opacity-70 text-xs font-mono">
                                    <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] border border-gray-200 dark:border-white/5">{p.visa}</span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <StatusPill 
                                        status={p.visa === 'Citizen' ? 'Authorized' : 'Review Needed'} 
                                        type={p.visa === 'Citizen' ? 'success' : 'warning'} 
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}