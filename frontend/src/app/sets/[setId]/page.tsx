"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RequireAuth from "@/app/components/RequireAuth";
import { api } from "@/lib/api";
import Link from "next/link";

type Card = { id: string; question: string; answer: string };
type Page<T> = { content: T[] };

export default function CardPage() {
    const { groupId, setId } = useParams<{ groupId: string; setId: string; }>();
    const [cards, setCards] = useState<Card[]>([]);
    const [q, setQ] = useState("");
    const [a, setA] = useState("");
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        setErr(null);
        try {
            const page = await api<Page<Card>>(`/api/sets/${setId}/cards?page=0&size=50`);
            setCards(page.content);
        } catch (e: any) { setErr(e.message); }
    }
    useEffect(() => { load(); }, [setId]);

    async function createCard() {
        setErr(null);
        try {
            const created = await api<Card>(`/api/sets/${setId}`, {
                method: "POST", 
                body: JSON.stringify({ question: q, answer: a}),
            });
            setCards([created, ...cards]);
            setQ(""); setA("");
        } catch (e: any) { setErr(e.message); }
    }

    async function deletedCard(id: string) {
        setErr(null);
        try {
            await api(`/api/cards/${id}`, { method: "DELETE" });
            setCards(cs => cs.filter(c => c.id !== id));
        } catch (e:any) { setErr(e.message); }
    }

    return (
        <RequireAuth> 
            <main className="p-6 space-y-6 max-w-3xl mx-auto">
                <Link href={`/groups/${groupId}`} className="text-sm underline">← Back to sets</Link>
                <h1 className="text-2xl font-semibold">Cards</h1>

                <div className="grid gap-2">
                    <input className="border p-2 rounded" placeholder="Question" value={q} onChange={e=>setQ(e.target.value)}/>
                    <input className="border p-2 rounded" placeholder="Answer" value={a} onChange={e=>setA(e.target.value)}/>
                    <button onClick={createCard} className="p-2 rounded bg-black text-white">Add Card</button>
                </div>

                {err && <p className="text-sm text-red-600">{err}</p>}

                <ul className="space-y-3">
                    {cards.map(c => (
                        <li key={c.id} className="p-4 border rounded-xl">
                            <div className="font-medium">{c.question}</div>
                            <div className="mt-2 flex gap-2">
                                <button onClick={() => deletedCard(c.id)} className="text-sm underline">Delete</button>
                                <Link className="text-sm underline" href={`/study/${setId}`}>Study this set</Link>
                            </div>
                        </li> 
                    ))}
                </ul>
            </main>
        </RequireAuth>
    )
}