import { X, CheckCircle, ShieldCheck, Database, LockKey, Globe } from '@phosphor-icons/react';

export default function SystemHealthModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={32} weight="fill" />
                        <div>
                            <h2 className="text-xl font-bold font-['Montserrat']">System Secure</h2>
                            <p className="text-xs opacity-80 uppercase font-bold tracking-wider">All Systems Operational</p>
                        </div>
                    </div>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Database size={20} weight="fill" /></div>
                            <div>
                                <div className="font-bold text-sm text-gray-900 dark:text-white">Database Integrity</div>
                                <div className="text-xs opacity-50">Backups Synced (2 mins ago)</div>
                            </div>
                        </div>
                        <CheckCircle size={20} className="text-emerald-500" weight="fill" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><LockKey size={20} weight="fill" /></div>
                            <div>
                                <div className="font-bold text-sm text-gray-900 dark:text-white">Encryption Layer</div>
                                <div className="text-xs opacity-50">AES-256 Enabled</div>
                            </div>
                        </div>
                        <CheckCircle size={20} className="text-emerald-500" weight="fill" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Globe size={20} weight="fill" /></div>
                            <div>
                                <div className="font-bold text-sm text-gray-900 dark:text-white">Global CDN</div>
                                <div className="text-xs opacity-50">Latency: 24ms</div>
                            </div>
                        </div>
                        <CheckCircle size={20} className="text-emerald-500" weight="fill" />
                    </div>
                </div>
            </div>
        </div>
    );
}