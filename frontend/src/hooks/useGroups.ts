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
        if (!isAuthenticated) return;
        setLoading(true); setError(null);
        try {
            const data = await api<Group[]>("/api/groups/my-groups");
            setItems(data);
        } catch (e: unknown) { setError(e instanceof Error ? e.message : "An error occurred"); }
        finally { setLoading(false); }
    }, [isAuthenticated]);

    useEffect(() => { load(); }, [load]);

    const create = useCallback(async (name: string, description: string) => {
        const g = await api<Group>("/api/groups/create", {
            method: "POST", 
            body: JSON.stringify({ name, description }),
        });
        setItems(prev => [g, ...prev]);
        return g;
    }, []);

    const remove = useCallback(async (groupId: string) => {
        await api(`/api/groups/${groupId}`, { method: "DELETE" });
        setItems(prev => prev.filter(g => g.groupId !== groupId));
    }, []);

    return { items, loading, error, reload: load, create, remove};
}