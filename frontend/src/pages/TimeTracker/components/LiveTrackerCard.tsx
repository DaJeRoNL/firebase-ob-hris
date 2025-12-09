// frontend/src/pages/TimeTracker/components/LiveTrackerCard.tsx
import { Info, Plus, Stop, Play, Check, Flag } from '@phosphor-icons/react';
import { formatTime } from '../utils';
import { useState } from 'react';

export default function LiveTrackerCard({ timer, handleToggleTimer, isSickLeaveActive, isSelectedDateFuture }: any) {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col min-h-[350px] justify-center items-center group">
            
            {/* Info Button Wrapper - Handles Hover Logic */}
            <div 
                className="absolute top-4 right-4 z-20 flex flex-col items-end"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
            >
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition cursor-help">
                    <Info weight="bold" />
                </button>
                
                {showInfo && (
                    <div className="absolute top-10 right-0 w-64 bg-slate-800 text-xs p-4 rounded-xl shadow-2xl border border-white/10 z-30 animate-fade-in">
                        <h4 className="font-bold mb-2 text-white">Legend</h4>
                        <ul className="space-y-2 text-white/80">
                            <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Live Tracking</li>
                            <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Entry (&lt;8h)</li>
                            <li className="flex items-center gap-2"><div className="w-2 h-2 border border-dashed border-orange-500"></div> Requested Leave</li>
                            <li className="flex items-center gap-2"><div className="w-2 h-2 border border-green-500"></div> Confirmed Leave</li>
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-green-500" /> &gt;8h/Confirmed</li>
                            <li className="flex items-center gap-2"><Check weight="bold" className="text-gray-400" /> Retroactive</li>
                            <li className="flex items-center gap-2"><Flag weight="fill" className="text-green-500" /> Description</li>
                            <li className="flex items-center gap-2"><Flag weight="fill" className="text-gray-400" /> Retroactive</li>
                        </ul>
                    </div>
                )}
            </div>

            <div className="w-full max-w-[280px] flex flex-col gap-6">
                <h3 className="font-bold opacity-80 flex items-center justify-center gap-3 w-full">{timer.isRunning && <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>}Live Tracker</h3>
                <div className="text-center">
                    <div className="text-5xl font-bold font-mono tracking-wider mb-1">{formatTime(timer.seconds)}</div>
                    {timer.sessionNotes.length > 0 && <div className="text-xs opacity-50 font-mono mb-2">{timer.sessionNotes.length} notes added</div>}
                    <div className="text-sm opacity-60">{timer.isRunning ? 'Tracking Time' : (isSickLeaveActive ? 'Out Sick' : 'Ready')}</div>
                </div>
                <div className="flex gap-2 w-full">
                    {/* Input with min-w-0 to handle flex shrinking */}
                    <input 
                        disabled={!timer.isRunning} 
                        value={timer.liveNoteInput} 
                        onChange={(e) => timer.setLiveNoteInput(e.target.value)} 
                        onKeyDown={(e) => { if (e.key === 'Enter') timer.addLiveNote(); }} 
                        placeholder={timer.isRunning ? "Add note to session..." : "Start timer..."} 
                        className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm placeholder-white/40 focus:outline-none focus:bg-white/20 transition" 
                    />
                    {/* Button with shrink-0 to prevent crushing */}
                    {timer.isRunning && (
                        <button onClick={timer.addLiveNote} className="shrink-0 px-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition text-white">
                            <Plus weight="bold" size={20} />
                        </button>
                    )}
                </div>
                <button onClick={handleToggleTimer} disabled={isSelectedDateFuture && !timer.isRunning} className={`w-full py-4 rounded-xl text-sm font-bold border transition backdrop-blur flex items-center justify-center gap-2 ${isSickLeaveActive ? 'bg-orange-500/20 text-orange-100 border-orange-500/30 hover:bg-orange-500/30' : isSelectedDateFuture && !timer.isRunning ? 'opacity-50 cursor-not-allowed bg-gray-500/20 text-gray-400 border-gray-500/30' : timer.isRunning ? 'bg-red-500/20 text-red-100 border-red-500/30 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30 hover:bg-emerald-500/30'}`}>{isSickLeaveActive ? "I'm Back" : (timer.isRunning ? <><Stop weight="fill" /> Stop & Save</> : <><Play weight="fill" /> Clock In</>)}</button>
            </div>
        </div>
    );
}