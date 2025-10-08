"use client"
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Flashcard, Page } from "@/types";
import { resolve } from "path";

export function useCards(setId: string) {
    const [items, setItems] = useState<Flashcard[]>([]);
    const [error, setError] = useState<string|null>(null);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    const load = useCallback(async () => {
        setError(null);
        try {
            const page = await api<Page<Flashcard>>(`/api/flashcards/set/${setId}?page=0&size=50`);
            setItems(page.content);
        } catch(e:any) { 
            setError(e.message); 
        }
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
        // Prevent multiple delete requests for the same card
        if (deletingIds.has(cardId)) {
            console.log("Card already being deleted, skipping duplicate request");
            return;
        }

        // Mark as being deleted
        setDeletingIds(prev => new Set(prev).add(cardId));
        
        // Optimistically remove from UI immediately
        setItems(prev => prev.filter(c => c.id !== cardId));

        try {
            await api(`/api/flashcards/${cardId}`, { method: "DELETE" });
        } catch (err) {
            // If the card was already deleted (404/not found), that's actually success
            const error = err as Error;
            if (error.message.includes("not found") || error.message.includes("Flashcard not found")) {
                console.log("Card was already deleted, treating as success");
                return; // Success - card is gone
            }
            
            // For other errors, restore the card to the UI
            console.error("Failed to delete card:", error);
            // Reload the list to restore the card
            load();
            throw err;
        } finally {
            // Remove from deleting set
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(cardId);
                return newSet;
            });
        }
    }, [deletingIds, load]);

    return { items, error, reload: load, create, remove, deletingIds };
}