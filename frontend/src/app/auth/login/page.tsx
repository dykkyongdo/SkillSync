"use client"

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
            {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",
            }
        );
        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            throw new Error(msg || "Login failed");
        }
        router.push("/groups");
        router.refresh();
        } catch (err: any) {
        setError(err.message ?? "Something went wrong");
        } finally {
        setLoading(false);
        }
    }

    return (
        <main className="relative isolate pt-14">
        <div className="absolute inset-0 -z-10 bg-background" />
        <div
            className="absolute inset-0 -z-10 opacity-70 dark:opacity-20 pointer-events-none
                        bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)]
                        bg-[size:48px_48px]"
        />

        <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 relative z-0">
            <Card className="w-full max-w-sm bg-white">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">Login to your account</CardTitle>
                <CardDescription className="font-medium">
                Enter your email below to login to your account
                </CardDescription>
            </CardHeader>

            <form id="login-form" onSubmit={onSubmit}>
                <CardContent>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                    <Label htmlFor="email" className="font-semibold">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>

                    <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password" className="font-semibold">Password</Label>
                        <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline font-medium"
                        >
                        Forgot your password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                </CardContent>

                <CardFooter className="flex-col gap-2 mt-6">
                <Button type="submit" className="w-full font-medium" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                </Button>
                <Button
                    type="button"
                    variant="neutral"
                    className="w-full h-11 font-medium"
                    onClick={() => alert("Google login TODO")}
                >
                    Login with Google
                </Button>

                <div className="mt-4 text-center text-sm font-medium">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="underline underline-offset-4">
                    Sign Up
                    </Link>
                </div>
                </CardFooter>
            </form>
            </Card>
        </section>
        </main>
    );
}
