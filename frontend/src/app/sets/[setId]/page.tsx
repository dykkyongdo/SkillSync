"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useCards } from "@/hooks/useCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Loader2, Sparkles } from "lucide-react";
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
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AIFlashcardGenerator } from "@/components/AIFlashcardGenerator";

export default function SetPage() {
    const params = useParams();
    const setId = params.setId as string;
    const { items: cards, error, create, remove, deletingIds } = useCards(setId);
    
    // Find the set and its group by searching through all groups
    
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [explanation, setExplanation] = useState("");
    const [difficulty, setDifficulty] = useState("1");
    const [tags, setTags] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [truncatedCards, setTruncatedCards] = useState<Set<string>>(new Set());
    const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

    const difficultyOptions = [
        { value: "1", label: "Beginner" },
        { value: "2", label: "Easy" },
        { value: "3", label: "Medium" },
        { value: "4", label: "Hard" },
        { value: "5", label: "Expert" },
    ];

    const toggleCardExpansion = (cardId: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) {
                newSet.delete(cardId);
            } else {
                newSet.add(cardId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        const checkTruncation = () => {
            const newTruncatedCards = new Set<string>();
            cardRefs.current.forEach((element, cardId) => {
                if (element && element.scrollHeight > element.clientHeight) {
                    newTruncatedCards.add(cardId);
                }
            });
            setTruncatedCards(newTruncatedCards);
        };

        checkTruncation();
        
        const resizeObserver = new ResizeObserver(checkTruncation);
        cardRefs.current.forEach(element => {
            if (element) resizeObserver.observe(element);
        });

        return () => resizeObserver.disconnect();
    }, [cards]);

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
            const tagsArray = tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
            await create(question.trim(), answer.trim(), explanation.trim() || undefined, parseInt(difficulty), tagsArray);
            setQuestion("");
            setAnswer("");
            setExplanation("");
            setDifficulty("1");
            setTags("");
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
                alert(error.message);
            }
        }
    };

    const handleAIFlashcardsGenerated = async (generatedFlashcards: Array<{
        question: string;
        answer: string;
        explanation?: string;
        difficulty: number;
        tags: string[];
    }>) => {
        try {
            for (const flashcardData of generatedFlashcards) {
                await create(
                    flashcardData.question,
                    flashcardData.answer,
                    flashcardData.explanation,
                    flashcardData.difficulty,
                    flashcardData.tags || []
                );
            }
            setAiDialogOpen(false);
        } catch (err) {
            console.error("Failed to create AI-generated flashcards:", err);
        }
    };

    return (
        <RequireAuth>
            <main className="relative isolate pt-14">
                <div className="absolute inset-0 -z-10 bg-background" />
                <div className="absolute inset-0 -z-10 pointer-events-none opacity-70 dark:opacity-20
                        bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)]
                        bg-[size:48px_48px]" />

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

                            <div className="flex gap-5">
                                {/* AI Generation Button */}
                                <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="neutral" className="font-semibold">
                                            <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                                            AI Generate
                                        </Button>
                                    </DialogTrigger>
                                    <AIFlashcardGenerator
                                        setId={setId}
                                        onFlashcardsGenerated={handleAIFlashcardsGenerated}
                                        onClose={() => setAiDialogOpen(false)}
                                    />
                                </Dialog>

                                {/* Manual Add Card Button */}
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

                                        <div className="grid gap-2">
                                            <Label className="font-medium">Explanation (Optional)</Label>
                                            <Textarea
                                                id="explanation"
                                                placeholder="Additional details or context..."
                                                value={explanation}
                                                onChange={(e) => setExplanation(e.target.value)}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label className="font-medium">Difficulty</Label>
                                            <Select value={difficulty} onValueChange={setDifficulty}>
                                                <SelectTrigger className="border-2 border-border bg-secondary-background">
                                                    <SelectValue placeholder="Select difficulty" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-base border-2 border-border bg-secondary-background">
                                                    {difficultyOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label className="font-medium">Tags (Optional)</Label>
                                            <Input
                                                id="tags"
                                                placeholder="e.g. geography, capitals, europe (comma-separated)"
                                                value={tags}
                                                onChange={(e) => setTags(e.target.value)}
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
                                                setExplanation("");
                                                setDifficulty("1");
                                                setTags("");
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
                            <Card className="bg-main">
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
                                            <div className="flex-1">
                                                <CardTitle 
                                                    ref={(el) => {
                                                        if (el) {
                                                            cardRefs.current.set(card.id, el);
                                                        } else {
                                                            cardRefs.current.delete(card.id);
                                                        }
                                                    }}
                                                    className={`text-lg ${expandedCards.has(card.id) ? '' : 'line-clamp-2'}`}
                                                >
                                                    {card.question}
                                                </CardTitle>
                                                {(truncatedCards.has(card.id) || expandedCards.has(card.id)) && (
                                                    <button
                                                        onClick={() => toggleCardExpansion(card.id)}
                                                        className="mt-1 text-xs text-muted-foreground hover:text-main transition-colors"
                                                    >
                                                        {expandedCards.has(card.id) ? 'Show less' : 'Show more'}
                                                    </button>
                                                )}
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        aria-label="Delete flashcard"
                                                        disabled={deletingIds.has(card.id)}
                                                        className="w-8 h-8 min-w-8 min-h-8 flex-shrink-0 ml-2 border-2 border-border shadow-shadow bg-white hover:bg-red-500 disabled:opacity-50"
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
                                            <strong>Answer:</strong> {card.answer}
                                        </CardDescription>
                                        {card.explanation && (
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                <strong>Explanation:</strong> {card.explanation}
                                            </div>
                                        )}
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {card.difficulty === 1 && "Beginner"}
                                                {card.difficulty === 2 && "Easy"}
                                                {card.difficulty === 3 && "Medium"}
                                                {card.difficulty === 4 && "Hard"}
                                                {card.difficulty === 5 && "Expert"}
                                            </span>
                                            {card.tags && card.tags.length > 0 && (
                                                card.tags.map((tag, index) => (
                                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {tag}
                                                    </span>
                                                ))
                                            )}
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
