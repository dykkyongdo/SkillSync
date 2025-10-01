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
      <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-24 sm:py-28 md:py-32 text-center">
        <h1 className="font-heading font-extrabold tracking-tight text-5xl sm:text-6xl md:text-7xl leading-[1.05]">
            Groups + Flashcards{" "}
            <span className="relative inline-flex items-center align-middle">
                {/* top-left star */}
                <Star9
                aria-hidden
                className="absolute -left-8 -top-8 h-20 w-20 text-main/80"
                />

                {/* highlighted word: translucent box, subtle 1px outline, offset shadow */}
                <span className="relative inline-block rounded-[10px] border-[3px] border-border bg-main/75 px-5 py-2 shadow-shadow">
                <span className="relative">Learning</span>
                </span>
                <Star9
                aria-hidden
                className="absolute -right-9 -bottom-10 h-20 w-20 text-main/80 drop-shadow-md"
                />
            </span>{" "}
            Platform
        </h1>

        <p className="mt-6 text-foreground/80 text-lg sm:text-xl font-base max-w-3xl mx-auto">
          Organize your study materials in groups, create flashcard sets, and
          master your knowledge with spaced repetition.
        </p>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="text-base sm:text-lg">
            <Link href="/docs">
              Read the docs <ArrowUpRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
