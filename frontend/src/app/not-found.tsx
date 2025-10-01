// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
    return (
        <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-heading font-extrabold text-4xl">404</h1>
        <p className="mt-3 text-foreground/80">
            This page could not be found.
        </p>
        <div className="mt-8">
            <Link
            href="/"
            className="inline-block px-4 py-2 rounded-base border-2 border-border bg-secondary-background shadow-shadow"
            >
            Back to home
            </Link>
        </div>
        </main>
    );
}
