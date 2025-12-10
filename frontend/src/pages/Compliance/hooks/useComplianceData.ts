import { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { MOCK_DB } from '../../../utils/mockData';
import { CountryData, AuditEvent, Person } from '../types';
import { getCountryCode } from '../utils';

export function useComplianceData() {
    const { currentClientId } = useAuth();
    
    // Local state for CRUD
    const [localPeople, setLocalPeople] = useState<Person[]>(() => 
        MOCK_DB.people.filter(p => p.clientId === currentClientId)
    );

    // 1. Derived Lists
    const remotePeople = useMemo(() => localPeople.filter(p => p.loc !== 'USA' && p.loc !== 'UK'), [localPeople]);
    const hybridPeople = useMemo(() => localPeople.filter(p => p.loc === 'USA' || p.loc === 'UK'), [localPeople]);
    const pendingReviews = useMemo(() => localPeople.filter(p => p.visa !== 'Citizen'), [localPeople]);

    // 2. Dynamic Score Calculation
    const complianceScore = useMemo(() => {
        if (localPeople.length === 0) return 100;
        // Simple algo: Percentage of users who don't have pending/critical status
        // For this mock, let's say "Citizen" is fully compliant (100%), others are 50% until reviewed
        const safeUsers = localPeople.filter(p => p.visa === 'Citizen').length;
        const reviewUsers = localPeople.length - safeUsers;
        
        // Weighted score: Safe = 1pt, Review = 0.5pt
        const rawScore = (safeUsers * 1) + (reviewUsers * 0.8); 
        return Math.round((rawScore / localPeople.length) * 100);
    }, [localPeople]);

    // 3. Map Stats
    const locationStats: CountryData[] = useMemo(() => {
        const counts = localPeople.reduce((acc, p) => {
            acc[p.loc] = (acc[p.loc] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, count]) => {
            const countryUsers = localPeople.filter(p => p.loc === name);
            let risk: 'Low' | 'Medium' | 'High' = 'Low';
            
            // Logic: If > 50% of users in a country are non-citizens, it's Medium risk
            const nonCitizens = countryUsers.filter(u => u.visa !== 'Citizen').length;
            if (nonCitizens > 0) risk = 'Medium';
            if (countryUsers.some(u => u.status === 'Inactive')) risk = 'High';

            return {
                name,
                count,
                coords: { top: 0, left: 0 }, 
                riskLevel: risk,
                isoCode: getCountryCode(name)
            };
        });
    }, [localPeople]);

    // 4. Actions
    const addUser = (person: Person) => {
        setLocalPeople(prev => [...prev, person]);
    };

    const removeUser = (id: string) => {
        setLocalPeople(prev => prev.filter(p => p.id !== id));
    };

    const auditLogs: AuditEvent[] = useMemo(() => {
        return [
            { id: 'ev-1', action: 'Data Export', user: 'Admin User', timestamp: '10:42 AM', status: 'Success', details: 'Payroll_Q3.csv exported' },
            { id: 'ev-2', action: 'Visa Check', user: 'System', timestamp: '09:15 AM', status: 'Warning', details: 'Expiring in 30 days: J. Doe' },
            { id: 'ev-3', action: 'Login Attempt', user: 'Unknown', timestamp: '03:00 AM', status: 'Error', details: 'Failed attempt from IP 192.168.x.x' },
        ] as AuditEvent[];
    }, []);

    const stats = {
        remote: remotePeople.length,
        hybrid: hybridPeople.length,
        total: localPeople.length,
        complianceScore,
        pendingReviewsCount: pendingReviews.length
    };

    return { 
        people: localPeople, 
        remotePeople, 
        hybridPeople, 
        pendingReviews, 
        locationStats, 
        stats, 
        auditLogs,
        addUser,
        removeUser
    };
}