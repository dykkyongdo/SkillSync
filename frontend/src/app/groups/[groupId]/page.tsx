"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useSets } from "@/hooks/useSets";
import { useGroups } from "@/hooks/useGroups";
import { Calendar as CalendarIcon } from "lucide-react"
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Loader2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function GroupPage() {
    const params = useParams();
    const groupId = params.groupId as string;

  // If groupId might be undefined, pass a safe fallback to the hook
    const { items: sets, error, create, remove } = useSets(groupId || "");
    const { items: groups } = useGroups();
    
    // Find the current group to get its name
    const currentGroup = groups.find(group => group.groupId === groupId);
    const groupName = currentGroup?.name || "Group";

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Delete dialog state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleCreateSet = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        
        if (!title.trim()) {
            setFormError("Please enter a set title.");
            return;
        }

        if (!groupId || groupId === "undefined") {
            setFormError("Error: Invalid group ID. Please go back to the groups page and try again.");
            return;
        }

        setSubmitting(true);
        try {
            await create(title.trim(), description.trim());
            setTitle("");
            setDescription("");
            setOpen(false);
        } catch (err) {
            setFormError("Failed to create set: " + (err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    async function confirmDelete() {
        if (!pendingDeleteId) return;
        setDeleting(true);
        try {
        await remove(pendingDeleteId);
        setDeleteOpen(false);
        setPendingDeleteId(null);
        } catch (err) {
        alert("Failed to delete set: " + (err as Error).message);
        } finally {
        setDeleting(false);
        }
    }

    return (
        <RequireAuth>
        <main className="relative isolate pt-14">
            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-background" />
            <div
            className="absolute inset-0 -z-10 opacity-70 dark:opacity-20 pointer-events-none
                        bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)]
                        bg-[size:48px_48px]"
            />

            <section className="min-h-[calc(100vh-3.5rem)] px-4 py-8 relative z-0">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb Navigation */}
                <div className="mb-6">
                    <DynamicBreadcrumb />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Flashcard Sets</h1>
                    <p className="text-foreground/70 font-medium">Create and manage your flashcard sets</p>
                </div>

                <div className="flex gap-3">
                    {(currentGroup?.currentUserGroupRole === "OWNER" || currentGroup?.currentUserGroupRole === "ADMIN") && (
                        <Button asChild variant="neutral" className="border-2 border-border shadow-shadow font-medium">
                            <Link href={`/groups/${groupId}/manage`}>
                                <Users className="mr-2 h-4 w-4" />
                                Manage Group
                            </Link>
                        </Button>
                    )}

                    <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="font-semibold bg-white">
                            <Plus className="mr-2 h-5 w-5" />
                            Create Set
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="rounded-base border-2 border-border shadow-shadow">
                        <DialogHeader className="gap-1">
                            <DialogTitle className="font-medium text-2xl">
                                New Flashcard Set
                            </DialogTitle>
                            <DialogDescription className="font-medium">
                                Give your flashcard set a title and (optionally) a description.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSet} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label className="font-medium">Set title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Python Basics"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description" className="font-medium">
                                    Description{" "}
                                    <span className="text-foreground/50">(optional)</span>
                                </Label>
                                <Input
                                    id="description"
                                    placeholder="Short description about this set..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
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
                </div>

                {/* Invalid group ID message */}
                {(!groupId || groupId === "undefined") && (
                <Card className="mb-8 border-2 border-red-400 bg-red-50 text-red-900 shadow-shadow">
                    <CardHeader>
                    <CardTitle>Invalid Group</CardTitle>
                    <CardDescription className="text-red-800 font-medium">
                        The group ID is invalid or missing. Please go back to the groups page and click on a valid group.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Button asChild className="font-semibold">
                        <Link href="/groups">Go to Groups</Link>
                    </Button>
                    </CardContent>
                </Card>
                )}


                {/* Loading / Error */}
                {error && <p className="text-red-600">Error: {error}</p>}

                {/* Empty */}
                {!error && sets.length === 0 && (
                <Card className="bg-main text-main-foreground border-2 border-border shadow-shadow">
                    <CardHeader>
                    <CardTitle>No sets yet</CardTitle>
                    <CardDescription className="text-main-foreground/90">
                        Create your first flashcard set to start organizing your study materials.
                    </CardDescription>
                    </CardHeader>
                </Card>
                )}

                {/* Sets Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sets.map((set) => (
                    <Card key={set.id} className="transition-transform border-2 border-border shadow-shadow bg-main">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className="line-clamp-2">{set.title}</CardTitle>
                            <CardDescription className="line-clamp-3">{set.description}</CardDescription>
                        </div>

                        {/* Delete trigger opens dialog */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button
                                size="icon"
                                aria-label="Delete set"
                                className="border-2 border-border shadow-shadow bg-white hover:bg-red-500"
                                onClick={() => setPendingDeleteId(set.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            </AlertDialogTrigger>

                            {/* Dialog */}
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete this set?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This will permanently delete the set and all its flashcards. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel
                                onClick={() => {
                                    setDeleteOpen(false);
                                    setPendingDeleteId(null);
                                }}
                                className="border-2 border-border shadow-shadow font-medium"
                                >
                                Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="bg-red-500 hover:brightness-95 text-white border-2 border-border shadow-shadow font-semibold"
                                >
                                {deleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <p className="text-sm text-foreground/70 mb-4">
                        <CalendarIcon/> {new Date(set.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                        <Button asChild className="flex-1 font-semibold">
                            <Link href={`/sets/${set.id}`}>View Cards</Link>
                        </Button>
                        <Button asChild variant="neutral" className="flex-1 border-2 border-border shadow-shadow font-medium">
                            <Link href={`/study/${set.id}`}>Study</Link>
                        </Button>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </div>
            </section>
        </main>
        </RequireAuth>
    );
}
