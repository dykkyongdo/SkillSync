"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useInvitationCount() {
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
        } catch {
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

    return { count, loading, refresh };
}
