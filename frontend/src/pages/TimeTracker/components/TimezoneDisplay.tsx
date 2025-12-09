// frontend/src/pages/TimeTracker/components/TimezoneDisplay.tsx
import { useState, useEffect } from 'react';
import { Globe, CaretDown, MapPin } from '@phosphor-icons/react';

export default function TimezoneDisplay() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedZone, setSelectedZone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [isOverride, setIsOverride] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Common Timezones list for the dropdown
    const timezones = [
        "UTC",
        "America/New_York",
        "America/Los_Angeles",
        "America/Chicago",
        "Europe/London",
        "Europe/Berlin",
        "Europe/Paris",
        "Asia/Dubai",
        "Asia/Singapore",
        "Asia/Manila",
        "Asia/Tokyo",
        "Australia/Sydney"
    ];

    const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedZone(e.target.value);
        setIsOverride(true);
    };

    const resetZone = () => {
        setSelectedZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        setIsOverride(false);
    };

    return (
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono bg-white/50 dark:bg-black/20 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-sm">
            {/* Local / Selected Time */}
            <div className="flex flex-col">
                <span className="opacity-50 font-bold uppercase mb-0.5 flex items-center gap-1 text-[10px] tracking-wider">
                    <MapPin weight="fill" size={10} className={isOverride ? "text-indigo-500" : ""} />
                    {isOverride ? 'Display Location' : 'Your Location'}
                    {isOverride && (
                        <button 
                            onClick={resetZone} 
                            className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 rounded hover:bg-indigo-500 hover:text-white transition ml-1"
                        >
                            RESET
                        </button>
                    )}
                </span>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg font-['Montserrat'] tabular-nums tracking-tight">
                        {currentTime.toLocaleTimeString('en-US', { timeZone: selectedZone, hour12: false })}
                    </span>
                    
                    {/* Timezone Selector */}
                    <div className="relative group">
                        <select 
                            value={selectedZone} 
                            onChange={handleZoneChange}
                            className="appearance-none bg-transparent font-medium opacity-70 hover:opacity-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer pr-4 outline-none text-right"
                            style={{ maxWidth: '140px' }}
                        >
                            {timezones.map(tz => (
                                <option key={tz} value={tz} className="text-black dark:text-black">{tz}</option>
                            ))}
                            {/* Ensure current detected zone is always an option */}
                            {!timezones.includes(selectedZone) && (
                                <option value={selectedZone} className="text-black dark:text-black">{selectedZone}</option>
                            )}
                        </select>
                        <CaretDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-300 dark:bg-white/10 hidden sm:block"></div>

            {/* UTC Time */}
            <div className="flex flex-col pl-2 sm:pl-0 border-l border-gray-300 dark:border-white/10 sm:border-none">
                <span className="opacity-40 font-bold uppercase mb-0.5 flex items-center gap-1 text-[10px] tracking-wider">
                    <Globe weight="duotone" size={10} /> UTC / Zulu
                </span>
                <span className="font-bold text-lg font-['Montserrat'] tabular-nums text-gray-400 dark:text-gray-500 tracking-tight">
                    {currentTime.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false })}
                </span>
            </div>
        </div>
    );
}