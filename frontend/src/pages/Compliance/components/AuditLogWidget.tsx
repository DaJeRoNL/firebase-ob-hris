import { FileText, CheckCircle, Warning, XCircle, Clock } from '@phosphor-icons/react';
import { AuditEvent } from '../types';

interface Props {
    logs: AuditEvent[];
    onViewReport: () => void;
}

export default function AuditLogWidget({ logs, onViewReport }: Props) {
    
    const getIcon = (status: string) => {
        switch(status) {
            case 'Success': return <CheckCircle weight="fill" className="text-emerald-500" />;
            case 'Warning': return <Warning weight="fill" className="text-orange-500" />;
            case 'Error': return <XCircle weight="fill" className="text-red-500" />;
            default: return <Clock weight="fill" className="text-gray-500" />;
        }
    };

    return (
        <div className="glass-card flex-1 flex flex-col p-0 overflow-hidden min-h-[300px]">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center shrink-0">
                <h3 className="font-bold flex items-center gap-2 text-sm">
                    <FileText size={18} className="text-blue-500" /> Audit Stream
                </h3>
                <div className="text-[10px] font-bold uppercase opacity-40">
                    Real-time
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                {logs.map(log => (
                    <div key={log.id} className="group p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition flex items-start gap-3 border border-transparent hover:border-gray-200 dark:hover:border-white/5">
                        <div className="mt-0.5 shrink-0">{getIcon(log.status)}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{log.action}</span>
                                <span className="text-[10px] font-mono opacity-50">{log.timestamp}</span>
                            </div>
                            <div className="text-[11px] opacity-70 truncate" title={log.details}>
                                {log.details}
                            </div>
                            <div className="mt-1 text-[10px] opacity-40 font-bold uppercase flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-current"></div> {log.user}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Action */}
            <div className="p-3 border-t border-gray-200 dark:border-white/10 shrink-0">
                <button 
                    onClick={onViewReport}
                    className="w-full py-2 text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition font-bold flex justify-center items-center gap-2 group"
                >
                    View Full Report <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>
        </div>
    );
}