"use client"

import * as React from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import XpChart from "@/components/XpChart";
import { api } from "@/lib/api"

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader, 
    CardTitle,
} from "@/components/ui/card";

type Stats = { 
    xp: number;
    level: number;
    streakCount: number;
    masteredCards: number; 
    dueToday: number;
};

export default function DashboardPage() { 
    const [stats, setStats] = React.useState<Stats | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false; 
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await api<Stats>("/api/me/stats", { method: "GET" });
                if (!cancelled) setStats(data);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Failed to load dashboard");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Mock data
    const recentActivity = [
        {id: "1", when: "Today", text: "Reviewed 12 cards in “Biology - Cell Structure“" },
        {id: "2", when: "Yesterday", text: "Mastered 5 cards in “French Basics - A1“" },
        {id: "3", when: "2 days ago", text: "Reviewed 12 cards in “Biology - Cell Structure“" },
    ];

    return (
        <RequireAuth>
            <main className="relative isolate pt-14">
                {/* Background */}
                <div className="absolute inset-0 -z-10 bg-background"/>
                <div className=" absolute inset-0 -z-10 pointer-events-none
                    bg-[linear-gradient(to_right,var(--grid-line)_2px,transparent_2px),linear-gradient(to_bottom,var(--grid-line)_2px,transparent_2px)]
                    [background-size:var(--grid-size)_var(--grid-size)]"/>
                
                <section className="min-h-[calc(100vh-3.5rem)] px-4 py-8 relative z-0">
                    <div className="mx-auto max-w-6xl">
                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Dashboard</h1>
                                <p className="text-foreground/70 font-medium">Track your learning at a glance</p>
                            </div>

                            <Button asChild className="font-semibold border-2 border-border shadow-shadow bg-main text-main-foreground">
                                <Link href="/groups">View Groups</Link>
                            </Button>
                        </div> 

                        {/* Loading / Error */}
                        {loading && (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Card key={i} className="border-2 border-border shadow-shadow bg-secondary-background">
                                        <CardHeader className="animate-pulse">
                                            <div className="h-5 w-24 bg-foreground/10 rounded"/>
                                            <div className="mt-2 h-8 w-16 bg-foreground/10 rounded"/>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}
                        {error && (
                            <Card className="mb-6 border-2 border-border shadow-shadow bg-secondary-background">
                                <CardHeader>
                                    <CardTitle className="text-red-600">Error</CardTitle>
                                    <CardDescription className="font-medium">{error}</CardDescription>
                                </CardHeader>
                            </Card>
                        )}

                        {/* Stats */}
                        {!loading && !error && stats && (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                                    <StatCard label="XP" value={stats.xp} />
                                    <StatCard label="Level" value={stats.level} />
                                    <StatCard label="Streak" value={`${stats.streakCount}`} />
                                    <StatCard label="Mastered Cards" value={stats.masteredCards} />
                                    <StatCard label="Due Today" value={stats.dueToday} highlight />
                                </div>

                                {/* XP Chart and Quick Actions */}
                                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                                    <div className="lg:col-span-2">
                                        <XpChart />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <Card className="border-2 border-border shadow-shadow bg-secondary-background h-full">
                                            <CardHeader>
                                                <CardTitle className="font-semibold">Quick Actions</CardTitle>
                                                <CardDescription className="font-medium">Jump back into learning</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-col gap-3">
                                                    <Button asChild className="font-semibold border-2 border-border shadow-shadow">
                                                        <Link href="/groups">View Groups</Link>
                                                    </Button>
                                                    <Button asChild className="font-semibold border-2 border-border shadow-shadow">
                                                        <Link href="/notifications">Notifications</Link>
                                                    </Button>
                                                    {/* Add more quick actions later*/}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Recent activity */}
                                <div className="mt-8">
                                    <Card className="border-2 border-border shadow-shadow bg-secondary-background">
                                        <CardHeader>
                                            <CardTitle className="font-semibold">Recent Activity</CardTitle>
                                            <CardDescription className="font-medium">
                                                Your latest learning actions
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {recentActivity.map((it) => (
                                                    <li key={it.id} className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-1">
                                                        <span className="mt-0.5 inline-block rounded-base border-2 border-border bg-main px-2 py-0.5 text-xs font-semibold text-main-foreground shadow-shadow">
                                                            {it.when}
                                                        </span>
                                                        <span className="font-medium">{it.text}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>
        </RequireAuth>
    );

    function StatCard({
        label, 
        value, 
        highlight = false,
    }: {
        label: string;
        value: React.ReactNode;
        highlight?: boolean;
    }) {
        return (
            <Card className={["border-2 border-border shadow-shadow", highlight ? "bg-main text-main-foreground" : "bg-secondary-background", ].join(" ")}>
                <CardHeader>
                    <CardDescription className={[ "font-medium", highlight ? "text-main-foreground/90" : "text-foreground/70",].join(" ")}>
                        {label}
                    </CardDescription>
                    <CardTitle className="font-semibold text-3xl leading-tight">{value}</CardTitle>
                </CardHeader>
            </Card>
        );
    }
}