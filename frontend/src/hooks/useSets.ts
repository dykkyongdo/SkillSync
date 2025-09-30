"use client"; 
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { FlashcardSet, Page } from "@/types";

export function useSets(groupId: string) {
    const [items, setItems] = useState<FlashcardSet[]>([]);
    const [error, setError] = useState<string|null>(null); 
    
    const load = useCallback(async () => {
        setError(null); 
        try {
            const page = await api<Page<FlashcardSet>>(`/api/groups/${groupId}/sets?page=0&size=20`);
            setItems(page.content);
        } catch (e:any) { setError(e.message); }
    }, [groupId]);

    useEffect(() => { if (groupId) load(); }, [groupId, load]);

    const create = useCallback(async (title: string, description: string) => {
        const created = await api<FlashcardSet>(`/api/groups/${groupId}/sets`, {
            method: "POST",
            body: JSON.stringify({ title, description }),
        });
        setItems(prev => [created, ...prev]);
        return created; 
    }, [groupId]);

    return { items, error, reload: load, create}; 
}