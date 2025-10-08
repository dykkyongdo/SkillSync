"use client"

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type DailyXpData = {
  date: string;
  xp: number;
  day: string;
};

const chartConfig = {
  xp: {
    label: "XP Earned",
    color: "#0099FF",
  },
} satisfies ChartConfig;

export default function XpChart() {
  const [data, setData] = React.useState<DailyXpData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const xpData = await api<DailyXpData[]>("/api/me/daily-xp", { method: "GET" });
        if (!cancelled) setData(xpData);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load XP data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate total XP and trend
  const totalXp = data.reduce((sum, day) => sum + day.xp, 0);
  const avgXp = data.length > 0 ? Math.round(totalXp / data.length) : 0;
  const todayXp = data.length > 0 ? data[data.length - 1].xp : 0;
  const yesterdayXp = data.length > 1 ? data[data.length - 2].xp : 0;
  const trend = yesterdayXp > 0 ? ((todayXp - yesterdayXp) / yesterdayXp * 100) : 0;

  if (loading) {
    return (
      <Card className="border-2 border-border shadow-shadow bg-secondary-background">
        <CardHeader>
          <CardTitle className="font-semibold">Daily XP Progress</CardTitle>
          <CardDescription className="font-medium">Loading your XP data...</CardDescription>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="h-48 w-full bg-foreground/10 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-border shadow-shadow bg-secondary-background">
        <CardHeader>
          <CardTitle className="font-semibold text-red-600">Error</CardTitle>
          <CardDescription className="font-medium">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border shadow-shadow bg-secondary-background">
      <CardHeader>
        <CardTitle className="font-semibold">Daily XP Progress</CardTitle>
        <CardDescription className="font-medium">Your XP earned over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barCategoryGap="20%"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#cbd5e1" 
                vertical={false}
                opacity={0.8}
              />
              <XAxis
                dataKey="day"
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={{ stroke: "#e2e8f0" }}
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickCount={6}
                domain={[0, 'dataMax + 10']}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-white p-3 shadow-lg">
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-blue-600">
                          <span className="font-medium">{payload[0].value}</span> XP earned
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: 'rgba(0, 153, 255, 0.1)' }}
              />
              <Bar 
                dataKey="xp" 
                fill="#0099FF"
                radius={[6, 6, 0, 0]}
                stroke="#0088e5"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trend > 0 ? (
            <>
              Trending up by {Math.abs(trend).toFixed(1)}% today 
              <TrendingUp className="h-4 w-4 text-green-600" />
            </>
          ) : trend < 0 ? (
            <>
              Down by {Math.abs(trend).toFixed(1)}% from yesterday 
              <TrendingUp className="h-4 w-4 rotate-180 text-red-600" />
            </>
          ) : (
            <>
              Same as yesterday 
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </>
          )}
        </div>
        <div className="text-foreground/70 leading-none">
          {totalXp} XP total • {avgXp} XP average per day
        </div>
      </CardFooter>
    </Card>
  );
}
