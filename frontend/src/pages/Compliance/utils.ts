import { MapCoordinate } from './types';

// ISO 3166-1 alpha-2 codes (Lowercase is required for FlagCDN)
export const COUNTRY_CODES: Record<string, string> = {
    "USA": "us",
    "United States": "us",
    "UK": "gb",
    "United Kingdom": "gb",
    "Philippines": "ph",
    "Brazil": "br",
    "Germany": "de",
    "Australia": "au",
    "India": "in",
    "Canada": "ca",
    "France": "fr",
    "Japan": "jp",
    "China": "cn",
    "Singapore": "sg",
    "Netherlands": "nl"
};

export const getCountryCode = (country: string): string => {
    return COUNTRY_CODES[country] || "un"; 
};

export const getRiskLevel = (country: string): 'Low' | 'Medium' | 'High' => {
    if (country === 'Philippines' || country === 'India') return 'Medium';
    if (country === 'Brazil') return 'High';
    return 'Low';
};

// Legacy coords (kept just in case, but map uses vector now)
export const COUNTRY_COORDS: Record<string, MapCoordinate> = {
    "Unknown": { top: 50, left: 50 }
};
export const getCoordinates = (country: string): MapCoordinate => {
    return COUNTRY_COORDS[country] || COUNTRY_COORDS["Unknown"];
};