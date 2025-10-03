"use client";

import Link from "next/link";
import * as React from "react";
import RequireAuth from "@/components/RequireAuth";
import { useGroups } from "@/hooks/useGroups";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";

// NEW: progress
import { Progress } from "@/components/ui/progress";

export default function GroupsPage() {
    const { items: groups, loading, error, create } = useGroups();

    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState(""); // fixed spacing typo
    const [submitting, setSubmitting] = React.useState(false);
    const [formError, setFormError] = React.useState<string | null>(null);

    async function handleCreateGroup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!name.trim()) return setFormError("Please enter a group name.");
        setFormError(null);
        setSubmitting(true);
        try {
        await create(name.trim(), description.trim());
        setName("");
        setDescription("");
        setOpen(false);
        } catch (err: any) {
        setFormError(err?.message ?? "Failed to create group");
        } finally {
        setSubmitting(false);
        }
    }

    // helper: get % complete (0..100)
    function getCompletion(g: any): number {
        const raw =
        g?.progress ??
        g?.completion ??
        0; // adjust if your API uses a different field
        const n = typeof raw === "number" ? raw : Number(raw);
        return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
    }

    return (
        <RequireAuth>
        <main className="relative isolate pt-14">
            {/* BG */}
            <div className="absolute inset-0 -z-10 bg-[var(--bg-page)]" />
            <div
            className="
                absolute inset-0 -z-10 pointer-events-none
                bg-[linear-gradient(to_right,rgba(0,0,0,0.12)_2px,transparent_2px),linear-gradient(to_bottom,rgba(0,0,0,0.12)_2px,transparent_2px)]
                [background-size:48px_48px]
                dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.14)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_2px,transparent_2px)]
            "
            />

            <section className="min-h-[calc(100vh-3.5rem)] px-4 py-8 relative z-0">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                <h1 className="font-heading text-3xl font-bold">My Groups</h1>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                    <Button className="font-semibold">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Group
                    </Button>
                    </DialogTrigger>

                    <DialogContent className="rounded-base border-2 border-border shadow-shadow">
                    <DialogHeader className="gap-1">
                        <DialogTitle className="font-medium text-2xl">
                        New Group
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                        Give your group a name and (optionally) a short description.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateGroup} className="grid gap-5">
                        <div className="grid gap-2">
                        <Label className="font-medium">Group name</Label>
                        <Input
                            id="group-name"
                            placeholder="e.g. Python Bootcamp"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            required
                        />
                        </div>

                        <div className="grid gap-2">
                        <Label htmlFor="group-desc" className=" font-medium">
                            Description{" "}
                            <span className="text-foreground/50">(optional)</span>
                        </Label>
                        <Textarea
                            id="group-desc"
                            placeholder="Short blurb about this group..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                        </div>

                        {formError && (
                        <p className="text-sm font-medium text-red-600">{formError}</p>
                        )}

                        <DialogFooter className="mt-2">
                        <Button
                            className="font-medium"
                            type="button"
                            variant="neutral"
                            onClick={() => setOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button className="font-medium" type="submit" disabled={submitting}>
                            {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                            ) : (
                            "Create"
                            )}
                        </Button>
                        </DialogFooter>
                    </form>
                    </DialogContent>
                </Dialog>
                </div>

                {loading && <p>Loading groups...</p>}
                {error && <p className="text-red-600">Error: {error}</p>}

                {!loading && !error && groups.length === 0 && (
                <Card className="bg-white dark:bg-white border-2 border-border shadow-shadow">
                    <CardHeader>
                    <CardTitle className="font-medium">No groups yet</CardTitle>
                    <CardDescription>
                        Create your first group to get started with organizing your
                        study materials.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Button onClick={() => setOpen(true)} className="font-semibold">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Group
                    </Button>
                    </CardContent>
                </Card>
                )}

                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => {
                    const pct = getCompletion(group);

                    return (
                    <Card
                        key={group.id}
                        className="transition-transform border-2 border-border shadow-shadow bg-white"
                    >
                        <CardHeader>
                        <CardTitle className="font-medium">{group.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {group.description || "No description"}
                        </CardDescription>
                        </CardHeader>

                        <CardContent>
                        <p className="text-sm text-foreground/70 font-medium">
                            Created: {new Date(group.createdAt).toLocaleDateString()}
                        </p>

                        {/* Progress row */}
                        <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium">Progress</span>
                            <span className="font-semibold">{pct}%</span>
                            </div>

                            <Progress
                            value={pct}
                            className="h-3 w-full rounded-base border-2 border-border bg-secondary-background"
                            />
                        </div>

                        {/* View link (keep or remove as you like) */}
                        <div className="mt-4">
                            <Button asChild className="w-full font-semibold">
                            <Link href={`/groups/${group.id}`}>View Sets</Link>
                            </Button>
                        </div>
                        </CardContent>
                    </Card>
                    );
                })}
                </div>
            </div>
            </section>
        </main>
        </RequireAuth>
    );
}
