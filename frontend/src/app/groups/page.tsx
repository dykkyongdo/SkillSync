"use client";

import Link from "next/link";
import * as React from "react";
import RequireAuth from "@/components/RequireAuth";
import { useGroups } from "@/hooks/useGroups";
import { useInvitationCount } from "@/hooks/useInvitationCount";
import { Calendar as CalendarIcon, Trash2, Loader2, Users } from "lucide-react"
import type { Group } from "@/types";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

// Group Card Component
function GroupCard({ group, onDelete }: { group: Group; onDelete: (id: string) => void }) {
    return (
        <Card className="transition-all duration-200 border-2 border-border shadow-shadow bg-main">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="font-medium">{group.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {group.description || "No description"}
                        </CardDescription>
                    </div>

                    {/* Delete trigger opens dialog */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="icon"
                                aria-label="Delete group"
                                className="border-2 border-border shadow-shadow bg-white hover:bg-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>

                        {/* Dialog */}
                        <AlertDialogContent className="dark:bg-[var(--main)]">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-black">Delete this group?</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-black">
                                    This will permanently delete the group and all its flashcard sets. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border-2 border-border shadow-shadow font-medium">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(group.groupId)}
                                    className="bg-red-500 hover:brightness-95 text-white border-2 border-border shadow-shadow font-semibold"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>

            <CardContent>
                <p className="text-sm text-foreground/70 font-medium">
                    <CalendarIcon /> {new Date(group.createdAt).toLocaleDateString()}
                </p>

                {/* View and Manage links */}
                <div className="mt-4 space-y-2">
                    {group.groupId ? (
                        <>
                            <Button asChild className="w-full font-semibold bg-white">
                                <Link href={`/groups/${group.groupId}`}>View Sets</Link>
                            </Button>
                            {(group.currentUserGroupRole === "OWNER" || group.currentUserGroupRole === "ADMIN") && (
                                <Button asChild variant="neutral" className="w-full border-2 border-border shadow-shadow font-medium">
                                    <Link href={`/groups/${group.groupId}/manage`}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Group
                                    </Link>
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button disabled className="w-full font-semibold bg-gray-300">
                            View Sets (Invalid ID)
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function GroupsPage() {
    const { items: groups, loading, error, create, remove, reload } = useGroups();
    const { refresh: refreshInvitationCount } = useInvitationCount();

    // Refresh groups when invitation count changes (user might have accepted an invitation)
    React.useEffect(() => {
        const handleFocus = () => {
            reload();
            refreshInvitationCount();
        };
        
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [reload, refreshInvitationCount]);

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
        } catch (err) {
        setFormError((err as Error)?.message ?? "Failed to create group");
        } finally {
        setSubmitting(false);
        }
    }

    async function handleDeleteGroup(groupId: string) {
        try {
            console.log("Starting group deletion for ID:", groupId);
            await remove(groupId);
            console.log("Group deletion successful");
        } catch (err) {
            const errorMessage = (err as Error).message;
            console.log("Group deletion failed with error:", errorMessage);
            // Don't show error alert for authentication issues - the user will be redirected
            if (errorMessage.includes("Token expired") || errorMessage.includes("Redirecting to login")) {
                console.log("Authentication issue during group deletion:", errorMessage);
                return; // Let the redirect happen
            }
            alert("Failed to delete group: " + errorMessage);
        }
    }

    return (
        <RequireAuth>
        <main className="relative isolate pt-14">
            {/* BG */}
            <div className="absolute inset-0 -z-10 bg-background" />
            <div
                className="
                absolute inset-0 -z-10 pointer-events-none opacity-70 dark:opacity-50
                [--grid:rgba(0,0,0,0.08)] dark:[--grid:rgba(255,255,255,0.12)]
                bg-[linear-gradient(to_right,var(--grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid)_1px,transparent_1px)]
                bg-[size:48px_48px]
                "
            />

            <section className="min-h-[calc(100vh-3.5rem)] px-4 py-8 relative z-0">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Groups</h1>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                    <Button className="font-semibold bg-white">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Group
                    </Button>
                    </DialogTrigger>

                    <DialogContent className="rounded-base border-2 border-border shadow-shadow dark:bg-[var(--main)]">
                    <DialogHeader className="gap-1">
                        <DialogTitle className="font-medium text-2xl dark:text-black">
                        New Group
                        </DialogTitle>
                        <DialogDescription className="font-medium dark:text-black">
                        Give your group a name and (optionally) a short description.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateGroup} className="grid gap-5">
                        <div className="grid gap-2">
                        <Label className="font-medium dark:text-black">Group name</Label>
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
                        <Label htmlFor="group-desc" className=" font-medium dark:text-black">
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
                <Card className="bg-main dark:bg-white border-2 border-border shadow-shadow dark:bg-[var(--main)]">
                    <CardHeader>
                    <CardTitle className="font-medium">No groups yet</CardTitle>
                    <CardDescription>
                        Create your first group to get started with organizing your
                        study materials.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Button onClick={() => setOpen(true)} className="font-semibold bg-white">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Group
                    </Button>
                    </CardContent>
                </Card>
                )}

                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 relative">
                    {groups.map((group) => (
                        <GroupCard
                            key={group.groupId}
                            group={group}
                            onDelete={handleDeleteGroup}
                        />
                    ))}
                </div>
            </div>
            </section>
        </main>
        </RequireAuth>
    );
}
