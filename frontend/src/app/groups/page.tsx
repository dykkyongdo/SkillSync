"use client";

import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { useGroups } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GroupsPage() {
    const { items: groups, loading, error, create } = useGroups();

    const handleCreateGroup = async () => {
        const name = prompt("Enter group name:");
        const description = prompt("Enter group description:");
        if (name && description) {
            try {
                await create(name, description);
            } catch (err) {
                alert("Failed to create group: " + (err as Error).message);
            }
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
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold">My Groups</h1>
                            <Button onClick={handleCreateGroup}>
                                Create Group
                            </Button>
                        </div>

                        {loading && <p>Loading groups...</p>}
                        {error && <p className="text-red-600">Error: {error}</p>}
                        
                        {!loading && !error && groups.length === 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>No groups yet</CardTitle>
                                    <CardDescription>
                                        Create your first group to get started with organizing your study materials.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        )}

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {groups.map((group) => (
                                <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <CardTitle>{group.name}</CardTitle>
                                        <CardDescription>{group.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Created: {new Date(group.createdAt).toLocaleDateString()}
                                        </p>
                                        <Button asChild className="w-full">
                                            <Link href={`/groups/${group.id}`}>
                                                View Sets
                                            </Link>
                                        </Button>
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
