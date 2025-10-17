"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { FlashcardSet } from "@/types";

export function useSingleSet(setId: string) {
    const [item, setItem] = useState<FlashcardSet | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!setId || setId === "undefined") {
            setItem(null);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const set = await api<FlashcardSet>(`/api/flashcard-sets/${setId}`);
            setItem(set);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "An error occurred");
            setItem(null);
        } finally {
            setLoading(false);
        }
    }, [setId]);

    useEffect(() => {
        load();
    }, [load]);

    return { item, error, loading, reload: load };
}
