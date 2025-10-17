"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { useAIGeneration, type AIGenerationRequest } from "@/hooks/useAIGeneration";

interface AIFlashcardGeneratorProps {
  setId: string;
  onFlashcardsGenerated: (flashcards: any[]) => void;
  onClose: () => void;
}

export function AIFlashcardGenerator({
  setId,
  onFlashcardsGenerated,
  onClose,
}: AIFlashcardGeneratorProps) {
  const {
    generateFlashcards,
    getTopicSuggestions,
    isGenerating,
    error,
  } = useAIGeneration();

  // basic state only
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");

  const difficulties = ["Beginner", "Easy", "Medium", "Hard", "Expert"];

  // lightweight AI suggestions (no advanced panel)
  const [suggestions, setSuggestions] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (topic.trim().length > 3) {
      const tid = setTimeout(async () => {
        try {
          const s = await getTopicSuggestions(topic);
          setSuggestions(s);
          setShowSuggestions(true);
        } catch {
          /* ignore */
        }
      }, 600);
      return () => clearTimeout(tid);
    } else {
      setShowSuggestions(false);
    }
  }, [topic, getTopicSuggestions]);

  const handleUseSuggestion = (s: any) => {
    setCount(s?.suggestedCount || 5);
    setDifficulty(s?.suggestedDifficulty || "Medium");
    setShowSuggestions(false);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const req: AIGenerationRequest = { topic: topic.trim(), count, difficulty };
    const generated = await generateFlashcards(setId, req);
    onFlashcardsGenerated(generated);
    onClose();
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[12px] border-2 border-border shadow-shadow bg-background">
        <DialogHeader className="gap-1">
          <DialogTitle className="font-heading text-2xl font-semibold">
            Edit with AI
          </DialogTitle>
          <DialogDescription className="font-medium text-foreground/80">
            Make flashcards from a topic. Click <span className="font-semibold">Generate</span> when you’re ready.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-1">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="font-medium">
              Topic
            </Label>
            <div className="relative">
              <Input
                id="topic"
                placeholder="e.g., React Hooks, WW2, Python Basics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="border-2 border-border shadow-shadow bg-secondary-background"
              />

              {suggestions && showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 z-10 rounded-base border-2 border-border bg-secondary-background shadow-shadow">
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-grid place-items-center size-6 rounded-base border-2 border-border bg-main text-main-foreground shadow-shadow">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-semibold">AI Suggestions</span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-base border-2 border-border bg-background px-3 py-2 shadow-shadow">
                        <div className="text-[11px] uppercase tracking-wide font-semibold text-foreground/70">
                          Difficulty
                        </div>
                        <Badge
                          variant="secondary"
                          className="mt-1 rounded-base border-2 border-border shadow-shadow"
                        >
                          {suggestions.suggestedDifficulty ?? "—"}
                        </Badge>
                      </div>

                      <div className="rounded-base border-2 border-border bg-background px-3 py-2 shadow-shadow">
                        <div className="text-[11px] uppercase tracking-wide font-semibold text-foreground/70">
                          Count
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {suggestions.suggestedCount ?? "—"}
                        </div>
                      </div>

                      <div className="rounded-base border-2 border-border bg-background px-3 py-2 shadow-shadow">
                        <div className="text-[11px] uppercase tracking-wide font-semibold text-foreground/70">
                          Aspects
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {suggestions.suggestedAspects?.slice(0, 3).map(
                            (a: string, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="rounded-base border-2 border-border shadow-shadow text-[11px] font-semibold"
                              >
                                {a}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleUseSuggestion(suggestions)}
                      className="mt-3 w-full font-semibold border-2 border-border shadow-shadow bg-main text-main-foreground"
                    >
                      Use Suggestions
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Two columns like screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="count" className="font-medium">
                Number of Cards
              </Label>
              <Select
                value={String(count)}
                onValueChange={(v) => setCount(parseInt(v))}
              >
                <SelectTrigger className="border-2 border-border shadow-shadow bg-secondary-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-base border-2 border-border shadow-shadow bg-secondary-background">
                  {[3, 5, 8, 10, 15, 20].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="font-medium">
                Difficulty
              </Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="border-2 border-border shadow-shadow bg-secondary-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-base border-2 border-border shadow-shadow bg-secondary-background">
                  {difficulties.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-base border-2 border-border shadow-shadow bg-white p-3">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer like screenshot (Cancel / Save) */}
        <DialogFooter className="mt-4 gap-2 sm:gap-3">
          <Button
            variant="neutral"
            onClick={onClose}
            className="font-medium border-2 border-border shadow-shadow bg-secondary-background"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="font-semibold border-2 border-border shadow-shadow bg-main text-main-foreground"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Save & Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
  );
}
