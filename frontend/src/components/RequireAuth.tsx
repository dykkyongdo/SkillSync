"use client"
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter  } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/auth/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }
    return <>{children}</>;
}