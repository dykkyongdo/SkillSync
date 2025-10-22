"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function RegisterForm() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirm, setConfirm] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [testCredentials, setTestCredentials] = React.useState<{email: string, password: string} | null>(null);
    const search = useSearchParams();
    const next = search.get("next") || "/groups";

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (!email.trim()) {
            setError("Email is required");
            return;
        }
        
        if (!email.includes("@") || !email.includes(".")) {
            setError("Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirm) {
        setError("Passwords do not match.");
        return;
        }

        setLoading(true);
        try {
        const data = await api<{ token: string }>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        login(data.token);
        router.push(next);
        router.refresh();
        } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function createTestAccount() {
        setLoading(true);
        setError(null);
        try {
            const data = await api<{ token: string; email: string; password: string }>("/api/auth/test-account", {
                method: "POST",
            });
            
            setTestCredentials({ email: data.email, password: data.password });
            login(data.token);
            
            setTimeout(() => {
                router.push(next);
                router.refresh();
            }, 100);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create test account");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative isolate pt-14">
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-background" />
        <div
            className="
            absolute inset-0 -z-10 pointer-events-none opacity-70 dark:opacity-50
            [--grid:rgba(0,0,0,0.08)] dark:[--grid:rgba(255,255,255,0.12)]
            bg-[linear-gradient(to_right,var(--grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid)_1px,transparent_1px)]
            bg-[size:48px_48px]
            "
        />

        <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 relative z-0">
            <Card className="w-full max-w-sm bg-white dark:bg-[var(--main)]">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">Create your account</CardTitle>
                <CardDescription className="font-medium">Join SkillSync</CardDescription>
            </CardHeader>

            <form id="register-form" onSubmit={onSubmit}>
                <CardContent>
                <div className="flex flex-col gap-4">
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
                    <Label htmlFor="password" className="font-semibold">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                    </div>

                    <div className="grid gap-2">
                    <Label htmlFor="confirm" className="font-semibold">Confirm password</Label>
                    <Input
                        id="confirm"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                </CardContent>

                <CardFooter className="flex-col gap-2 mt-6">
                <Button
                    type="submit"
                    form="register-form"
                    disabled={loading}
                    className="w-full h-11 text-base font-medium"
                >
                    {loading ? "Creating..." : "Create account"}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 font-medium"
                    onClick={createTestAccount}
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Try Demo Account"}
                </Button>

                {testCredentials && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            Demo account created!
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                            Email: {testCredentials.email}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-300">
                            Password: {testCredentials.password}
                        </p>
                    </div>
                )}

                <div className="mt-4 text-center text-sm font-medium">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="underline underline-offset-4 font-medium">
                        Log in
                    </Link>
                </div>
                </CardFooter>
            </form>
            </Card>
        </section>
        </main>
    );
}

export default function RegisterPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
        </React.Suspense>
    );
}
