import { useState } from 'react';
import { X, UserPlus, MagnifyingGlass, Check } from '@phosphor-icons/react';
import { Person } from '../types';
import FlagDot from './ui/FlagDot';

// Mock list of "potential" employees not yet in compliance
const MOCK_POTENTIAL_HIRES: Person[] = [
    { clientId: 'c1', id: 'u99', name: 'Sarah Connor', role: 'Security Ops', status: 'Onboarding', loc: 'USA', visa: 'Citizen' },
    { clientId: 'c1', id: 'u98', name: 'Jean-Luc P.', role: 'Captain', status: 'Active', loc: 'France', visa: 'Blue_Card' },
    { clientId: 'c1', id: 'u97', name: 'Wanda M.', role: 'DevRel', status: 'Active', loc: 'Germany', visa: 'Blue_Card' },
    { clientId: 'c1', id: 'u96', name: 'Tony S.', role: 'Engineering', status: 'Active', loc: 'USA', visa: 'H1B' },
];

interface Props {
    onClose: () => void;
    onAdd: (p: Person) => void;
}

export default function AddUserModal({ onClose, onAdd }: Props) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const filtered = MOCK_POTENTIAL_HIRES.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const handleConfirm = () => {
        const person = MOCK_POTENTIAL_HIRES.find(p => p.id === selectedId);
        if (person) {
            onAdd(person);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10" onClick={e => e.stopPropagation()}>
                
                <div className="p-5 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-bold font-['Montserrat'] flex items-center gap-2">
                        <UserPlus className="text-indigo-500" /> Add to Compliance
                    </h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="p-4 border-b border-gray-200 dark:border-white/10">
                    <div className="relative">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                        <input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search directory..."
                            className="w-full bg-gray-100 dark:bg-black/20 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[300px] p-2 space-y-1">
                    {filtered.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => setSelectedId(p.id)}
                            className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition border ${
                                selectedId === p.id 
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                                : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold">
                                    {p.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{p.name}</div>
                                    <div className="text-xs opacity-50 flex items-center gap-1">
                                        <FlagDot country={p.loc} /> {p.loc} • {p.role}
                                    </div>
                                </div>
                            </div>
                            {selectedId === p.id && <Check weight="bold" />}
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end">
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedId}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50"
                    >
                        Add Selected
                    </button>
                </div>
            </div>
        </div>
    );
}