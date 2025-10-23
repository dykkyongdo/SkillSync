"use client"
import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import type { Flashcard } from "@/types";

export interface AIGenerationRequest {
    topic: string;
    count: number;
    difficulty: string;
    specificAspects?: string[];
    questionType?: string;
}

export interface AIGenerationResponse {
    topic: string;
    suggestedAspects: string[];
    suggestedDifficulty: string;
    suggestedCount: number;
    questionTypes: string[];
}

export function useAIGeneration() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateFlashcards = useCallback(async (
        setId: string, 
        request: AIGenerationRequest
    ): Promise<Flashcard[]> => {
        setIsGenerating(true);
        setError(null);

        try {
            // Debug logging removed for production("Generating flashcards with AI for topic:", request.topic);
            
            const response = await api<Flashcard[]>(`/api/ai/flashcards/generate`, {
                method: "POST",
                body: JSON.stringify({
                    ...request,
                    setId
                }),
            });

            // Debug logging removed for production("Generated flashcards:", response);
            return response;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to generate flashcards";
            setError(errorMessage);
            console.error("AI generation error:", err);
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const generateAdvancedFlashcards = useCallback(async (
        setId: string, 
        request: AIGenerationRequest
    ): Promise<Flashcard[]> => {
        setIsGenerating(true);
        setError(null);

        try {
            // Debug logging removed for production("Generating advanced flashcards with AI for topic:", request.topic);
            
            const response = await api<Flashcard[]>(`/api/ai/flashcards/generate/advanced`, {
                method: "POST",
                body: JSON.stringify({
                    ...request,
                    setId
                }),
            });

            // Debug logging removed for production("Generated advanced flashcards:", response);
            return response;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to generate advanced flashcards";
            setError(errorMessage);
            console.error("Advanced AI generation error:", err);
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const getTopicSuggestions = useCallback(async (topic: string): Promise<AIGenerationResponse> => {
        setError(null);

        try {
            // Debug logging removed for production("Getting AI suggestions for topic:", topic);
            
            const response = await api<AIGenerationResponse>(`/api/ai/flashcards/suggestions/${encodeURIComponent(topic)}`);
            
            // Debug logging removed for production("AI suggestions:", response);
            return response;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to get topic suggestions";
            setError(errorMessage);
            console.error("AI suggestions error:", err);
            throw err;
        }
    }, []);

    return {
        generateFlashcards,
        generateAdvancedFlashcards,
        getTopicSuggestions,
        isGenerating,
        error,
        clearError: () => setError(null)
    };
}
