"use client"
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter  } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!token) router.replace("/login");
    }, [token, router]);

    if (!token) return null;
    return <>{children}</>;
}