"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useInvitationCount() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    
    const loadCount = async () => {
        console.log("loadCount called, isAuthenticated:", isAuthenticated);
        if (!isAuthenticated) {
            console.log("Not authenticated, setting count to 0");
            setCount(0);
            return;
        }
        
        setLoading(true);
        try {
            const response = await api<{ count: number }>("/api/notifications/invitations/count", { method: "GET" });
            console.log("Invitation count response:", response);
            console.log("Setting count to:", response.count);
            setCount(response.count);
        } catch (e: unknown) {
            console.error("Failed to load invitation count:", e);
            console.log("Setting count to 0 due to error");
            setCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        loadCount(); 
    }, [isAuthenticated]);

    // Force refresh function that always triggers a re-render
    const refresh = () => {
        console.log("Manual refresh called");
        loadCount();
    };

    return { count, loading, refresh };
}
