"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useInvitationCount() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    
    const loadCount = useCallback(async () => {
        if (!isAuthenticated) {
            setCount(0);
            return;
        }
        
        setLoading(true);
        try {
            const invitations = await api<Array<{ membershipId: string }>>("/api/notifications/invitations", { method: "GET" });
            setCount(invitations.length);
        } catch (e: unknown) {
            console.error("Failed to load invitation count:", e);
            setCount(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => { 
        loadCount(); 
    }, [loadCount]);

    return { count, loading, refresh: loadCount };
}
