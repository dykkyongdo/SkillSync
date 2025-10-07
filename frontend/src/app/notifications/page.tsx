"use client";

import * as React from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { ArrowLeft, Bell, Check, X } from "lucide-react";

type Invitation = { 
    id: string; 
    groupId: string;
    groupName: string 
    inviter: string;
    sentAt?: string; 
};

export default function NotificationPage() {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [invites, setInvites] = React.useState<Invitation[]>([]);

    // load mock invitations
    React.useEffect(() => {
        let cancel = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                // Simulate loading delay + mock data
                await new Promise((r) => setTimeout(r, 350));
                const mock: Invitation[] = [
                    {
                        id: "inv-1",
                        groupId: "g-42",
                        groupName: "Data Structures (Fall)",
                        inviter: "prof.alex@example.com",
                        sentAt: new Date().toISOString(),
                    },
                    {
                        id: "inv-2",
                        groupId: "g-77",
                        groupName: "Spanish A2 • Vocab Sprints",
                        inviter: "maria@example.com",
                        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                    },
                ];
                if (!cancel) setInvites(mock);
            } catch (e: any) {
                if (!cancel) setError(e?.message ?? "Failed to load notifications");
            } finally {
                if (!cancel) setLoading(false);
            }
        }

        load();
        return () => {
            cancel = true;
        };
    }, []);

    async function acceptInvite(groupId: string, inviteId: string) {
        try {
            // Accept via existing membership API
            await api<void>(`/api/groups/${groupId}/members/accept`, { method: "POST" });
            // Remove from local list 
            setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        } catch (e: any) {
            alert(e?.message ?? "Failed to accept invitation");
        }
    }

    function declineInvite(inviteId: string) {
        // No endpoint yet - just dismiss locally
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    }

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
                                    <Link href={`/groups`}>
                                        <ArrowLeft className="w-4 h-4 mr-2"/>
                                        Back to Group
                                    </Link>
                                </Button>

                                <div>
                                    <h1 className="font-heading text-3xl">Notifications</h1>
                                    <p className="text-foreground/70 font-medium">
                                        Pending group invitations
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <Card className="border-2 border-border shadow-shadow bg-secondary-background">
                                <CardHeader>
                                    <CardTitle className="font-semibold">Loading...</CardTitle>
                                    <CardDescription className="font-medium">
                                        Fetching your notifications
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 animate-pulse">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-14 w-full bg-foreground/10 rounded"/>
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
                        {!loading && !error && invites.length === 0 && (
                            <Card className="border-2 border-border shadow-shadow bg-secondary-background">
                                <CardHeader>
                                    <CardTitle className="font-semibold">No notifications</CardTitle>
                                    <CardDescription className="font-medium">
                                        You're all caught up. We'll let you know when something arrives.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-foreground/70 font-medium">
                                        <Bell className="w-5 h-5"/>
                                        Nothing to review right now.
                                    </div>
                                </CardContent>
                            </Card>
                        )}       

                        {/* Invitations list */}
                        {!loading && !error && invites.length > 0 && (
                            <div className="space-y-4">
                                {invites.map((inv) => (
                                    <Card key={inv.id} className="border-2 border-border shadow-shadow bg-secondary-background">
                                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <CardTitle className="font-semibold truncate">
                                                    {inv.groupName}
                                                </CardTitle>
                                                <CardDescription className="font-medium">
                                                    Invited by <span className="font-semibold">{inv.inviter}</span>
                                                    {inv.sentAt ? (
                                                        <span className="text-foreground/60">
                                                            {" "}
                                                            • {new Date(inv.sentAt).toLocaleString()}
                                                        </span>
                                                    ): null}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="flex flex-wrap items-center justify-end gap-3">
                                            <Button onClick={() => declineInvite(inv.id)} variant="neutral" className="border-2 border-border shadow-shadow font-medium" title="Decline">
                                                <X className="w-4 h-4 mr-2"/>
                                                Decline
                                            </Button> 

                                            <Button onClick={() => acceptInvite(inv.groupId, inv.id)} className="border-2 border-border shadow-shadow font-semibold" title="Accept">
                                                <Check className="w-4 h-4 mr-2"/>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </RequireAuth>
    )
}