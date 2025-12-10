import { useRef, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { CountryData } from '../types';
import { Globe, Scan, ArrowRight, ShieldWarning, ShieldCheck } from '@phosphor-icons/react';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Props {
    data: CountryData[];
    selectedCountryName: string | null;
    onSelectCountry: (name: string | null) => void;
    onOpenPolicy: () => void;
}

export default function GlobalMapWidget({ data, selectedCountryName, onSelectCountry, onOpenPolicy }: Props) {
    const timerRef = useRef<number | null>(null);
    const selectedCountry = data.find(c => c.name === selectedCountryName);

    // Precise Lat/Long for markers [Longitude, Latitude]
    const MARKER_COORDS: Record<string, [number, number]> = {
        "us": [-97, 38],   
        "gb": [-2, 54],    
        "ph": [122, 13],   
        "br": [-53, -10],  
        "de": [10, 51],    
        "au": [135, -25],  
        "in": [79, 22],    
        "ca": [-105, 56],  
        "fr": [2, 46],     
        "jp": [139, 36],   
        "cn": [103, 36],   
        "sg": [103.8, 1.3],
        "nl": [5.2, 52.1]
    };

    const markers = useMemo(() => {
        return data.map(d => {
            const code = d.isoCode ? d.isoCode.toLowerCase() : 'un';
            const coords = MARKER_COORDS[code] || [0, 0];
            return { ...d, coordinates: coords };
        }).filter(d => d.coordinates[0] !== 0); 
    }, [data]);

    // --- Handlers ---
    
    const handleContainerClick = () => {
        if (selectedCountryName) {
            onSelectCountry(null);
        }
    };

    const handleMouseLeave = () => {
        if (selectedCountryName) {
            timerRef.current = window.setTimeout(() => {
                onSelectCountry(null);
            }, 1500);
        }
    };

    const handleMouseEnter = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    return (
        <div 
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onClick={handleContainerClick}
            className="group relative w-full aspect-[2.2/1] bg-[#0f172a] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg cursor-default"
        >
            <ComposableMap projection="geoMercator" viewBox="0 0 980 420" style={{ width: "100%", height: "100%" }}>
                
                <Geographies geography={GEO_URL}>
                    {({ geographies }: { geographies: any[] }) =>
                        geographies.map((geo: any) => {
                            const hasData = data.some(d => d.name === geo.properties.NAME || d.isoCode === geo.properties.ISO_A2);
                            
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    style={{
                                        default: { fill: hasData ? "#334155" : "#1e293b", stroke: "#0f172a", strokeWidth: 0.75, outline: "none" },
                                        hover: { fill: "#475569", stroke: "#94a3b8", strokeWidth: 0.75, outline: "none", cursor: hasData ? "pointer" : "default" },
                                        pressed: { fill: "#334155", outline: "none" },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>

                {markers.map(({ name, coordinates, riskLevel }) => {
                    const isSelected = name === selectedCountryName;
                    const isHigh = riskLevel === 'High';
                    const isMedium = riskLevel === 'Medium';
                    const fill = isHigh ? '#ef4444' : isMedium ? '#f97316' : '#10b981';
                    
                    return (
                        <Marker key={name} coordinates={coordinates as [number, number]} onClick={(e) => {
                            e.stopPropagation();
                            onSelectCountry(name);
                        }}>
                            <circle r={isSelected ? 12 : 8} fill={fill} opacity={0.3} className="animate-ping" style={{ animationDuration: '2s' }} />
                            <circle r={4} fill={fill} stroke="#fff" strokeWidth={1.5} style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} 
                                className="hover:scale-125"
                            />
                            {isSelected && (
                                <circle r={14} fill="none" stroke="#fff" strokeWidth={1} strokeDasharray="3,3" className="animate-spin-slow" />
                            )}
                        </Marker>
                    );
                })}
            </ComposableMap>

            {/* --- OVERLAYS --- */}
            
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
                 <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest bg-[#0f172a]/80 px-3 py-1 rounded-full border border-indigo-500/20 backdrop-blur-sm">
                    <Globe size={14} weight="duotone" className="animate-spin-slow" /> 
                    Live Monitoring
                 </div>
            </div>

            <div className="absolute top-4 right-4 z-20 flex gap-4 bg-[#0f172a]/80 px-4 py-2 rounded-full border border-indigo-500/10 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5 opacity-80"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-emerald-500/50 shadow-[0_0_8px]"></div><span>Secure</span></div>
                <div className="flex items-center gap-1.5 opacity-80"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-orange-500/50 shadow-[0_0_8px]"></div><span>Alert</span></div>
                <div className="flex items-center gap-1.5 opacity-80"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-red-500/50 shadow-[0_0_8px]"></div><span>Critical</span></div>
            </div>

            {/* HUD Card */}
            {selectedCountry && (
                <div 
                    className="absolute bottom-4 left-4 z-30 animate-fade-in-up"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className="bg-[#0f172a]/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl w-64 hover:border-indigo-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Selected Region</div>
                                <div className="text-lg font-bold text-white font-['Montserrat'] leading-none mt-1">{selectedCountry.name}</div>
                            </div>
                            {selectedCountry.riskLevel === 'High' ? <ShieldWarning size={20} weight="duotone" className="text-red-500" /> :
                             selectedCountry.riskLevel === 'Medium' ? <ShieldWarning size={20} weight="duotone" className="text-orange-500" /> :
                             <ShieldCheck size={20} weight="duotone" className="text-emerald-500" />}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-white/5 rounded-lg p-2">
                                <div className="text-[9px] uppercase text-gray-400 font-bold">Personnel</div>
                                <div className="text-xl font-mono text-white leading-none mt-1">{selectedCountry.count}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                                <div className="text-[9px] uppercase text-gray-400 font-bold">Status</div>
                                <div className={`text-sm font-bold leading-none mt-2 ${
                                    selectedCountry.riskLevel === 'High' ? 'text-red-400' : 
                                    selectedCountry.riskLevel === 'Medium' ? 'text-orange-400' : 'text-emerald-400'
                                }`}>
                                    {selectedCountry.riskLevel.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenPolicy();
                            }}
                            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 group"
                        >
                            View Policy Details <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent h-[10%] w-full animate-scan-vertical pointer-events-none opacity-50"></div>
        </div>
    );
}