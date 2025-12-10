import { Laptop, Buildings, ShieldCheck, ChartLineUp, CaretRight } from '@phosphor-icons/react';

interface Props {
    stats: any;
    onOpenDistribution: (type: 'Remote' | 'Hybrid') => void;
    onOpenPending: () => void;
}

export default function StatsOverview({ stats, onOpenDistribution, onOpenPending }: Props) {
    return (
        <div className="glass-card p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <h3 className="font-bold flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-500" /> Compliance Score
                </h3>
                <span className="text-2xl font-bold font-mono text-emerald-500">{stats.complianceScore}%</span>
            </div>

            <div className="mb-6 relative z-10">
                <div className="flex justify-between text-[10px] uppercase font-bold opacity-60 mb-2">
                    <span>Current Risk Level</span>
                    <span className="text-emerald-500">Low</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        style={{ width: `${stats.complianceScore}%` }} 
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div 
                    onClick={() => onOpenDistribution('Hybrid')}
                    className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 cursor-pointer transition text-center group relative overflow-hidden"
                >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CaretRight size={12} className="text-indigo-500" />
                    </div>
                    <Buildings className="mx-auto mb-2 opacity-50 group-hover:scale-110 group-hover:text-indigo-500 transition-all" size={24} />
                    <div className="text-xl font-bold">{stats.hybrid}</div>
                    <div className="text-[10px] uppercase font-bold opacity-50">Hybrid Users</div>
                </div>

                <div 
                    onClick={() => onOpenDistribution('Remote')}
                    className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 cursor-pointer transition text-center group relative overflow-hidden"
                >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CaretRight size={12} className="text-blue-500" />
                    </div>
                    <Laptop className="mx-auto mb-2 opacity-50 group-hover:scale-110 group-hover:text-blue-500 transition-all" size={24} />
                    <div className="text-xl font-bold">{stats.remote}</div>
                    <div className="text-[10px] uppercase font-bold opacity-50">Remote Users</div>
                </div>
            </div>

            {/* Pending Reviews Button */}
            <div 
                onClick={onOpenPending}
                className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center cursor-pointer group"
            >
                <div className="text-[10px] opacity-60 font-bold uppercase group-hover:text-orange-500 transition-colors">Pending Reviews</div>
                <div className="flex items-center gap-2">
                     <span className="text-xs font-bold bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        {stats.pendingReviewsCount} Items
                     </span>
                     <ChartLineUp size={14} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
}