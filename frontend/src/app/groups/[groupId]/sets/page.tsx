"use client"
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import Link from "next/link";

type SetItem = { id: string; title: string; description: string; createdAt: string};
type Page<T> = { content: T[] };

export default function GroupSetPage() {
    const { groupId } = useParams<{ groupId: string }>();
    const router = useRouter();
    const [sets, setSets] = useState<SetItem[]>([]);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        try {
            const page = await api<Page<SetItem>>(`/api/groups/${groupId}/sets?page=0&size=20`);
            setSets(page.content);
        } catch (e: any) { setErr(e.message); }
    }
    useEffect(() => { load(); }, [groupId]);

    async function createSet() {
        setErr(null);
        try {
            const created = await api<SetItem>(`/api/groups/${groupId}/sets`, {
                method: "POST",
                body: JSON.stringify({ title, description: desc}),
            });
            setSets([created, ...sets]);
            setTitle(""); setDesc("");
        } catch (e: any) { setErr(e.message); }
    }

    return (
        <RequireAuth>
            <main className="p-6 space-y-6 max-w-3xl mx-auto">
                <button className="text-sm underline" onClick={() => router.push("/groups")}>← Back</button>
                <h1 className="text-2xl font-semibold">Flashcard Sets</h1>
                <div className="grid gap-2 md:grid-cols-3">
                    <input className="border p-2 rounded" placeholder="Set title" value={title} onChange={e=>setTitle(e.target.value)}/>
                    <input className="border p-2 rounded md:col-span-2" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)}/>
                    <button onClick={createSet} className="p-2 rounded bg-black text-white md:col-span-3">Create set</button>
                </div>
                {err && <p className="text-red-600 text-sm">{err}</p>}
                <ul className="space-y-3">
                    {sets.map(s => (
                        <li key={s.id} className="p-4 rounded-xl border">
                            <div className="font-medium">{s.title}</div>
                            <div className="text-sm opacity-80">{s.description}</div>
                            <div className="mt-3 flex gap-2">
                                <Link className="underline text-sm" href={`/groups/${groupId}/sets/${s.id}`}>Manage Cards</Link>
                                <Link className="underline text-sm" href={`/study/${s.id}`}>Study</Link>
                            </div>
                        </li> 
                    ))}
                </ul>
            </main>
        </RequireAuth>
    )
}
