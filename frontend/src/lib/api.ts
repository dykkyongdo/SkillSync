export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080").replace(/\/$/, "");

function toUrl(path: string) {
    return /^https?:\/\//i.test(path) || path.startsWith("/") ? path : `${API_BASE}${path}`;
}

async function getToken(): Promise<string | null> {
    // Client only; we keep it simple. If you want SSR, move token to cookies and read via next/headers.
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem("token"); } catch { return null; }
}

function isTokenExpired(token: string): boolean {
    try {
        // JWT tokens have 3 parts separated by dots
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        
        // Decode the payload (second part)
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        // Check if token is expired (exp field is in seconds)
        return payload.exp < now;
    } catch {
        return true; // If we can't parse it, consider it expired
    }
}

export function clearExpiredToken(): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem("token");
        // Also clear the cookie
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        console.log("Expired token cleared from localStorage and cookies");
    } catch (error) {
        console.error("Failed to clear token:", error);
    }
}

export async function api<T = unknown>(
    path: string,
    init: RequestInit = {}
): Promise<T> {
    const token = await getToken();
    
    const headers: Record<string,string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string,string>),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(toUrl(path), { ...init, headers, cache: "no-store" });

    console.log(`API ${init.method || 'GET'} ${path}: Status ${res.status}`);

    if (!res.ok) {
        console.log(`API ${init.method || 'GET'} ${path}: Error response`, res.status, res.statusText);
        // Handle token expiration (401 Unauthorized or 403 Forbidden)
        if ((res.status === 401 || res.status === 403) && token) {
            console.log("API: Token expired or unauthorized, clearing token and redirecting");
            // Clear expired token
            clearExpiredToken();
            
            // Redirect to login if not already on auth pages
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
                console.log("API: Redirecting to login page");
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
    if (!text) return undefined as T;
    
    // Check if response is JSON
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return JSON.parse(text) as T;
    }
    
    // Return text response as-is for non-JSON responses (like DELETE success messages)
    return text as T;
}