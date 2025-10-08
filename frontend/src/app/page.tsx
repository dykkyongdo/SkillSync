import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users, BookOpen, BarChart3, TrendingUp, Award, Target, Zap } from "lucide-react";
import Star9 from "@/components/icons/Star9";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-background" />
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-70 dark:opacity-20
                      bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)]
                      bg-[size:48px_48px]" />

      {/* Left column (continuous up) */}
      <aside className="fixed left-[-72px] top-0 h-screen w-80 xl:w-96 pointer-events-none z-10">
        <MarqueeColumn duration="6s">
          <LeftItems />
        </MarqueeColumn>
      </aside>

      {/* Right column (continuous down) */}
      <aside className="fixed right-[-72px] top-0 h-screen w-80 xl:w-96 pointer-events-none z-10">
        <MarqueeColumn duration="6s" reverse>
          <RightItems />
        </MarqueeColumn>
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
          Organize your study materials in groups, create flashcard sets, and master your knowledge with spaced repetition.
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

/* ---------- Seamless vertical marquee helper (2-copy) ---------- */
function MarqueeColumn({
  children,
  reverse = false,
  duration = "8s",
}: {
  children: React.ReactNode;
  reverse?: boolean;
  duration?: string;
}) {
  return (
    <div className="vmarquee-col">
      <div
        className={["vmarquee-track", reverse ? "reverse" : ""].join(" ")}
        style={{ ["--marquee-duration" as any]: duration }}
      >
        {/* Two identical 50%-height stacks. The track animates by ±50%. */}
        <div className="vmarquee-stack">{children}</div>
        <div className="vmarquee-stack">{children}</div>
      </div>
    </div>
  );
}

/* -------------------- Left stack items -------------------- */
function LeftItems() {
  return (
    <>
      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" /> Study Group
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">Advanced React Concepts</CardDescription>
          <div className="mt-2 text-xs">
            <span className="bg-main text-main-foreground px-2 py-1 rounded font-medium">12 members</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Spanish Verbs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">Essential verb conjugations</CardDescription>
          <div className="mt-2 text-xs text-foreground/70">45 cards</div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" /> XP Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">1,247 XP</div>
          <Progress value={65} className="mt-2" />
          <div className="text-xs text-foreground/70 mt-1">Level 8</div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 h-20 items-end">
            {[40, 65, 30, 80, 45, 70, 55].map((h, i) => (
              <div key={i} className="bg-main flex-1 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-4 w-4" /> Level Up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-main">Level 12</div>
          <div className="text-xs text-foreground/70">Next: 2,000 XP</div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" /> Daily Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">85%</div>
          <Progress value={85} className="mt-2" />
        </CardContent>
      </Card>
    </>
  );
}

/* -------------------- Right stack items -------------------- */
function RightItems() {
  return (
    <>
      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Flashcard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">What is React?</div>
          <div className="text-xs text-foreground/70 mt-2">A JavaScript library for building user interfaces</div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-main">7 days</div>
          <div className="text-xs text-foreground/70">Keep it up!</div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" /> Math Study Group
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">Calculus &amp; Algebra</CardDescription>
          <div className="mt-2 text-xs">
            <span className="bg-main text-main-foreground px-2 py-1 rounded font-medium">8 members</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Today&apos;s XP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-foreground/10 rounded-full h-3">
              <div className="bg-main h-3 rounded-full" style={{ width: "73%" }} />
            </div>
            <span className="text-sm font-medium">73 XP</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> History Facts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">World War II</CardDescription>
          <div className="mt-2 text-xs text-foreground/70">32 cards</div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-shadow bg-secondary-background w-72 xl:w-80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-4 w-4" /> Achievement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">Study Master</div>
          <div className="text-xs text-foreground/70 mt-1">Completed 100 cards</div>
        </CardContent>
      </Card>
    </>
  );
}
