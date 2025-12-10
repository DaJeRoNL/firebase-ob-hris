import { getCountryCode } from '../../utils';

export default function FlagDot({ country, size = 'sm' }: { country: string, size?: 'sm' | 'md' }) {
    const code = getCountryCode(country).toLowerCase();
    const dim = size === 'md' ? 'w-6 h-6' : 'w-4 h-4';
    
    return (
        <div className={`${dim} rounded-full overflow-hidden border border-white/20 shadow-sm shrink-0 inline-block align-middle`}>
            <img 
                src={`https://flagcdn.com/w40/${code}.png`} 
                alt={country}
                className="w-full h-full object-cover scale-150"
            />
        </div>
    );
}