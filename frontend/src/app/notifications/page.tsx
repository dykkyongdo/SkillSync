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
import { Invitation } from "@/types";

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

                // Load real invitations from API
                const invitations = await api<Invitation[]>("/api/notifications/invitations", { method: "GET" });
                if (!cancel) setInvites(invitations);
            } catch (e: unknown) {
                if (!cancel) setError(e instanceof Error ? e.message : "Failed to load notifications");
            } finally {
                if (!cancel) setLoading(false);
            }
        }

        load();
        return () => {
            cancel = true;
        };
    }, []);

    async function acceptInvite(groupId: string, membershipId: string) {
        try {
            // Accept via new notification API
            await api<void>(`/api/notifications/invitations/${membershipId}/accept`, { method: "POST" });
            // Remove from local list 
            setInvites((prev) => prev.filter((i) => i.membershipId !== membershipId));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Failed to accept invitation");
        }
    }

    async function declineInvite(membershipId: string) {
        try {
            // Reject via new notification API
            await api<void>(`/api/notifications/invitations/${membershipId}/reject`, { method: "POST" });
            // Remove from local list
            setInvites((prev) => prev.filter((i) => i.membershipId !== membershipId));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Failed to reject invitation");
        }
    }

    return (
        <RequireAuth>
            <main className="relative isolate pt-14">
                {/* Background */}
                <div className="absolute inset-0 -z-10 bg-background" />
                <div className="absolute inset-0 -z-10 pointer-events-none opacity-70 dark:opacity-20
                        bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)]
                        bg-[size:48px_48px]" />

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
                            <Card className="border-2 border-border shadow-shadow bg-main">
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
                            <Card className="border-2 border-border shadow-shadow bg-main">
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
                            <Card className="border-2 border-border shadow-shadow bg-main">
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
                                    <Card key={inv.membershipId} className="border-2 border-border shadow-shadow bg-main">
                                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <CardTitle className="font-semibold truncate">
                                                    {inv.groupName}
                                                </CardTitle>
                                                <CardDescription className="font-medium">
                                                    Invited by <span className="font-semibold">{inv.inviterName}</span>
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
                                            <Button onClick={() => declineInvite(inv.membershipId)} variant="neutral" className="border-2 border-border shadow-shadow font-medium" title="Decline">
                                                <X className="w-4 h-4 mr-2"/>
                                                Decline
                                            </Button> 

                                            <Button onClick={() => acceptInvite(inv.groupId, inv.membershipId)} className="border-2 border-border shadow-shadow font-semibold" title="Accept">
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