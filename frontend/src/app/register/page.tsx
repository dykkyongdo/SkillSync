"use client";
import { useState } from "react"; 
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function RegisterPage() { 
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try { 
      const res = await api<{ token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({email, password}),
      });
      login(res.token);
      router.push("/groups");
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold">Create Account</h1>
        <input className="w-full border p-2 rounded" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="w-full border p-2 rounded" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="w-full p-2 rounded bg-black text-white">Register</button>
      </form>
    </main>
  )
}