const fs = require('fs');
const path = require('path');

// Configuration
const COMPLIANCE_PATH = path.join(__dirname, 'frontend', 'src', 'pages', 'Compliance', 'components');
const TYPES_PATH = path.join(__dirname, 'frontend', 'src', 'types');

// Helper
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
};

const files = {
    // --- 1. Fix Missing Import in PendingReviewsModal ---
    'frontend/src/pages/Compliance/components/PendingReviewsModal.tsx': `
import { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, Briefcase, CaretRight } from '@phosphor-icons/react';
import { Person } from '../../../types';
import VisaResolutionModal from './VisaResolutionModal';
import FlagDot from './ui/FlagDot';

interface Props {
    items: Person[];
    onClose: () => void;
}

export default function PendingReviewsModal({ items, onClose }: Props) {
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-[#1e293b] w-full max-w-4xl rounded-2xl shadow-2xl p-0 border border-white/10 overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50/90 dark:bg-white/5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center shadow-inner">
                                <Clock size={28} weight="duotone" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-['Montserrat']">Pending Actions</h2>
                                <div className="flex items-center gap-2 text-xs opacity-60">
                                    <span className="font-bold text-orange-500">{items.length} Requires Attention</span>
                                    <span>•</span>
                                    <span>Compliance Audit Queue</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="hover:text-red-500 transition p-2 bg-black/5 dark:bg-white/5 rounded-lg"><X size={20} /></button>
                    </div>

                    {/* List Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-100 dark:bg-black/20 text-[10px] font-bold uppercase opacity-50 border-b border-gray-200 dark:border-white/5 shrink-0">
                        <div className="col-span-4">Employee / ID</div>
                        <div className="col-span-3">Role & Dept</div>
                        <div className="col-span-3">Issue / Due Date</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* List Content */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar bg-gray-50 dark:bg-[#0f172a]/50">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 opacity-50">
                                <CheckCircle size={48} className="text-emerald-500 mb-4" />
                                <div className="text-sm font-bold">All clear! No pending reviews.</div>
                            </div>
                        ) : (
                            items.map((person) => (
                                <div key={person.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 transition items-center group">
                                    
                                    {/* Employee */}
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                            {person.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{person.name}</div>
                                            <div className="text-xs opacity-50 flex items-center gap-1 mt-0.5">
                                                <FlagDot country={person.loc} /> {person.loc}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div className="col-span-3">
                                        <div className="flex items-center gap-1.5 text-xs font-medium">
                                            <Briefcase size={12} className="opacity-50" /> {person.role}
                                        </div>
                                        <div className="text-[10px] opacity-50 mt-0.5">Engineering Dept</div>
                                    </div>

                                    {/* Issue */}
                                    <div className="col-span-3">
                                        <div className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-1 rounded text-[10px] font-bold border border-orange-500/20">
                                            Visa Review
                                        </div>
                                        <div className="text-[10px] text-red-400 font-mono mt-1 font-bold">Due in {Math.floor(Math.random() * 10) + 2} days</div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="col-span-2 flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition">
                                        <button 
                                            onClick={() => setSelectedPerson(person)}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-sm text-xs font-bold flex items-center gap-1"
                                        >
                                            Resolve <CaretRight weight="bold" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-white/10 text-center shrink-0">
                        <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition uppercase tracking-wide">
                            Close Action Center
                        </button>
                    </div>
                </div>
            </div>

            {/* Nested Resolution Modal */}
            {selectedPerson && (
                <VisaResolutionModal 
                    person={selectedPerson} 
                    onClose={() => setSelectedPerson(null)}
                    onSave={() => { setSelectedPerson(null); onClose(); }}
                />
            )}
        </>
    );
}
`,

    // --- 2. Create Type Declaration for Map Library ---
    'frontend/src/types/react-simple-maps.d.ts': `
declare module 'react-simple-maps' {
    import * as React from 'react';

    export interface ComposableMapProps {
        width?: number;
        height?: number;
        projection?: string | ((width: number, height: number) => any);
        projectionConfig?: any;
        viewBox?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
    }

    export const ComposableMap: React.FC<ComposableMapProps>;

    export interface GeographiesProps {
        geography?: string | Record<string, any> | string[];
        children: (args: { geographies: any[] }) => React.ReactNode;
        parseGeographies?: (geographies: any[]) => any[];
    }

    export const Geographies: React.FC<GeographiesProps>;

    export interface GeographyProps {
        geography: any;
        onClick?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
        onMouseEnter?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
        onMouseLeave?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
        onMouseDown?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
        onMouseUp?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
        onFocus?: (event: React.FocusEvent<SVGPathElement>) => void;
        onBlur?: (event: React.FocusEvent<SVGPathElement>) => void;
        style?: {
            default?: React.CSSProperties;
            hover?: React.CSSProperties;
            pressed?: React.CSSProperties;
        };
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        className?: string;
    }

    export const Geography: React.FC<GeographyProps>;

    export interface MarkerProps {
        coordinates: [number, number];
        onClick?: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
        onMouseEnter?: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
        onMouseLeave?: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
        onMouseDown?: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
        onMouseUp?: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
        onFocus?: (event: React.FocusEvent<SVGGElement>) => void;
        onBlur?: (event: React.FocusEvent<SVGGElement>) => void;
        style?: {
            default?: React.CSSProperties;
            hover?: React.CSSProperties;
            pressed?: React.CSSProperties;
        };
        className?: string;
        children?: React.ReactNode;
    }

    export const Marker: React.FC<MarkerProps>;
}
`,

    // --- 3. Fix GlobalMapWidget Types ---
    'frontend/src/pages/Compliance/components/GlobalMapWidget.tsx': `
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
                                <div className={\`text-sm font-bold leading-none mt-2 \${
                                    selectedCountry.riskLevel === 'High' ? 'text-red-400' : 
                                    selectedCountry.riskLevel === 'Medium' ? 'text-orange-400' : 'text-emerald-400'
                                }\`}>
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
`
};

// Execution
console.log("🚀 Fixing Compliance Errors...");

ensureDir(TYPES_PATH);
ensureDir(COMPLIANCE_PATH);

Object.entries(files).forEach(([fileName, content]) => {
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, content.trim());
    console.log(`✓ Updated: ${fileName}`);
});

console.log("\n✅ Type definitions created and imports fixed.");