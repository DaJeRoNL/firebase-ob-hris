export interface ComplianceStat {
    label: string;
    value: string | number;
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
}

export interface MapCoordinate {
    top: number;
    left: number;
}

export interface CountryData {
    name: string;
    count: number;
    coords: MapCoordinate;
    riskLevel: 'Low' | 'Medium' | 'High';
    isoCode?: string; // Added for vector map matching
}

export interface AuditEvent {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    status: 'Success' | 'Warning' | 'Error';
    details: string;
}

export type VisaCategory = 'H1B' | 'L1' | 'T2_General' | 'Blue_Card' | 'S_Pass';

export interface VisaRule {
    id: VisaCategory;
    label: string;
    maxDuration: string;
    description: string;
    requirements: string[];
}

export interface Person {
    clientId: string;
    id: string;
    name: string;
    role: string;
    status: 'Active' | 'Onboarding' | 'Inactive';
    loc: string;
    visa: string;
}