import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Flashcard, Page } from "@/types";

export function useCards(setId: string) {
    const [items, setItems] = useState<Flashcard[]>([]);
    const [error, setError] = useState<string|null>(null);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    const load = useCallback(async () => {
        setError(null);
        try {
            // Debug logging removed for production("Loading flashcards for set:", setId);
            const page = await api<Page<Flashcard>>(`/api/flashcards/set/${setId}?page=0&size=50`);
            // Debug logging removed for production("Loaded flashcards:", page.content);
            // Debug logging removed for production("Total flashcards in set:", page.totalElements);
            setItems(page.content);
        } catch(e: unknown) { 
            setError(e instanceof Error ? e.message : "An error occurred"); 
        }
    }, [setId]);

    useEffect(() => { if (setId) load(); }, [setId, load]);

    const create = useCallback(async (question: string, answer: string, explanation?: string, difficulty: number = 1, tags: string[] = []) => {
        const created = await api<Flashcard>(`/api/flashcards`, {
            method: "POST",
            body: JSON.stringify({ 
                question, 
                answer, 
                explanation,
                difficulty,
                tags,
                setId 
            }),
        });
        setItems(prev => [created, ...prev]);
        return created;
    }, [setId]);
    
    const remove = useCallback(async (cardId: string) => {
        // Prevent multiple delete requests for the same card
        if (deletingIds.has(cardId)) {
            // Debug logging removed for production("Card already being deleted, skipping duplicate request");
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
                // Debug logging removed for production("Card was already deleted, treating as success");
                return; // Success - card is gone
            }
            
            // For other errors, restore the card to the UI and provide better error message
            console.error("Failed to delete card:", error);
            
            // Reload the list to restore the card
            load();
            
            // Provide a more user-friendly error message
            if (error.message.includes("unexpected error")) {
                throw new Error("Failed to delete card: The card may be in use by study sessions. Please try again.");
            }
            
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