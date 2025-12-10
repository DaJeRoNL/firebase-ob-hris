import { useState } from 'react';

export function useMapLogic() {
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

    return {
        hoveredCountry,
        setHoveredCountry
    };
}