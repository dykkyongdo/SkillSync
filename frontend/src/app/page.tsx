import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Star9 from "@/components/icons/Star9";

export default function HomePage() {
  return (
    <main className="relative isolate">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-background" />
      <div
        className="absolute inset-0 -z-10 opacity-30 dark:opacity-20 pointer-events-none
                    bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)]
                    bg-[size:48px_48px]"
      />

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 lg:px-6 text-center  relative z-0">
        <h1 className="font-heading font-bold tracking-tight text-6xl sm:text-5xl md:text-4xl leading-[1.05] flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
            Groups + Flashcards{" "}
            <span className="relative inline-flex items-center align-middle">
                {/* top-left star */}
                <Star9
                fill="none"
                className="absolute -left-4 -top-3 h-10 w-10 stroke-5 stroke-black text-main z-10 pointer-events-none"
                />

                {/* highlighted word: translucent box, subtle 1px outline, offset shadow */}
                <span className="relative inline-block rounded-base border-2 border-border/40 bg-main/50 px-2 py-2">
                <span className="relative">Learning</span>
                </span>
                <Star9
                fill="none"
                className="absolute -right-4 -bottom-4 h-10 w-10 text-main stroke-5 stroke-black z-10 pointer-events-none"
                />
            </span>{" "}
            Platform
        </h1>

        <p className="mt-6 text-foreground/80 text-lg sm:text-xl font-medium max-w-3xl mx-auto">
          Organize your study materials in groups, create flashcard sets, and
          master your knowledge with spaced repetition.
        </p>

        <div className="mt-12 flex justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 px-6 text-lg sm:text-xl font-medium [&>svg]:w-7 [&>svg]:h-7"
          >
            <Link href="/register">
              Get Started
              <ArrowUpRight className="ml-2 [stroke-width:2]" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
