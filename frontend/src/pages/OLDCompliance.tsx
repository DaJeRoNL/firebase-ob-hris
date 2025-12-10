import { useMemo } from 'react';
import { MOCK_DB } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { IdentificationCard, Laptop } from '@phosphor-icons/react';

// Coordinates mapping (approximate)
const COUNTRY_COORDS: Record<string, { top: number, left: number }> = {
    "USA": { top: 35, left: 20 },
    "UK": { top: 22, left: 49 },
    "Philippines": { top: 45, left: 84 },
    "Brazil": { top: 68, left: 32 },
    "Germany": { top: 24, left: 52 },
};

export default function Compliance() {
  const { currentClientId } = useAuth();
  const people = useMemo(() => MOCK_DB.people.filter(p => p.clientId === currentClientId), [currentClientId]);

  // Derived stats
  const remoteCount = people.filter(p => p.loc !== 'USA' && p.loc !== 'UK').length;
  const hybridCount = people.length - remoteCount;

  // Group people by location for the dots
  const locCounts = people.reduce((acc, p) => {
    acc[p.loc] = (acc[p.loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8 text-gray-900 dark:text-gray-100 animate-fade-in space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-['Montserrat']">Global Compliance</h1>
        <p className="text-sm opacity-70">Workforce Distribution & Authorization</p>
      </header>

      {/* Map Container using new CSS classes */}
      <div className="map-card-container group">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" 
          className="map-image" 
          alt="World Map"
        />
        
        {/* Dynamic Dots */}
        {Object.entries(locCounts).map(([loc, count]) => {
            const coords = COUNTRY_COORDS[loc] || { top: 50, left: 50 };
            return (
                <div 
                    key={loc}
                    className="map-dot active" 
                    style={{ top: `${coords.top}%`, left: `${coords.left}%` }}
                    title={`${loc}: ${count} Employees`}
                >
                    {loc} ({count})
                </div>
            );
        })}
        
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-xs font-mono border border-white/10 text-white">
          Global Presence: Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <IdentificationCard size={20} className="text-indigo-500" /> Visa Status
          </h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {people.map(p => (
                <tr key={p.id}>
                  <td className="py-3 font-bold text-xs">{p.name}</td>
                  <td className="py-3 opacity-70 text-xs">{p.visa}</td>
                  <td className="py-3 text-right">
                    <span className={`pill ${p.visa === 'Citizen' ? 'pill-green' : 'pill-blue'}`}>
                      {p.visa === 'Citizen' ? 'Valid' : 'Check'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Laptop size={20} className="text-emerald-500" /> Remote Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-500/5 p-4 rounded-xl border border-gray-500/10">
              <div className="text-2xl font-bold">{remoteCount}</div>
              <div className="text-xs opacity-60">Remote</div>
            </div>
            <div className="bg-gray-500/5 p-4 rounded-xl border border-gray-500/10">
              <div className="text-2xl font-bold">{hybridCount}</div>
              <div className="text-xs opacity-60">Hybrid</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold">Equipment Deployed</span>
              <span className="opacity-60">100%</span>
            </div>
            <div className="w-full bg-gray-500/10 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}