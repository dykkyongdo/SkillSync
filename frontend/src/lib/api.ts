

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export async function api<T = any>(
    path: string,
    init: RequestInit = {}
):  Promise <T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init.headers || {}),
        },
        cache: "no-store",
    });
    if (!res.ok) {
        let msg = `HHTP ${res.status}`;
        try { const j = await res.json(); msg = j.message || msg; } catch {}
        throw new Error(msg);
    } 
    return res.status === 204 ? (undefined as T) : res.json();
}
