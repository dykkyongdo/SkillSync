"use client"
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import RequireAuth from "@/app/components/RequireAuth";

type Group = { id: string, name: string, description: string, createdAt: string };

export default function GroupPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [err, setErr] = useState<string | null>(null); 

    async function load() {
        try {
            const data = await api<Group[]>("/api/groups/my-groups");
            setGroups(data);
        } catch (e: any) { setErr(e.message); }
    }
    useEffect(() => { load(); }, []);

    async function createGroup() {
        setErr(null);
        try {
            const g = await api<Group>("/api/groups/create", {
                method: "POST",
                body: JSON.stringify({ name, description: desc }),
        });
        setGroups([g, ...groups]);
        setName(""); setDesc("");
        }  catch (e: any) { setErr(e.message); }
    }

    return (
        <RequireAuth>
            <main className="p-6 space-y-6 max-w-3xl mx-auto">
                <h1 className="text-2xl font-semibold">My Groups</h1>
                <div className="grid gap-2 md:grid-cols-3">
                    <input className="border p-2 rounded" placeholder="Group name" value={name} onChange={e=>setName(e.target.value)}/>
                    <input className="border p-2 rounded md:col-span=2" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)}/>
                    <button onClick={createGroup} className="p-2 rounded bg-black text-white md:col-span-3">Create</button>
                </div>

                {err && <p className="text-red-600 text-sm">{err}</p>}

                <ul className="space-y-3">
                    {groups.map(g => (
                        <li key={g.id} className="p-4 rounded-xl border">
                            <div className="font-medium">{g.name}</div>
                            <div className="text-sm opacity-80">{g.description}</div>
                        </li>
                    ))}
                </ul>
            </main>
        </RequireAuth>
    )
}