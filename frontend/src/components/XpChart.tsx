"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts"
import { api } from "@/lib/api"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartTooltip,
} from "@/components/ui/chart"

type DailyXpData = {
  date: string
  xp: number
  day: string
}

export default function XpChart() {
  const [data, setData] = React.useState<DailyXpData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const xpData = await api<DailyXpData[]>("/api/me/daily-xp", { method: "GET" })
        if (!cancelled) setData(xpData)
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load XP data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const totalXp = data.reduce((sum, d) => sum + d.xp, 0)
  const avgXp = data.length ? Math.round(totalXp / data.length) : 0
  const todayXp = data.at(-1)?.xp ?? 0
  const yesterdayXp = data.length > 1 ? data[data.length - 2].xp : 0
  const trend = yesterdayXp > 0 ? ((todayXp - yesterdayXp) / yesterdayXp) * 100 : 0

  if (loading) {
    return (
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground">
        <CardHeader>
          <CardTitle className="font-semibold">Daily XP Progress</CardTitle>
          <CardDescription className="font-medium text-main-foreground/90">
            Loading your XP data...
          </CardDescription>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="h-48 w-full rounded-base border-2 border-border bg-secondary-background shadow-shadow" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground">
        <CardHeader>
          <CardTitle className="font-semibold text-red-900">Error</CardTitle>
          <CardDescription className="font-medium text-main-foreground/90">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-border shadow-shadow bg-main text-main-foreground">
      <CardHeader>
        <CardTitle className="font-semibold">Daily XP Progress</CardTitle>
        <CardDescription className="font-medium text-main-foreground/90">
          Your XP earned over the last 7 days
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 12, left: 8, bottom: 12 }} barCategoryGap="24%">
              {/* Neo-brutal drop shadow for bars */}
              <defs>
                <filter id="brutalShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feOffset dx="4" dy="4" in="SourceAlpha" result="off" />
                  <feFlood floodColor="var(--color-border)" result="flood" />
                  <feComposite in="flood" in2="off" operator="in" result="shadow" />
                  <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Black-ish horizontal grid (no verticals) */}
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.28)" strokeDasharray="0" />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tick={{ fill: "var(--color-foreground)", fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-foreground)", fontSize: 11 }}
                tickCount={6}
                domain={[0, (dataMax: number) => Math.max(100, dataMax + 10)]}
              />

              <ChartTooltip
                cursor={{ fill: "rgba(0,0,0,0.08)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-base border-2 border-border bg-secondary-background p-2 text-foreground shadow-shadow">
                        <div className="text-xs font-semibold">{label}</div>
                        <div className="text-sm">
                          <span className="font-bold">{payload[0].value}</span> XP
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />

              <Bar
                dataKey="xp"
                fill="var(--color-secondary-background)"  // white
                stroke="var(--color-border)"              // black outline
                strokeWidth={2}
                radius={[6, 6, 0, 0]}
                filter="url(#brutalShadow)"
                maxBarSize={36}
              >
                <LabelList
                  dataKey="xp"
                  position="top"
                  className="fill-[var(--color-foreground)] text-[11px] font-semibold"
                  offset={6}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trend > 0 ? (
            <>
              Trending up by {Math.abs(trend).toFixed(1)}% today
              <TrendingUp className="h-4 w-4 text-green-700" />
            </>
          ) : trend < 0 ? (
            <>
              Down by {Math.abs(trend).toFixed(1)}% from yesterday
              <TrendingUp className="h-4 w-4 rotate-180 text-red-700" />
            </>
          ) : (
            <>
              Same as yesterday
              <TrendingUp className="h-4 w-4 text-foreground/70" />
            </>
          )}
        </div>
        <div className="leading-none text-main-foreground/90">
          {totalXp} XP total • {avgXp} XP average per day
        </div>
      </CardFooter>
    </Card>
  )
}
