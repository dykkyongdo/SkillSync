"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useCards } from "@/hooks/useCards";
import { useSets } from "@/hooks/useSets";
import { useGroups } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
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

export default function SetPage() {
    const params = useParams();
    const setId = params.setId as string;
    const { items: cards, error, create, remove, deletingIds } = useCards(setId);
    const { items: groups } = useGroups();
    
    // Find the set and its group by searching through all groups
    let currentSet = null;
    let currentGroup = null;
    let setTitle = "Flashcard Set";
    let groupName = "Group";
    
    for (const group of groups) {
        // We need to load sets for each group to find our set
        // For now, we'll use a simple approach and get the groupId from the first card
        if (cards.length > 0) {
            const cardGroupId = cards[0]?.groupId;
            if (group.groupId === cardGroupId) {
                currentGroup = group;
                groupName = group.name;
                break;
            }
        }
    }
    
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const handleCreateCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim()) return;
        
        try {
            await create(question, answer);
            setQuestion("");
            setAnswer("");
            setShowCreateForm(false);
        } catch (err) {
            alert("Failed to create card: " + (err as Error).message);
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        try {
            await remove(cardId);
            // Success - card is already removed from UI optimistically
        } catch (err) {
            const error = err as Error;
            // Only show error if it's not a "not found" error (which is actually success)
            if (!error.message.includes("not found") && !error.message.includes("Flashcard not found")) {
                alert("Failed to delete card: " + error.message);
            }
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
                        {/* Breadcrumb Navigation */}
                        <div className="mb-6">
                            <DynamicBreadcrumb />
                        </div>

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">Flashcards</h1>
                                <p className="text-muted-foreground">Manage your flashcards</p>
                            </div>
                        </div>

                        {/* Create Card Form */}
                        {showCreateForm && (
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>Add New Card</CardTitle>
                                    <CardDescription>Create a new flashcard</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateCard} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="question">Question</Label>
                                            <Input
                                                id="question"
                                                value={question}
                                                onChange={(e) => setQuestion(e.target.value)}
                                                placeholder="Enter the question"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="answer">Answer</Label>
                                            <Input
                                                id="answer"
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                                placeholder="Enter the answer"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit">Add Card</Button>
                                            <Button 
                                                type="button" 
                                                variant="default" 
                                                onClick={() => setShowCreateForm(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Create Card Button */}
                        {!showCreateForm && (
                            <div className="mb-8 flex gap-4">
                                <Button onClick={() => setShowCreateForm(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Card
                                </Button>
                                <Button asChild variant="default">
                                    <Link href={`/study/${setId}`}>
                                        Start Studying
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {/* Loading and Error States */}
                        {error && <p className="text-red-600">Error: {error}</p>}
                        
                        {/* Empty State */}
                        {!error && cards.length === 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>No cards yet</CardTitle>
                                    <CardDescription>
                                        Add your first flashcard to start building your study set.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        )}

                        {/* Cards Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {cards.map((card) => (
                                <Card key={card.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg line-clamp-2">{card.question}</CardTitle>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        disabled={deletingIds.has(card.id)}
                                                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                                                    >
                                                        <Trash2 className={`w-4 h-4 ${deletingIds.has(card.id) ? 'animate-pulse' : ''}`} />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this flashcard? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteCard(card.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="line-clamp-3">
                                            {card.answer}
                                        </CardDescription>
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
