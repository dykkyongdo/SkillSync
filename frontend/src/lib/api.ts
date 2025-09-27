export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080").replace(/\/$/, "");

async function getAuthToken(): Promise<string | null> {
    if (typeof window === "undefined") {
        // Server: read from cookies
        const { cookies } = await import("next/headers");
        return cookies().get("token")?.value ?? null;
    }
    // Client 
    try {
        return localStorage.getItem("token");
    } catch {
        return null;
    }
}

function toUrl(path: string) {
    return /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;
}


export async function api<T = any>(
    path: string,
    init: RequestInit = {}
):  Promise <T> {
    const token = await getAuthToken();
    const res = await fetch(toUrl(path), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init.headers || {}),
        },
        cache: "no-store",
    });
    if (!res.ok) {
        if (res.status === 401 && typeof window !== "undefined") { localStorage.removeItem("token");
        }
        let msg = `HTTP ${res.status}`;
        try { 
            // Try Json error first
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
                const j = await res.json(); 
                msg = j.message || msg; 
            } else {
                // Fallback to text body
                const text = await res.text();
                if (text) msg = `${msg} - ${text}`;
            }
        } catch {}
        throw new Error(msg);
    } 
    if (res.status === 204) return undefined as T;

    // Safely parse JSON 
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
}
