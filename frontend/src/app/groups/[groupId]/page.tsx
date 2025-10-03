"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useSets } from "@/hooks/useSets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function GroupPage() {
    const params = useParams();
    const groupId = params.groupId as string;
    const { items: sets, loading, error, create, remove } = useSets(groupId);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleCreateSet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        
        try {
            await create(title, description);
            setTitle("");
            setDescription("");
            setShowCreateForm(false);
        } catch (err) {
            alert("Failed to create set: " + (err as Error).message);
        }
    };

    const handleDeleteSet = async (setId: string) => {
        if (!confirm("Are you sure you want to delete this set? This will also delete all flashcards in the set.")) return;
        
        try {
            await remove(setId);
        } catch (err) {
            alert("Failed to delete set: " + (err as Error).message);
        }
    };

    return (
        <RequireAuth>
            <main className="relative isolate pt-14">
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
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/groups">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Groups
                                </Link>
                            </Button>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">Flashcard Sets</h1>
                                <p className="text-muted-foreground">Create and manage your flashcard sets</p>
                            </div>
                        </div>

                        {/* Create Set Form */}
                        {showCreateForm && (
                            <Card className="mb-8">
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
                                            <Button type="submit">Create Set</Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setShowCreateForm(false)}
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
                                <Button onClick={() => setShowCreateForm(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create New Set
                                </Button>
                            </div>
                        )}

                        {/* Loading and Error States */}
                        {loading && <p>Loading sets...</p>}
                        {error && <p className="text-red-600">Error: {error}</p>}
                        
                        {/* Empty State */}
                        {!loading && !error && sets.length === 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>No sets yet</CardTitle>
                                    <CardDescription>
                                        Create your first flashcard set to start organizing your study materials.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        )}

                        {/* Sets Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {sets.map((set) => (
                                <Card key={set.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <CardTitle className="line-clamp-2">{set.title}</CardTitle>
                                                <CardDescription className="line-clamp-3">{set.description}</CardDescription>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteSet(set.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Created: {new Date(set.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button asChild className="flex-1">
                                                <Link href={`/sets/${set.id}`}>
                                                    View Cards
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="flex-1">
                                                <Link href={`/study/${set.id}`}>
                                                    Study
                                                </Link>
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
