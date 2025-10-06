export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080").replace(/\/$/, "");

function toUrl(path: string) {
    return /^https?:\/\//i.test(path) || path.startsWith("/") ? path : `${API_BASE}${path}`;
}

async function getToken(): Promise<string | null> {
    // Client only; we keep it simple. If you want SSR, move token to cookies and read via next/headers.
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem("token"); } catch { return null; }
}

export function clearExpiredToken(): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem("token");
        console.log("Expired token cleared from localStorage");
    } catch (error) {
        console.error("Failed to clear token:", error);
    }
}

export async function api<T = unknown>(
    path: string,
    init: RequestInit = {}
): Promise<T> {
    const token = await getToken();
    console.log(`=== API Request Debug ===`);
    console.log(`Request path: ${path}`);
    console.log(`Token found: ${token ? 'YES' : 'NO'}`);
    console.log(`Token preview: ${token ? (token.length > 20 ? token.substring(0, 20) + '...' : token) : 'null'}`);
    
    const headers: Record<string,string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string,string>),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    console.log(`Headers being sent:`, headers);
    console.log(`=== End API Debug ===`);

    const res = await fetch(toUrl(path), { ...init, headers, cache: "no-store" });

    if (!res.ok) {
        // Handle token expiration (401 Unauthorized or 403 Forbidden)
        if ((res.status === 401 || res.status === 403) && token) {
            // Clear expired token
            clearExpiredToken();
            
            // Redirect to login if not already on auth pages
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
                window.location.href = "/auth/login";
                return Promise.reject(new Error("Token expired. Redirecting to login..."));
            }
        }

        // Try to surface backend JSON error shape
        let message = `HTTP ${res.status}`;
        const ct = res.headers.get("content-type") || "";
        try {
        if (ct.includes("application/json")) {
            const j = await res.json() as any;
            
            // Handle validation errors from backend
            if (j.fields && Array.isArray(j.fields)) {
                const fieldErrors = j.fields.map((field: any) => `${field.field}: ${field.message}`).join(', ');
                message = fieldErrors;
            }
            // Handle other error formats
            else if (j.message) {
                message = j.message;
            } else if (j.error) {
                message = j.error;
            }
        } else {
            const text = await res.text();
            if (text) message = `${message} - ${text}`;
        }
        } catch {}
        throw new Error(message);
    }

    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
}