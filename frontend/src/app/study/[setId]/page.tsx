"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useCallback } from "react";
import { RotateCcw, CheckCircle, Star, Target, TrendingUp } from "lucide-react";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import type { DueCard, StudySubmission, StudyResponse } from "@/types";
import { useUserStats } from "@/hooks/useUserStats";

export default function StudyPage() {
    const params = useParams();
    const setId = params.setId as string;
    const [cards, setCards] = useState<DueCard[]>([]);
    const { stats, refetch: refetchStats } = useUserStats();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [studyComplete, setStudyComplete] = useState(false);
    
    // Multiple choice state
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number>(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastResponse, setLastResponse] = useState<StudyResponse | null>(null);

    const loadCards = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const apiUrl = `/api/sets/${setId}/study/due?limit=20`;
            const dueCards = await api<DueCard[]>(apiUrl);
            setCards(dueCards);
            setCurrentCardIndex(0);
            setStudyComplete(false);
            setSelectedOption(null);
            setShowFeedback(false);
            setLastResponse(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [setId]);

    useEffect(() => {
        if (setId) {
            loadCards();
        }
    }, [setId, loadCards]);

    // Track start time for each card
    useEffect(() => {
        if (cards.length > 0 && currentCardIndex < cards.length) {
            setStartTime(Date.now());
            setSelectedOption(null);
            setShowFeedback(false);
            setLastResponse(null);
        }
    }, [currentCardIndex, cards.length]);

    const submitAnswer = async () => {
        if (currentCardIndex >= cards.length) return;

        const currentCard = cards[currentCardIndex];
        const responseTime = Date.now() - startTime;
        
        // Validate answer - only multiple choice now
        if (selectedOption === null) {
            alert("Please select an answer");
            return;
        }

        const submission: StudySubmission = {
            flashcardId: currentCard.flashcardId,
            responseTimeMs: responseTime,
            selectedOptionIndex: selectedOption,
        };
        
        try {
            const result = await api<StudyResponse>(`/api/sets/${setId}/study/${currentCard.flashcardId}/submit`, {
                method: "POST",
                body: JSON.stringify(submission),
            });

            setLastResponse(result);
            setShowFeedback(true);

            // Refresh user stats after each review
            refetchStats();

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            alert("Failed to submit answer: " + errorMessage);
        }
    };

    const nextCard = () => {
        if (currentCardIndex + 1 >= cards.length) {
            setStudyComplete(true);
        } else {
            setCurrentCardIndex(prev => prev + 1);
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
                            <p className="text-foreground mb-4 font-base">Error: {error}</p>
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
                        className="
                        absolute inset-0 -z-10 pointer-events-none opacity-70 dark:opacity-50
                        [--grid:rgba(0,0,0,0.08)] dark:[--grid:rgba(255,255,255,0.12)]
                        bg-[linear-gradient(to_right,var(--grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid)_1px,transparent_1px)]
                        bg-[size:48px_48px]
                        "
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
                                    <div className="space-y-4">
                                        <p className="text-sm text-foreground font-base">
                                            Set ID: {setId}
                                        </p>
                                        <Button asChild>
                                            <Link href="/groups">Back to Groups</Link>
                                        </Button>
                                    </div>
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
                        className="
                        absolute inset-0 -z-10 pointer-events-none opacity-70 dark:opacity-50
                        [--grid:rgba(0,0,0,0.08)] dark:[--grid:rgba(255,255,255,0.12)]
                        bg-[linear-gradient(to_right,var(--grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid)_1px,transparent_1px)]
                        bg-[size:48px_48px]
                        "
                    />

                    <section className="min-h-[calc(100vh-3.5rem)] px-4 py-8 relative z-0">
                        <div className="max-w-2xl mx-auto">
                            {/* Breadcrumb Navigation */}
                            <div className="mb-6">
                                <DynamicBreadcrumb />
                            </div>

                            <Card className="text-center">
                                <CardHeader>
                                    <CardTitle className="text-main">Study Complete!</CardTitle>
                                    <CardDescription>
                                        Great job! You&apos;ve reviewed all {cards.length} cards.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button onClick={restartStudy} className="w-full">
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Study Again
                                    </Button>
                                    <Button asChild variant="neutral" className="w-full">
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
    const progress = (currentCardIndex / cards.length) * 100;

    return (
        <RequireAuth>
            <main className="relative isolate pt-14">
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
                    <div className="max-w-2xl mx-auto">
                        {/* Breadcrumb Navigation */}
                        <div className="mb-6">
                            <DynamicBreadcrumb />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="text-sm text-foreground font-base ">
                                {currentCardIndex + 1} of {cards.length} cards
                            </div>
                        </div>

                        {/* User Stats */}
                        {stats && (
                            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="p-3 bg-main">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-main text-white" />
                                        <div>
                                            <div className="text-xs text-foreground font-base dark:text-black">Level</div>
                                            <div className="font-heading dark:text-black">{stats.level}</div>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-3 bg-main">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-main text-white" />
                                        <div>
                                            <div className="text-xs text-foreground font-base dark:text-black">XP</div>
                                            <div className="font-heading dark:text-black">{stats.xp}</div>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-3 bg-main">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-main text-white" />
                                        <div>
                                            <div className="text-xs text-foreground font-base dark:text-black">Streak</div>
                                            <div className="font-heading dark:text-black">{stats.streakCount} days</div>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-3 bg-main">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-main text-white" />
                                        <div>
                                            <div className="text-xs text-foreground font-base dark:text-black">Mastered</div>
                                            <div className="font-heading dark:text-black">{stats.masteredCards}</div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Level Progress */}
                        {stats && (
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2 font-base">
                                    <span className="text-foreground">Level {stats.level} Progress</span>
                                    <span className="text-foreground">
                                        {stats.progressInLevel}/{stats.progressInLevel + stats.xpNeededForNextLevel} XP
                                    </span>
                                </div>
                                <Progress value={stats.progressPercentage} className="h-2" />
                                <div className="text-xs text-foreground mt-1 font-base">
                                    {stats.xpNeededForNextLevel} XP to Level {stats.level + 1}
                                </div>
                            </div>
                        )}

                        {/* Progress Bar */}
                        <div className="mb-8">
                            <Progress value={progress} className="h-3" />
                            <div className="flex justify-between text-xs text-foreground mt-2 font-base">
                                <span>Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                        </div>

                        {/* Card */}
                        <Card className="min-h-[400px] flex flex-col bg-main">
                            <CardHeader className="text-center">
                                <CardTitle className="text-xl dark:text-black">
                                    Choose the correct answer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex items-center justify-center">
                                <div className="text-center w-full">
                                    <p className="text-lg leading-relaxed mb-6 font-base dark:text-black">
                                        {currentCard.question}
                                    </p>
                                    
                    {/* Always show multiple choice options */}
                    <div className="space-y-4">
                        {currentCard.options && currentCard.options.length > 0 ? (
                            currentCard.options.slice(0, 4).map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedOption(index)}
                                    className={`w-full p-4 text-left rounded-base border-2 transition-all font-base ${
                                        selectedOption === index
                                            ? 'bg-main text-main-foreground border-border shadow-shadow'
                                            : 'bg-secondary-background text-foreground border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))
                        ) : (
                            <div className="text-center p-4 bg-secondary-background border-2 border-border rounded-base shadow-shadow">
                                <p className="text-foreground font-heading">No answer options available</p>
                                <p className="text-foreground text-sm mt-1 font-base">This card may need to be regenerated with AI</p>
                            </div>
                        )}
                    </div>
                                </div>
                            </CardContent>
                            <CardContent className="pt-0">
                                {!showFeedback ? (
                                    <Button 
                                        onClick={submitAnswer}
                                        className="w-full"
                                        size="lg"
                                        disabled={selectedOption === null}
                                    >
                                        Submit Answer
                                    </Button>
                                ) : lastResponse ? (
                                    <div className="space-y-4">
                                        <div className={`text-center p-4 rounded-base border-2 shadow-shadow ${
                                            lastResponse.isCorrect 
                                                ? 'text-white border-black' 
                                                : 'text-white border-black'
                                        }`} style={{
                                            backgroundColor: lastResponse.isCorrect ? '#05e17a' : '#ff4d4f'
                                        }}>
                                            <p className="font-heading text-lg mb-2">{lastResponse.feedback}</p>
                                            {!lastResponse.isCorrect && (
                                                <p className="text-sm font-base">
                                                    Correct answer: {lastResponse.answer}
                                                </p>
                                            )}
                                            {lastResponse.explanation && (
                                                <p className="text-sm mt-2 italic font-base">
                                                    {lastResponse.explanation}
                                                </p>
                                            )}
                                        </div>
                                        <Button 
                                            onClick={nextCard}
                                            className="w-full"
                                            size="lg"
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
        </RequireAuth>
    );
}
