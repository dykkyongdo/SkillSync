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
            const page = await api<Page<FlashcardSet>>(`/api/flashcard-sets/group/${groupId}?page=0&size=20`);
            setItems(page.content);
        } catch (e:any) { setError(e.message); }
    }, [groupId]);

    useEffect(() => { if (groupId) load(); }, [groupId, load]);

    const create = useCallback(async (title: string, description: string) => {
        const created = await api<FlashcardSet>(`/api/flashcard-sets`, {
            method: "POST",
            body: JSON.stringify({ title, description, groupId }),
        });
        setItems(prev => [created, ...prev]);
        return created; 
    }, [groupId]);

    const remove = useCallback(async (setId: string) => {
        await api(`/api/flashcard-sets/${setId}`, { method: "DELETE" });
        setItems(prev => prev.filter(s => s.id !== setId));
    }, []);

    return { items, error, reload: load, create, remove}; 
}