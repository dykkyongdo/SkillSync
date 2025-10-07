"use client"

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft, Award, Crown, Medal } from "lucide-react";

type Entry = { 
    userId: string; 
    email: string; 
    xp: number;
};

type Me = {
    id: string;
    email: string;
    name?: string;
};

export default function WeeklyLeaderboardPage() { 
    const params = useParams();
    const groupId = params.groupId as string;

    const [entries, setEntries] = React.useState<Entry[]>([]);
    const [me, setMe] = React.useState<Me | null>(null);
    const [loading, setLoading] = React.useState(true); 
    const [error, setError] = React.useState <string | null>(null);

    React.useEffect(() => {
        let cancel = false; 

        async function load() {
            try {
                setLoading(true); 
                setError(null);

                const [list, meRes] = await Promise.all([
                    api<Entry[]>(`/api/groups/${groupId}/leaderboard/weekly`, { method: "GET" }),
                    // best effort for current user (for highlighting)
                    api<Me>("/api/me", { method: "GET" }).catch(() => null as any),
                ]);

                if (!cancel) { 
                    setEntries(Array.isArray(list) ? list : []);
                    setMe(meRes);
                }
            } catch (e: any) {
                if (!cancel) setError(e?.message ?? "Failed to load leaderboard");
            } finally {
                if (!cancel) setLoading(false);
            }
        }

        if (groupId) load();
        return () => {
            cancel = true;
        };
    }, [groupId]);

    const myEmail = me?.email?.toLowerCase();

    return (
        <RequireAuth>
            <main className="relative isolate pt-14">
                {/* Background */}
                <div className="absolute inset-0 -z-10 bg-background"/>
                <div className="
                    absolute inset-0 -z-10 pointer-events-none
                    bg-[linear-gradient(to_right,var(--grid-line)_2px,transparent_2px),linear-gradient(to_bottom,var(--grid-line)_2px,transparent_2px)]
                    [background-size:var(--grid-size)_var(--grid-size)]
                "/>
                
                <section className="min-h-[calc(100vh-3.5rem)] px-4 py-8 relative z-0">
                    <div className="mx-auto max-w-3xl">
                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Button asChild value="neutral" className="border-2 border-border shadow-shadow">
                                    <Link href={`/groups/${groupId}`}>
                                        <ArrowLeft className="w-4 h-4 mr-2"/>
                                        Back to Group
                                    </Link>
                                </Button>

                                <div>
                                    <h1 className="font-bold text-3xl">Weekly Leaderboard</h1>
                                    <p className="text-foreground/70 font-medium">Top performers this week</p>
                                </div>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <Card className="border-2 border-border shadow-shadow bg-secondary-background">
                                <CardHeader>
                                    <CardTitle className="font-semibold">Loading leaderboard...</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 animate-pulse">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-10 w-full bg-foreground/10 rounded"/>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <Card className="border-2 border-border shadow-shadow bg-secondary-background">
                                <CardHeader>
                                    <CardTitle className="text-red-600">Error</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">{error}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Empty */}
                        {!loading && !error && entries.length === 0 && (
                            <Card className="border-2 border-border shadow-shadow bg-secondary-background">
                                <CardHeader>
                                    <CardTitle className="font-semibold">No data yet</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium text-foreground/70">
                                        No activity recorded this week. Complete some study sessions to appear on the board!
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Leaderboard */}
                        {!loading && !error && entries.length > 0 && (
                            <Card className="border-2 border-border shadow-shadow bg-secondary-background">
                                <CardHeader>
                                    <CardTitle className="font-semibold">Standings</CardTitle>
                                </CardHeader>

                                <CardContent className="divide-y-2 divide-border">
                                    {entries.map((entry, idx) => {
                                        const rank = idx + 1; 
                                        const isMe = entry.email?.toLowerCase() === myEmail;

                                        return (
                                            <Row key={`${entry.userId}-${idx}`}
                                                rank={rank}
                                                email={entry.email}
                                                xp={entry.xp}
                                                highlight={isMe}/>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </section>
            </main>
        </RequireAuth>
    );
}

function Row({
    rank, 
    email, 
    xp, 
    highlight,
}: {
    rank: number; 
    email: string; 
    xp: number; 
    highlight?: boolean;
}) {
    const Icon = rank === 1 ? Crown : rank === 2 ? Medal : rank === 3 ? Award : null;
    const iconTone = 
        rank === 1
        ? "text-[#FACC00]" // chart-1 gold
        : rank === 2
        ? "text-[#7A83FF]" // chart-2
        : rank === 3
        ? "text-[#FF4D50]" // chart-3
        : "text-foreground/70";
    
    return (
        <div className={["flex items-center justify-between gap-4 py-3 px-3",
            "bg-background",
            "rounded-base border-2 border-border shadow-shadow",
            highlight ? "outline-2 outline-offset-2 outline-[--color-ring]" : "",
        ].join(" ")}
        style={{ marginTop: 12 }}
        >
            <div className="flex items-center gap-3 min-w-0">
                <RankBadge rank={rank}/>
                <div className="flex items-center gap-2 min-w-0">
                    {Icon ? <Icon className={`w-5 h-5 shrink-0 ${iconTone}`} /> : null}
                    <span className="font-semibold truncate">{email}</span>
                    {highlight ? (
                        <span className="ml-2 inline-flex items-center rounded-base border-2 border-border bg-main px-1.5 py-0.5 text-[11px] font-semibold text-main-foreground shadow-shadow">
                            You
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="text-right">
                <span className="font-semibold">{xp.toLocaleString()} XP</span>
            </div>
        </div>
    );
}

function RankBadge({ rank }: { rank: number }) {
    const label = `${rank}`
    const tone =
    rank === 1
        ? "bg-[--color-chart-1]"
        : rank === 2
        ? "bg-[--color-chart-2]"
        : rank === 3
        ? "bg-[--color-chart-3]"
        : "bg-secondary-background";

    return (
        <span 
            className={[
                "inline-grid place-items-center size-8 rounded-base",
                "border-2 border-border shadow-shadow",
                tone,
            ].join(" ")}
            aria-label={`Rank ${rank}`}
        >
            <span className="font-heading">{label}</span>
        </span>
    )
}