import { X, FilePdf, DownloadSimple, Printer, ShareNetwork } from '@phosphor-icons/react';
import { CountryData, Person } from '../types';

interface Props {
    onClose: () => void;
    stats: any;
    locationStats: CountryData[];
    pendingReviews: Person[];
}

export default function ReportModal({ onClose, stats, locationStats, pendingReviews }: Props) {
    const timestamp = new Date().toLocaleString();
    
    // Sort locations by count to show most relevant first
    const sortedLocations = [...locationStats].sort((a,b) => b.count - a.count);

    // Helpers for dynamic policy text generation
    const getPolicyText = (region: string) => {
        if (region === 'Germany' || region === 'France' || region === 'UK') {
            return "Strict adherence to GDPR and local labor laws. Works councils consultation required for major changes. Standard 25-30 days PTO. Data residency within EU/UK borders enforced.";
        }
        if (region === 'USA') {
            return "At-will employment standard. Federal and State tax compliance verified via PEO. Benefits administration compliant with ACA. 401k contribution matching active.";
        }
        if (region === 'Philippines' || region === 'India') {
            return "13th-month pay mandatory. Night differential and holiday pay calibrated to local standards. HMO benefits provided. Social security contributions automated.";
        }
        return "Standard international contractor agreement framework. Local tax liability disclaimer signed. IP assignment fully enforced.";
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Toolbar */}
                <div className="bg-gray-100 dark:bg-[#1e293b] p-4 flex justify-between items-center border-b border-gray-200 dark:border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-500 text-white p-2 rounded shadow-sm"><FilePdf size={20} weight="fill" /></div>
                        <div>
                            <h3 className="font-bold text-sm">Global_Compliance_Report_LIVE.pdf</h3>
                            <p className="text-[10px] opacity-60">Snapshot: {timestamp}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition shadow-lg">
                            <DownloadSimple size={16} /> Download
                        </button>
                        <button onClick={onClose} className="ml-2 p-2 hover:bg-red-500/10 hover:text-red-500 rounded transition"><X size={20} /></button>
                    </div>
                </div>

                {/* PDF Content */}
                <div className="flex-1 bg-gray-200 dark:bg-[#020617] overflow-y-auto p-8 flex flex-col items-center gap-8 custom-scrollbar">
                    
                    {/* PAGE 1: Executive Summary */}
                    <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl p-16 text-black flex flex-col gap-8 relative shrink-0">
                        {/* Header */}
                        <div className="border-b-4 border-black pb-8 mb-4 flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-bold font-serif mb-2 text-slate-900">Compliance Audit</h1>
                                <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">OB-HRIS • Live Snapshot</p>
                            </div>
                            <div className="text-right">
                                <div className="text-5xl font-black text-indigo-600 tracking-tighter">{stats.complianceScore}%</div>
                                <div className="text-xs font-bold uppercase text-slate-900 mt-1">Safety Score</div>
                            </div>
                        </div>

                        {/* 1. Metrics */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold border-b border-slate-200 pb-2 text-slate-800">1. Executive Summary</h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                                    <div className="text-xl font-bold text-slate-900">{stats.total}</div>
                                    <div className="text-[9px] uppercase font-bold text-slate-500">Total Workforce</div>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                                    <div className="text-xl font-bold text-blue-600">{stats.remote}</div>
                                    <div className="text-[9px] uppercase font-bold text-slate-500">Remote Users</div>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                                    <div className="text-xl font-bold text-emerald-600">99.9%</div>
                                    <div className="text-[9px] uppercase font-bold text-slate-500">System Uptime</div>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                                    <div className="text-xl font-bold text-indigo-600">Active</div>
                                    <div className="text-[9px] uppercase font-bold text-slate-500">Encryption</div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Action Items */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold border-b border-slate-200 pb-2 text-slate-800 flex justify-between">
                                <span>2. Immediate Action Required</span>
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded border border-orange-200">{stats.pendingReviewsCount} Items</span>
                            </h3>
                            
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200">Employee</th>
                                        <th className="p-3 border-b border-slate-200">Location</th>
                                        <th className="p-3 border-b border-slate-200">Visa Status</th>
                                        <th className="p-3 border-b border-slate-200 text-right">Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingReviews.length > 0 ? pendingReviews.slice(0, 5).map(p => (
                                        <tr key={p.id}>
                                            <td className="p-3 border-b border-slate-100 font-bold">{p.name}</td>
                                            <td className="p-3 border-b border-slate-100">{p.loc}</td>
                                            <td className="p-3 border-b border-slate-100 font-mono text-xs">{p.visa}</td>
                                            <td className="p-3 border-b border-slate-100 text-right text-red-500 font-bold text-xs uppercase">High</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="p-6 text-center text-slate-400 text-sm italic">No pending actions. Great job!</td></tr>
                                    )}
                                </tbody>
                            </table>
                            {pendingReviews.length > 5 && <div className="text-center text-xs text-slate-400 italic">...and {pendingReviews.length - 5} more items.</div>}
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-8 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
                            Page 1 • Generated {timestamp} • OB-HRIS
                        </div>
                    </div>

                    {/* DYNAMIC PAGES: Country Policies */}
                    {sortedLocations.map((loc, idx) => (
                        <div key={loc.name} className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl p-16 text-black flex flex-col gap-8 relative shrink-0">
                            
                            {/* Page Header */}
                            <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                                <h2 className="text-2xl font-bold font-serif text-slate-900">{loc.name} Annex</h2>
                                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">ISO: {loc.isoCode?.toUpperCase() || 'N/A'}</span>
                            </div>

                            {/* Section 1: Entity Info */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-100 pb-1">Primary Entity</h4>
                                    <div className="text-sm font-bold">Acme {loc.name} Operations Ltd.</div>
                                    <div className="text-xs font-mono opacity-70">REG-ID: {Math.floor(Math.random()*100000)}</div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-100 pb-1">Workforce</h4>
                                    <div className="text-sm">Active Headcount: <strong>{loc.count}</strong></div>
                                    <div className="text-xs opacity-70">Risk Profile: {loc.riskLevel}</div>
                                </div>
                            </div>

                            {/* Section 2: Policy Text */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold border-b border-slate-200 pb-2 text-slate-800">Policy Framework</h3>
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg text-sm leading-relaxed text-justify opacity-80 font-serif">
                                    <p className="mb-4"><strong>1. Legal Basis:</strong> {getPolicyText(loc.name)}</p>
                                    <p className="mb-4"><strong>2. Compliance Declaration:</strong> The entity hereby declares full compliance with all local statutory requirements regarding payroll processing, social security contributions, and income tax withholding. All employees have valid contracts stored in the digital repository.</p>
                                    <p><strong>3. Data Handling:</strong> Personal identifiable information (PII) for employees in this jurisdiction is encrypted at rest and in transit, adhering to regional privacy standards.</p>
                                </div>
                            </div>

                            {/* Section 3: Approval Box */}
                            <div className="mt-auto border-2 border-slate-800 rounded-xl p-8 bg-white relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs font-bold uppercase tracking-widest text-slate-900">
                                    Director Authorization
                                </div>
                                
                                <p className="text-xs text-slate-500 mb-6 text-center">
                                    By signing below, I certify that the compliance status for {loc.name} has been reviewed and accurate as of {timestamp.split(',')[0]}.
                                </p>

                                <div className="grid grid-cols-2 gap-12">
                                    <div>
                                        <div className="h-10 border-b border-slate-400 mb-1"></div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Signature</div>
                                    </div>
                                    <div>
                                        <div className="h-10 border-b border-slate-400 mb-1"></div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Date</div>
                                    </div>
                                </div>

                                <div className="flex gap-8 mt-8 justify-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="w-5 h-5 border-2 border-slate-400 rounded flex items-center justify-center"></div>
                                        <span className="text-xs font-bold uppercase">Approve</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="w-5 h-5 border-2 border-slate-400 rounded flex items-center justify-center"></div>
                                        <span className="text-xs font-bold uppercase">Request Review</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono flex justify-between">
                                <span>OB-HRIS Secure Gen</span>
                                <span>Page {idx + 2}</span>
                                <span>{loc.name}</span>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}