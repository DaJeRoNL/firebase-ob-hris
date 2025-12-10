const fs = require('fs');
const path = require('path');

// Configuration
const BASE_PATH = path.join(__dirname, 'frontend', 'src', 'pages', 'Compliance');

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

const files = {
    // --- 1. INDEX (Pass pendingReviews to Report) ---
    'index.tsx': `
import { useState } from 'react';
import GlobalMapWidget from './components/GlobalMapWidget';
import VisaTable from './components/VisaTable';
import StatsOverview from './components/StatsOverview';
import AuditLogWidget from './components/AuditLogWidget';
import PolicyModal from './components/PolicyModal';
import UserDistributionModal from './components/UserDistributionModal';
import PendingReviewsModal from './components/PendingReviewsModal';
import ReportModal from './components/ReportModal';
import AddUserModal from './components/AddUserModal';
import UserDetailModal from './components/UserDetailModal';
import SystemHealthModal from './components/SystemHealthModal';
import { useComplianceData } from './hooks/useComplianceData';
import { ShieldCheck } from '@phosphor-icons/react';
import { Person } from './types';

export default function Compliance() {
  const { people, remotePeople, hybridPeople, pendingReviews, locationStats, stats, auditLogs, addUser, removeUser } = useComplianceData();
  
  // State
  const [mapSelectedCountry, setMapSelectedCountry] = useState<string | null>(null);
  const [policyModalCountry, setPolicyModalCountry] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Person | null>(null);
  const [distributionModalType, setDistributionModalType] = useState<'Remote' | 'Hybrid' | null>(null);
  const [showPendingReviews, setShowPendingReviews] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);

  // Handlers
  const handleMapSelect = (name: string | null) => {
      setMapSelectedCountry(name);
  };

  const handleOpenPolicy = (country: string) => {
      setPolicyModalCountry(country);
  };

  return (
    <div className="p-8 text-[var(--text-main)] animate-fade-in relative h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-['Montserrat'] flex items-center gap-2">
            Global Compliance 
            <button 
                onClick={() => setShowHealthModal(true)}
                className="text-xs bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded-full border border-indigo-500/20 font-mono flex items-center gap-1 hover:bg-indigo-500/20 transition cursor-pointer"
            >
                <ShieldCheck weight="fill" /> SYSTEM SECURE
            </button>
          </h1>
          <p className="text-sm opacity-70">Workforce Distribution & Regulatory Monitoring</p>
        </div>
        <div className="flex gap-3">
             <div className="text-right hidden md:block">
                <div className="text-[10px] uppercase font-bold opacity-50">Next Audit</div>
                <div className="text-sm font-mono font-bold text-emerald-500">In 14 Days</div>
             </div>
             <div className="w-px h-8 bg-gray-200 dark:bg-white/10 hidden md:block"></div>
             <div className="text-right hidden md:block">
                <div className="text-[10px] uppercase font-bold opacity-50">Active Alerts</div>
                <div className="text-sm font-mono font-bold text-orange-500">0 Critical</div>
             </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
           <div className="shrink-0">
               <GlobalMapWidget 
                  data={locationStats} 
                  selectedCountryName={mapSelectedCountry}
                  onSelectCountry={handleMapSelect}
                  onOpenPolicy={() => mapSelectedCountry && handleOpenPolicy(mapSelectedCountry)}
               />
           </div>
           <div className="flex-1 min-h-0 overflow-hidden">
              <VisaTable 
                people={people} 
                onAddUser={() => setShowAddUserModal(true)}
                onUserClick={(p) => setSelectedUser(p)} 
              />
           </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
            <div className="shrink-0">
                <StatsOverview 
                    stats={stats} 
                    onOpenDistribution={(type) => setDistributionModalType(type)}
                    onOpenPending={() => setShowPendingReviews(true)}
                />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
                <AuditLogWidget 
                    logs={auditLogs}
                    onViewReport={() => setShowReportModal(true)}
                />
            </div>
        </div>
      </div>

      {/* -- MODALS -- */}
      {policyModalCountry && <PolicyModal country={policyModalCountry} onClose={() => setPolicyModalCountry(null)} />}
      
      {selectedUser && (
          <UserDetailModal 
            person={selectedUser} 
            onClose={() => setSelectedUser(null)} 
            onRemove={removeUser} 
          />
      )}
      
      {distributionModalType && <UserDistributionModal type={distributionModalType} people={distributionModalType === 'Remote' ? remotePeople : hybridPeople} onClose={() => setDistributionModalType(null)} onSelectCountry={(country) => { setDistributionModalType(null); handleOpenPolicy(country); }} />}
      {showPendingReviews && <PendingReviewsModal items={pendingReviews} onClose={() => setShowPendingReviews(false)} />}
      
      {/* Passed 'pendingReviews' to ReportModal */}
      {showReportModal && <ReportModal onClose={() => setShowReportModal(false)} stats={stats} locationStats={locationStats} pendingReviews={pendingReviews} />}
      
      {showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} onAdd={addUser} />}
      {showHealthModal && <SystemHealthModal onClose={() => setShowHealthModal(false)} />}
    </div>
  );
}
`,

    // --- 2. POLICY MODAL (Dynamic Entities) ---
    'components/PolicyModal.tsx': `
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
        { name: \`Acme \${country} Operations Ltd.\`, id: \`LE-\${Math.floor(Math.random() * 9000) + 1000}\`, status: 'Active' },
        { name: \`Acme Sales \${country}\`, id: \`LE-\${Math.floor(Math.random() * 9000) + 1000}\`, status: 'Dormant' },
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
                                    src={\`https://flagcdn.com/w160/\${flagCode}.png\`}
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
                                    <CaretDown className={\`transition-transform \${showEntities ? 'rotate-180' : ''}\`} />
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
`,

    // --- 3. REPORT MODAL (Massive Upgrade) ---
    'components/ReportModal.tsx': `
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
`
};

// Execution
console.log("🚀 Upgrading Report & Data Integration...");

ensureDir(BASE_PATH);
ensureDir(path.join(BASE_PATH, 'components'));

Object.entries(files).forEach(([fileName, content]) => {
    const filePath = path.join(BASE_PATH, fileName);
    fs.writeFileSync(filePath, content.trim());
    console.log(`✓ Updated: ${fileName}`);
});

console.log("\n✅ Done. Report is now multi-page, actionable, and dynamic.");