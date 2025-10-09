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

    const remove = useCallback(async (groupId: string) => {
        console.log("useGroups remove: Starting deletion for groupId:", groupId);
        try {
            await api(`/api/groups/${groupId}`, { method: "DELETE" });
            console.log("useGroups remove: API call successful, updating state");
            setItems(prev => prev.filter(g => g.groupId !== groupId));
        } catch (error) {
            console.log("useGroups remove: API call failed:", error);
            throw error; // Re-throw to let the calling code handle it
        }
    }, []);

    return { items, loading, error, reload: load, create, remove};
}