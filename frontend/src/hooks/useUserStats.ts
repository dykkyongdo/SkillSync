import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface UserStats {
    xp: number;
    level: number;
    streakCount: number;
    lastStudyDate: string | null;
    progressInLevel: number;
    xpNeededForNextLevel: number;
    progressPercentage: number;
    masteredCards: number;
    dueToday: number;
}

export function useUserStats() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            setError(null);
            const userStats = await api<UserStats>("/api/me/stats");
            setStats(userStats);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    return { stats, error, loading, refetch: loadStats };
}
