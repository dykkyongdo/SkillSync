"use client"
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Track when we're on client-side
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Don't do anything on server-side
        if (!isClient) return;
        
        // Reset redirect flag if user becomes authenticated
        if (isAuthenticated && hasRedirected) {
            setHasRedirected(false);
            
            // If we're on the login page but now authenticated, redirect to groups
            if (window.location.pathname === "/auth/login") {
                router.replace("/groups");
            }
            return;
        }
        
        // Only redirect if:
        // 1. We're on client-side
        // 2. We're not authenticated 
        // 3. We haven't already redirected in this session
        if (!isAuthenticated && !hasRedirected) {
            setHasRedirected(true);
            router.replace("/auth/login");
        }
    }, [isAuthenticated, hasRedirected, router, isClient]);

    // Show children if we're authenticated, or if we're still on server-side
    if (!isClient || isAuthenticated) {
        return <>{children}</>;
    }

    // Show nothing while redirecting
    return null;
}