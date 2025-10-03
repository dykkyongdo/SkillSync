"use client"
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Group } from "@/types";

export function useGroups() {
    const [items, setItems] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const { isAuthenticated } = useAuth();
    
    const load = useCallback(async () => {
        if (!isAuthenticated) {
            console.log("useGroups: Not authenticated, skipping load");
            return;
        }
        
        console.log("useGroups: Authenticated, loading groups");
        setLoading(true), setError(null);
        try {
            const data = await api<Group[]>("/api/groups/my-groups");
            setItems(data);
        } catch (e:any) { setError(e.message); }
        finally { setLoading(false); }
    }, [isAuthenticated]);

    useEffect(() => { 
        console.log("useGroups: useEffect triggered, isAuthenticated:", isAuthenticated);
        load(); 
    }, [load]);

    const create = useCallback(async (name: string, description: string) => {
        const g = await api<Group>("/api/groups/create", {
            method: "POST", 
            body: JSON.stringify({ name, description }),
        });
        setItems(prev => [g, ...prev]);
        return g;
    }, []);

    return { items, loading, error, reload: load, create};
}