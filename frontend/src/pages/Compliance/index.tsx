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