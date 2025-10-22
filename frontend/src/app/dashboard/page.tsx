"use client"

import * as React from "react"
import Link from "next/link"
import RequireAuth from "@/components/RequireAuth"
import XpChart from "@/components/XpChart"
import { api } from "@/lib/api"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader, 
  CardTitle,
} from "@/components/ui/card"

type Stats = { 
  xp: number
  level: number
  streakCount: number
  masteredCards: number 
  dueToday: number
}

export default function DashboardPage() { 
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false 
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api<Stats>("/api/me/stats", { method: "GET" })
        if (!cancelled) setStats(data)
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const [recentActivity, setRecentActivity] = React.useState<Array<{id: string, when: string, text: string}>>([])
  const [activityLoading, setActivityLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setActivityLoading(true)
        const activity = await api<Array<{id: string, when: string, text: string}>>("/api/me/recent-activity", { method: "GET" })
        if (!cancelled) setRecentActivity(activity)
      } catch {
        if (!cancelled) {
          // Set placeholder data on error
          setRecentActivity([
            { id: "error", when: "Just now", text: "Unable to load recent activity" }
          ])
        }
      } finally {
        if (!cancelled) setActivityLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <RequireAuth>
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
        
        <section className="min-h-[calc(100vh-3.5rem)] px-4 py-8 relative z-0">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-foreground/70 font-medium">Track your learning at a glance</p>
              </div>

              <Button
                asChild
                className="font-semibold border-2 border-border shadow-shadow bg-main text-main-foreground"
              >
                <Link href="/groups">View Groups</Link>
              </Button>
            </div> 

            {/* Loading */}
            {loading && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card
                    key={i}
                    className="border-2 border-border shadow-shadow bg-main text-main-foreground"
                  >
                    <CardHeader className="animate-pulse">
                      <div className="h-5 w-24 bg-black/20 rounded" />
                      <div className="mt-2 h-8 w-16 bg-black/20 rounded" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <Card className="mb-6 border-2 border-border shadow-shadow bg-main text-main-foreground">
                <CardHeader>
                  <CardTitle className="text-red-900">Error</CardTitle>
                  <CardDescription className="font-medium text-main-foreground/90">{error}</CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Stats */}
            {!loading && !error && stats && (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                  <StatCard label="XP"             value={stats.xp} />
                  <StatCard label="Level"          value={stats.level} />
                  <StatCard label="Streak"         value={stats.streakCount} />
                  <StatCard label="Mastered Cards" value={stats.masteredCards} />
                  <StatCard label="Due Today"      value={stats.dueToday} />
                </div>

                {/* XP Chart and Quick Actions */}
                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    {/* If XpChart supports className on its Card, this will color it. */}
                    <XpChart/>
                  </div>

                  <div className="lg:col-span-1">
                    <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground h-full">
                      <CardHeader>
                        <CardTitle className="font-semibold">Quick Actions</CardTitle>
                        <CardDescription className="font-medium text-main-foreground/90">
                          Jump back into learning
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-3">
                          <Button asChild className="font-semibold border-2 border-border shadow-shadow bg-secondary-background text-foreground">
                            <Link href="/groups">View Groups</Link>
                          </Button>
                          <Button asChild className="font-semibold border-2 border-border shadow-shadow bg-secondary-background text-foreground">
                            <Link href="/notifications">Notifications</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Recent activity */}
                <div className="mt-8">
                  <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground">
                    <CardHeader>
                      <CardTitle className="font-semibold">Recent Activity</CardTitle>
                      <CardDescription className="font-medium text-main-foreground/90">
                        Your latest learning actions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {activityLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-1 animate-pulse">
                              <div className="mt-0.5 h-6 w-16 bg-black/20 rounded-base" />
                              <div className="h-4 w-48 bg-black/20 rounded" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {recentActivity.map((it) => (
                            <li
                              key={it.id}
                              className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-1"
                            >
                              <span className="mt-0.5 inline-block rounded-base border-2 border-border bg-secondary-background px-2 py-0.5 text-xs font-semibold text-foreground shadow-shadow">
                                {it.when}
                              </span>
                              <span className="font-medium">{it.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </RequireAuth>
  )

  function StatCard({
    label, 
    value,
  }: {
    label: string
    value: React.ReactNode
  }) {
    return (
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground">
        <CardHeader>
          <CardDescription className="font-medium text-main-foreground/90">
            {label}
          </CardDescription>
          <CardTitle className="font-semibold text-3xl leading-tight">
            {value}
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }
}
