"use client"
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Flashcard, Page } from "@/types";
import { resolve } from "path";

export function useCards(setId: string) {
    const [items, setItems] = useState<Flashcard[]>([]);
    const [error, setError] = useState<string|null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const page = await api<Page<Flashcard>>(`/api/flashcards/set/${setId}?page=0&size=50`);
            setItems(page.content);
        } catch(e:any) { setError(e.message); }
    }, [setId]);

    useEffect(() => { if (setId) load(); }, [setId, load]);

    const create = useCallback(async (question: string, answer: string) => {
        const created = await api<Flashcard>(`/api/flashcards`, {
            method: "POST",
            body: JSON.stringify({ question, answer, setId }),
        });
        setItems(prev => [created, ...prev]);
        return created;
    }, [setId]);
    
    const remove = useCallback(async (cardId: string) => {
        await api(`/api/flashcards/${cardId}`, { method: "DELETE" });
        setItems(prev => prev.filter(c => c.id !== cardId));
    }, []);

    return { items, error, reload: load, create, remove };
}