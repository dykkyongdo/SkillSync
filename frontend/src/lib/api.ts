// Use local proxy in production to avoid mixed content issues
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

export const API_BASE = isProduction && isVercel 
    ? "" // Use relative URLs in production on Vercel (will go through our proxy)
    : (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080").replace(/\/$/, "");

// Debug logging
if (typeof window !== "undefined") {
    console.log("API_BASE:", API_BASE);
    console.log("NEXT_PUBLIC_API_BASE:", process.env.NEXT_PUBLIC_API_BASE);
    console.log("isProduction:", isProduction);
    console.log("isVercel:", isVercel);
}

function toUrl(path: string) {
    // If it's already a full URL, use it as-is
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    // If it starts with /, prepend API_BASE
    if (path.startsWith("/")) {
        return `${API_BASE}${path}`;
    }
    // Otherwise, prepend API_BASE with /
    const url = `${API_BASE}/${path}`;
    if (typeof window !== "undefined") {
        console.log("toUrl:", path, "->", url);
    }
    return url;
}

async function getToken(): Promise<string | null> {
    // Client only; we keep it simple. If you want SSR, move token to cookies and read via next/headers.
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem("token"); } catch { return null; }
}

export function isTokenExpired(token: string): boolean {
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
        
        // Dispatch a custom event to notify AuthContext
        window.dispatchEvent(new CustomEvent('token-cleared'));
    } catch {
        // Silent fail - token clearing is best effort
    }
}

// Track navigation state to prevent redirects during transitions
let isNavigating = false;
let navigationTimeout: NodeJS.Timeout | null = null;

export function setNavigationState(navigating: boolean) {
    isNavigating = navigating;
    
    // Clear any existing timeout
    if (navigationTimeout) {
        clearTimeout(navigationTimeout);
        navigationTimeout = null;
    }
    
    // Set a timeout to reset navigation state after 2 seconds
    if (navigating) {
        navigationTimeout = setTimeout(() => {
            isNavigating = false;
        }, 2000);
    }
}

export async function api<T = unknown>(
    path: string,
    init: RequestInit & { skipAuthRedirect?: boolean } = {}
): Promise<T> {
    const token = await getToken();
    
    
    const headers: Record<string,string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string,string>),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(toUrl(path), { ...init, headers, cache: "no-store" });

    if (!res.ok) {
        // Handle token expiration (401 Unauthorized or 403 Forbidden)
        if ((res.status === 401 || res.status === 403) && token && !init.skipAuthRedirect) {
            // Check if token is actually expired before redirecting
            if (isTokenExpired(token)) {
                // Don't redirect if we're currently navigating
                if (!isNavigating) {
                    // Clear expired token
                    clearExpiredToken();
                    
                    // Redirect to login if not already on auth pages
                    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
                        window.location.href = "/auth/login";
                        return Promise.reject(new Error("Token expired. Redirecting to login..."));
                    }
                }
            }
            // If token is not expired but API returned 401/403, it might be a server issue
            // Don't redirect in this case, just let the error bubble up
        }

        // Try to surface backend JSON error shape
        let message = `HTTP ${res.status}`;
        const ct = res.headers.get("content-type") || "";
        try {
        if (ct.includes("application/json")) {
            const j = await res.json() as Record<string, unknown>;
            
            // Handle validation errors from backend
            if (j.fields && Array.isArray(j.fields)) {
                const fieldErrors = (j.fields as Array<{field: string; message: string}>).map((field) => `${field.field}: ${field.message}`).join(', ');
                message = fieldErrors;
            }
            // Handle other error formats
            else if (j.message) {
                message = String(j.message);
            } else if (j.error) {
                message = String(j.error);
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