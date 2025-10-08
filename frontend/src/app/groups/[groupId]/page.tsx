"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useSets } from "@/hooks/useSets";

import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function GroupPage() {
    const params = useParams();
    const groupId = params.groupId as string;

  // If groupId might be undefined, pass a safe fallback to the hook
    const { items: sets, loading, error, create, remove } = useSets(groupId || "");

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Delete dialog state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!groupId || groupId === "undefined") {
        alert("Error: Invalid group ID. Please go back to the groups page and try again.");
        return;
    }

    try {
        await create(title.trim(), description.trim());
        setTitle("");
        setDescription("");
        setShowCreateForm(false);
        } catch (err) {
        alert("Failed to create set: " + (err as Error).message);
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
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                <Button variant="neutral" size="sm" asChild className="border-2 border-border shadow-shadow">
                    <Link href="/groups">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Groups
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Flashcard Sets</h1>
                    <p className="text-foreground/70 font-medium">Create and manage your flashcard sets</p>
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

                {/* Create Set Form */}
                {showCreateForm && (
                <Card className="mb-8 border-2 border-border shadow-shadow bg-secondary-background">
                    <CardHeader>
                    <CardTitle>Create New Set</CardTitle>
                    <CardDescription>Add a new flashcard set to this group</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <form onSubmit={handleCreateSet} className="space-y-4">
                        <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter set title"
                            required
                        />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter set description (optional)"
                        />
                        </div>
                        <div className="flex gap-2">
                        <Button type="submit" className="font-semibold">
                            Create Set
                        </Button>
                        <Button
                            type="button"
                            variant="neutral"
                            onClick={() => setShowCreateForm(false)}
                            className="border-2 border-border shadow-shadow font-medium"
                        >
                            Cancel
                        </Button>
                        </div>
                    </form>
                    </CardContent>
                </Card>
                )}

                {/* Create Set Button */}
                {!showCreateForm && (
                <div className="mb-8">
                    <Button onClick={() => setShowCreateForm(true)} className="font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Set
                    </Button>
                </div>
                )}

                {/* Loading / Error */}
                {loading && <p>Loading sets...</p>}
                {error && <p className="text-red-600">Error: {error}</p>}

                {/* Empty */}
                {!loading && !error && sets.length === 0 && (
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
                    <Card key={set.id} className="transition-transform border-2 border-border shadow-shadow bg-secondary-background">
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
                                variant="noShadow"
                                size="icon"
                                aria-label="Delete set"
                                className="border-2 border-border"
                                onClick={() => setPendingDeleteId(set.id)}
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
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
                        Created: {new Date(set.createdAt).toLocaleDateString()}
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
