"use client"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RequireAuth from "@/app/components/RequireAuth";
import { api } from "@/lib/api";

type DueCard = { flashcardId: string; question: string; answer: string};
type ReviewReq = { grade: number };

export default function StudyPage() {
    const { setId } = useParams<{ setId: string }>();
    const [queue, setQueue] = useState<DueCard[]>([]);
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        setErr(null);
        try {
            const cards = await api<DueCard[]>('/api/sets/${setId}/study/due?limit=10');
            setQueue(cards);
        } catch (e: any) { setErr(e.message); }
    }
    useEffect(() => { load(); }, [setId]);

    async function gradeCard(cardId: string, grade: number) {
        setErr(null);
        try {
            await api('/api/sets/${setId}/study/${cardId}/review', {
                method: "POST",
                body: JSON.stringify({ grade } satisfies ReviewReq),
            });
            setQueue(q => q.filter(c => c.flashcardId !== cardId));
            if (queue.length <= 1) load();
        } catch (e: any) { setErr(e.message); }
    }
    const current = queue[0];

    return (
    <RequireAuth>
        <main className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Study</h1>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {!current ? (
            <p className="opacity-70">No due cards.</p>
        ) : (
            <div className="p-6 rounded-2xl border space-y-4">
            <div className="text-lg font-medium">{current.question}</div>
            <details className="rounded border p-3">
                <summary className="cursor-pointer">Show answer</summary>
                <div className="mt-2">{current.answer}</div>
            </details>
            <div className="flex gap-2">
                {[0,1,2,3].map(g => (
                <button
                    key={g}
                    onClick={() => gradeCard(current.flashcardId, g)}
                    className="px-3 py-2 rounded border"
                    title={["Again","Hard","Good","Easy"][g]}
                    >
                    {["Again","Hard","Good","Easy"][g]}
                    </button>
                ))}
                </div>
            </div>
            )}
        </main>
        </RequireAuth>
    );
}
