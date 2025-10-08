"use client"
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter  } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log("RequireAuth: isAuthenticated =", isAuthenticated);
        console.log("RequireAuth: Current URL =", window.location.pathname);
        if (!isAuthenticated) {
            console.log("RequireAuth: Redirecting to login");
            router.replace("/auth/login");
        } else {
            console.log("RequireAuth: User is authenticated, rendering children");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        console.log("RequireAuth: Not authenticated, returning null");
        return null;
    }
    console.log("RequireAuth: Rendering protected content");
    return <>{children}</>;
}