import { CountryData } from '../../types';

interface Props {
    data: CountryData;
    isSelected?: boolean;
    onClick: (e: React.MouseEvent) => void;
}

export default function MapDot({ data, isSelected, onClick }: Props) {
    const isHighRisk = data.riskLevel === 'High';
    const isMediumRisk = data.riskLevel === 'Medium';
    
    const baseColor = isHighRisk ? 'bg-rose-500' : isMediumRisk ? 'bg-amber-400' : 'bg-indigo-500';
    const shadowColor = isHighRisk ? 'shadow-rose-500' : isMediumRisk ? 'shadow-amber-400' : 'shadow-indigo-500';
    const ringColor = isHighRisk ? 'border-rose-500' : isMediumRisk ? 'border-amber-400' : 'border-indigo-500';

    return (
        <div 
            onClick={onClick}
            className="absolute group cursor-pointer z-10 flex flex-col items-center justify-center"
            style={{ 
                top: `${data.coords.top}%`, 
                left: `${data.coords.left}%`,
                transform: 'translate(-50%, -50%)' 
            }}
        >
            {/* INVISIBLE HITBOX (Larger Area) */}
            <div className="absolute w-10 h-10 bg-transparent rounded-full z-0"></div>

            {/* Selection Reticle */}
            {isSelected && (
                <div className="absolute pointer-events-none z-10">
                    <div className="absolute inset-0 -m-3 border border-white/30 rounded-full w-[calc(100%+24px)] h-[calc(100%+24px)] animate-ping-slow"></div>
                    <div className="absolute inset-0 -m-1.5 border border-white rounded-full w-[calc(100%+12px)] h-[calc(100%+12px)]"></div>
                </div>
            )}

            {/* Pulse */}
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${baseColor} z-10`} style={{ animationDuration: '3s' }}></div>
            
            {/* The Dot */}
            <div className={`relative w-2.5 h-2.5 rounded-full ${baseColor} shadow-[0_0_10px_0px] ${shadowColor} border border-white/10 ring-1 ${ringColor} ring-opacity-20 transition-all duration-300 group-hover:scale-150 z-20`} />

            {/* Tooltip */}
            <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                <span className="text-[10px] font-bold text-white bg-[#0f172a] px-2 py-1 rounded-md border border-white/10 whitespace-nowrap shadow-xl">
                    {data.name}
                </span>
            </div>
        </div>
    );
}