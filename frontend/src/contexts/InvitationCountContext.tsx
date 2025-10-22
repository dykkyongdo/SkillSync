"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface InvitationCountContextType {
    count: number;
    loading: boolean;
    refresh: () => void;
}

const InvitationCountContext = createContext<InvitationCountContextType | undefined>(undefined);

export function InvitationCountProvider({ children }: { children: React.ReactNode }) {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { isAuthenticated } = useAuth();
    
    const loadCount = useCallback(async () => {
        if (!isAuthenticated) {
            setCount(0);
            return;
        }
        
        setLoading(true);
        try {
            const response = await api<{ count: number }>("/api/notifications/invitations/count", { method: "GET" });
            setCount(response.count);
        } catch (e: unknown) {
            setCount(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => { 
        loadCount(); 
    }, [isAuthenticated, loadCount, refreshTrigger]);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <InvitationCountContext.Provider value={{ count, loading, refresh }}>
            {children}
        </InvitationCountContext.Provider>
    );
}

export function useInvitationCount() {
    const context = useContext(InvitationCountContext);
    if (context === undefined) {
        throw new Error('useInvitationCount must be used within an InvitationCountProvider');
    }
    return context;
}
