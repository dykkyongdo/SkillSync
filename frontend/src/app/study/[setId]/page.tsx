"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";

type DueCard = {
    flashcardId: string;
    question: string;
    answer: string;
};

export default function StudyPage() {
    const params = useParams();
    const setId = params.setId as string;
    const [cards, setCards] = useState<DueCard[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [studyComplete, setStudyComplete] = useState(false);

    const loadCards = async () => {
        try {
            setLoading(true);
            setError(null);
            const dueCards = await api<DueCard[]>(`/api/sets/${setId}/study/due?limit=20`);
            setCards(dueCards);
            setCurrentCardIndex(0);
            setShowAnswer(false);
            setStudyComplete(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (setId) {
            loadCards();
        }
    }, [setId]);

    const handleGrade = async (grade: number) => {
        if (currentCardIndex >= cards.length) return;

        const currentCard = cards[currentCardIndex];
        
        try {
            await api(`/api/sets/${setId}/study/${currentCard.flashcardId}/review`, {
                method: "POST",
                body: JSON.stringify({ grade }),
            });

            // Move to next card
            if (currentCardIndex + 1 >= cards.length) {
                setStudyComplete(true);
            } else {
                setCurrentCardIndex(prev => prev + 1);
                setShowAnswer(false);
            }
        } catch (err: any) {
            alert("Failed to submit review: " + err.message);
        }
    };

    const restartStudy = () => {
        loadCards();
    };

    if (loading) {
        return (
            <RequireAuth>
                <main className="relative isolate pt-14">
                    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
                        <p>Loading study session...</p>
                    </div>
                </main>
            </RequireAuth>
        );
    }

    if (error) {
        return (
            <RequireAuth>
                <main className="relative isolate pt-14">
                    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">Error: {error}</p>
                            <Button onClick={loadCards}>Try Again</Button>
                        </div>
                    </div>
                </main>
            </RequireAuth>
        );
    }

    if (cards.length === 0) {
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
                        <div className="max-w-2xl mx-auto">
                            {/* Breadcrumb Navigation */}
                            <div className="mb-6">
                                <DynamicBreadcrumb />
                            </div>

                            <Card className="text-center">
                                <CardHeader>
                                    <CardTitle>No Cards to Study</CardTitle>
                                    <CardDescription>
                                        All cards are up to date! Check back later or add more cards to study.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild>
                                        <Link href="/groups">Back to Groups</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </main>
            </RequireAuth>
        );
    }

    if (studyComplete) {
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
                        <div className="max-w-2xl mx-auto">
                            {/* Breadcrumb Navigation */}
                            <div className="mb-6">
                                <DynamicBreadcrumb />
                            </div>

                            <Card className="text-center">
                                <CardHeader>
                                    <CardTitle className="text-green-600">Study Complete!</CardTitle>
                                    <CardDescription>
                                        Great job! You've reviewed all {cards.length} cards.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button onClick={restartStudy} className="w-full">
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Study Again
                                    </Button>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/groups">Back to Groups</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </main>
            </RequireAuth>
        );
    }

    const currentCard = cards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / cards.length) * 100;

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
                    <div className="max-w-2xl mx-auto">
                        {/* Breadcrumb Navigation */}
                        <div className="mb-6">
                            <DynamicBreadcrumb />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="text-sm text-muted-foreground">
                                {currentCardIndex + 1} of {cards.length}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Card */}
                        <Card className="min-h-[400px] flex flex-col">
                            <CardHeader className="text-center">
                                <CardTitle className="text-xl">
                                    {showAnswer ? "Answer" : "Question"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-lg leading-relaxed">
                                        {showAnswer ? currentCard.answer : currentCard.question}
                                    </p>
                                </div>
                            </CardContent>
                            <CardContent className="pt-0">
                                {!showAnswer ? (
                                    <Button 
                                        onClick={() => setShowAnswer(true)}
                                        className="w-full"
                                        size="lg"
                                    >
                                        Show Answer
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-center text-sm text-muted-foreground mb-4">
                                            How well did you know this?
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleGrade(0)}
                                                className="flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Again
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleGrade(1)}
                                                className="flex items-center gap-2"
                                            >
                                                <Clock className="w-4 h-4" />
                                                Hard
                                            </Button>
                                            <Button
                                                onClick={() => handleGrade(2)}
                                                className="flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Good
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleGrade(3)}
                                                className="flex items-center gap-2"
                                            >
                                                <Zap className="w-4 h-4" />
                                                Easy
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
        </RequireAuth>
    );
}
