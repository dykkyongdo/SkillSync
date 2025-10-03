"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useCards } from "@/hooks/useCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";

export default function SetPage() {
    const params = useParams();
    const setId = params.setId as string;
    const { items: cards, loading, error, create, remove } = useCards(setId);
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
        if (!confirm("Are you sure you want to delete this card?")) return;
        
        try {
            await remove(cardId);
        } catch (err) {
            alert("Failed to delete card: " + (err as Error).message);
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

                        {/* Create Card Button */}
                        {!showCreateForm && (
                            <div className="mb-8 flex gap-4">
                                <Button onClick={() => setShowCreateForm(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Card
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={`/study/${setId}`}>
                                        Start Studying
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {/* Loading and Error States */}
                        {loading && <p>Loading cards...</p>}
                        {error && <p className="text-red-600">Error: {error}</p>}
                        
                        {/* Empty State */}
                        {!loading && !error && cards.length === 0 && (
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteCard(card.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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
