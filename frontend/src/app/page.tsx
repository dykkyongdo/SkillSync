"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight, Users, BookOpen, TrendingUp, Award, Target,
} from "lucide-react";
import Star9 from "@/components/icons/Star9";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VerticalMarquee from "@/components/ui/vertical-marquee";
import WeeklyProgressChart from "@/components/WeeklyProgressChart";
import DebugAPI from "@/components/DebugAPI";

/* Progress bar: blue fill, white track, black border */
function BrutalProgress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-3 rounded-full overflow-hidden border-2 border-black bg-secondary-background">
      <div className="h-full bg-main" style={{ width: `${v}%` }} />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden">
      <DebugAPI />
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-background" />
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-70 dark:opacity-20
                      bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)]
                      bg-[size:48px_48px]" />

      {/* Left column (up) */}
      <aside className="fixed left-[-72px] top-0 h-screen w-80 xl:w-96 pointer-events-none z-10 overflow-visible">
        <VerticalMarquee speed={60} gap={24}>
          <LeftItems />
        </VerticalMarquee>
      </aside>

      {/* Right column (down) */}
      <aside className="fixed right-[-80px] top-0 h-screen w-80 xl:w-[22rem] pointer-events-none z-10 overflow-visible">git
        <VerticalMarquee reverse speed={60} gap={24}>
          <RightItems />
        </VerticalMarquee>
      </aside>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 lg:px-6 text-center relative z-0">
        <h1 className="font-bold tracking-tight text-6xl sm:text-5xl md:text-4xl leading-[1.05] flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
          Groups + Flashcards{" "}
          <span className="relative inline-flex items-center align-middle">
            <Star9 fill="none" className="absolute -left-4 -top-3 h-10 w-10 stroke-5 stroke-black text-main z-10 pointer-events-none" />
            <span className="relative inline-block rounded-base border-2 border-border/40 bg-main/50 px-2 py-2">
              <span className="relative">Learning</span>
            </span>
            <Star9 fill="none" className="absolute -right-4 -bottom-4 h-10 w-10 text-main stroke-5 stroke-black z-10 pointer-events-none" />
          </span>{" "}
          Platform
        </h1>

        <p className="mt-6 text-foreground/80 text-lg sm:text-xl font-medium max-w-3xl mx-auto">
          Organize your study materials in groups, create flashcard sets, and
          master your knowledge with spaced repetition.
        </p>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="h-12 px-6 text-lg sm:text-xl font-medium [&>svg]:w-7 [&>svg]:h-7">
            <Link href="/auth/register">
              Get Started
              <ArrowUpRight className="ml-2 [stroke-width:2]" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

/* -------------------- Left stack items -------------------- */
function LeftItems() {
  return (
    <div className="flex flex-col gap-6">
      {/* Study Group */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" /> Study Group — React Pro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-foreground shadow-shadow">
              <div className="text-xs">Cards</div>
              <div className="text-lg font-bold">132</div>
            </div>
            <div className="rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-foreground shadow-shadow">
              <div className="text-xs">Due</div>
              <div className="text-lg font-bold">23</div>
            </div>
          </div>
          <div className="text-sm font-semibold text-foreground">
            Next review: Today, 6:00 PM
          </div>
        </CardContent>
      </Card>

      {/* Spanish Verbs */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Spanish verbs — A1/A2</CardTitle>
          <CardDescription className="text-foreground/90 font-medium">
            Conjugations with examples
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">45 cards • 6 sets</div>
          <BrutalProgress value={72} />
          <div className="text-sm font-semibold">Mastery: 72%</div>
          <div className="text-sm flex flex-col gap-1">
            <span>ir✅ &nbsp; Preterite vs. Imperfect</span>
            <span>ser✅ &nbsp; Present tense</span>
          </div>
        </CardContent>
      </Card>

      {/* XP */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-extrabold tracking-tight">1,247 XP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BrutalProgress value={64} />
          <div className="text-sm flex items-center justify-between">
            <span>Streak: <strong>8 days</strong></span>
            <span>Level <strong>8</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress (white bars with grid) */}
      <WeeklyProgressChart />

      {/* Level Up */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="h-4 w-4" /> Level Up
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-xl font-extrabold">Level 12</div>
          <div className="text-sm">Next: 2,000 XP</div>
        </CardContent>
      </Card>

      {/* Daily Goal */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" /> Daily Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-lg font-extrabold">85%</div>
          <BrutalProgress value={85} />
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------- Right stack items -------------------- */
function RightItems() {
  return (
    <div className="flex flex-col gap-6">
      {/* Flashcard */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Flashcard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm font-semibold">What is React?</div>
          <div className="text-xs">A JavaScript library for building user interfaces</div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-xl font-extrabold">7 days</div>
          <div className="text-xs">Keep it up!</div>
        </CardContent>
      </Card>

      {/* Group */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" /> Math Study Group
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <CardDescription className="text-foreground/90 font-medium">
            Calculus &amp; Algebra practice
          </CardDescription>
          <div className="text-xs">
            <span className="inline-block rounded-base border-2 border-border bg-secondary-background px-2 py-1 text-foreground shadow-shadow">
              8 members
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Today’s XP */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Today&apos;s XP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BrutalProgress value={73} />
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="inline-grid place-items-center size-5 rounded-full border-2 border-border bg-secondary-background text-foreground shadow-shadow">✓</span>
              <span>+30 XP — React Hooks set</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-grid place-items-center size-5 rounded-full border-2 border-border bg-secondary-background text-foreground shadow-shadow">✓</span>
              <span>+20 XP — Spanish verbs A1</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-grid place-items-center size-5 rounded-full border-2 border-border bg-secondary-background text-foreground shadow-shadow">✓</span>
              <span>+23 XP — Math integrals</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* History Facts */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> History Facts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-foreground/90 font-medium">World War II</CardDescription>
          <div className="mt-2 text-xs">32 cards</div>
        </CardContent>
      </Card>

      {/* Achievement */}
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="h-4 w-4" /> Achievement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">Study Master</div>
          <div className="text-xs">Completed 100 cards</div>
        </CardContent>
      </Card>
    </div>
  );
}
