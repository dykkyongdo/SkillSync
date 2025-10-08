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
import { ArrowLeft, Plus, Trash2, Edit, Loader2 } from "lucide-react";
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
    
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleCreateCard = async () => {
        setFormError(null);
        
        if (!question.trim()) {
            setFormError("Please enter a question.");
            return;
        }
        
        if (!answer.trim()) {
            setFormError("Please enter an answer.");
            return;
        }
        
        setSubmitting(true);
        try {
            await create(question.trim(), answer.trim());
            setQuestion("");
            setAnswer("");
            setOpen(false);
        } catch (err) {
            setFormError("Failed to create card: " + (err as Error).message);
        } finally {
            setSubmitting(false);
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
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">Flashcards</h1>
                                <p className="text-muted-foreground">Manage your flashcards</p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="font-semibold bg-white">
                                        <Plus className="mr-2 h-5 w-5" />
                                        Add Card
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent className="rounded-base border-2 border-border shadow-shadow">
                                    <AlertDialogHeader className="gap-1">
                                        <AlertDialogTitle className="font-medium text-2xl">
                                            New Flashcard
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="font-medium">
                                            Add a question and answer to create a new flashcard.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="grid gap-5">
                                        <div className="grid gap-2">
                                            <Label className="font-medium">Question</Label>
                                            <Input
                                                id="question"
                                                placeholder="e.g. What is the capital of France?"
                                                value={question}
                                                onChange={(e) => setQuestion(e.target.value)}
                                                autoFocus
                                                required
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label className="font-medium">Answer</Label>
                                            <Input
                                                id="answer"
                                                placeholder="e.g. Paris"
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                                required
                                            />
                                        </div>

                                        {formError && (
                                            <p className="text-sm font-medium text-red-600">{formError}</p>
                                        )}
                                    </div>

                                    <AlertDialogFooter className="mt-2">
                                        <AlertDialogCancel 
                                            className="border-2 border-border shadow-shadow font-medium"
                                            onClick={() => {
                                                setFormError(null);
                                                setQuestion("");
                                                setAnswer("");
                                            }}
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleCreateCard}
                                            disabled={submitting}
                                            className="bg-main border-2 border-border shadow-shadow font-semibold"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                "Create"
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {/* Study Button */}
                        <div className="mb-8">
                            <Button asChild variant="default" className="font-semibold">
                                <Link href={`/study/${setId}`}>
                                    Start Studying
                                </Link>
                            </Button>
                        </div>

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
                                <Card key={card.id} className="transition-transform border-2 border-border shadow-shadow bg-main">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg line-clamp-2">{card.question}</CardTitle>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        aria-label="Delete flashcard"
                                                        disabled={deletingIds.has(card.id)}
                                                        className="border-2 border-border shadow-shadow bg-white hover:bg-red-500 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete this flashcard?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the flashcard. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="border-2 border-border shadow-shadow font-medium">
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteCard(card.id)}
                                                            disabled={deletingIds.has(card.id)}
                                                            className="bg-red-500 hover:brightness-95 text-white border-2 border-border shadow-shadow font-semibold"
                                                        >
                                                            {deletingIds.has(card.id) ? "Deleting..." : "Delete"}
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
