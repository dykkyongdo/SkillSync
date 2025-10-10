"use client"
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, token } = useAuth();
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        // Only redirect if:
        // 1. We're on client-side
        // 2. We have no token at all (not just temporarily false during hydration)
        // 3. We haven't already redirected in this session
        if (typeof window !== "undefined" && !token && !hasRedirected) {
            console.log("RequireAuth: No token found, redirecting to login");
            setHasRedirected(true);
            router.replace("/auth/login");
        }
    }, [token, hasRedirected, router]);

    // Show children if we have a token, or if we're still on server-side
    if (typeof window === "undefined" || token) {
        return <>{children}</>;
    }

    // Show nothing while redirecting
    return null;
}