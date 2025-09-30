"use client"
import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export type DueCard = { flashcardId: string; question: string; answer: string };
export type ReviewReq = { grade: 0|1|2|3 };

export function useStudy(setId: string) { 
    const [queue, setQueue] = useState<DueCard[]>([]);
    const [error, setError] = useState<string|null>(null);

    const load = useCallback(async  (limit = 10) => {
        setError(null);
        try {
            const cards = await api<DueCard[]>(`/api/sets/${setId}/study/due?limit=${limit}`);
            setQueue(cards);
        } catch (e:any) { setError(e.message); }
    }, [setId]);

    const grade = useCallback(async (flashcardId: string, grade: 0|1|2|3) => {
        setError(null);
        await api(`/api/sets/${setId}/study/${flashcardId}/review`, {
            method: "POST",
            body: JSON.stringify({ grade } satisfies ReviewReq), 
        });
        setQueue(q => q.filter(c => c.flashcardId !== flashcardId));
    }, [setId]);
    
    return { queue, error, load, grade };
}
