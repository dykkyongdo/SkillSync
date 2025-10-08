// /frontend/src/components/WeeklyProgressChart.tsx
"use client";

import { TrendingUp } from "lucide-react";
import {
    Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis,
} from "recharts";

import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
    { day: "Mon", xp: 40 },
    { day: "Tue", xp: 65 },
    { day: "Wed", xp: 30 },
    { day: "Thu", xp: 80 },
    { day: "Fri", xp: 45 },
    { day: "Sat", xp: 70 },
    { day: "Sun", xp: 55 },
];

const chartConfig = {
    xp: { label: "XP" },
} satisfies ChartConfig;

export default function WeeklyProgressChart() {
    return (
        <Card
        className="
            w-72 xl:w-80
            bg-main text-main-foreground
            border-2 border-border shadow-shadow
            overflow-visible
        "
        >
        <CardHeader className="pb-1">
            <CardTitle className="text-base font-semibold">Weekly Progress</CardTitle>
            <CardDescription className="text-main-foreground/80 font-medium">
            XP earned by day
            </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
            <ChartContainer
            config={chartConfig}
            className="h-40 w-full overflow-visible"  
            >
            <BarChart data={chartData}>
                {/* neo-brutal offset shadow for bars */}
                <defs>
                <filter id="brutalShadow" x="-25%" y="-25%" width="150%" height="170%">
                    <feOffset dx="4" dy="4" in="SourceAlpha" result="off" />
                    <feFlood floodColor="var(--color-border)" result="flood" />
                    <feComposite in="flood" in2="off" operator="in" result="shadow" />
                    <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                </defs>

                {/* grid lines (horizontal only) */}
                <YAxis hide domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.28)" strokeDasharray="0" />

                <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fill: "var(--color-foreground)", fontSize: 12, fontWeight: 700 }}
                />

                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

                <Bar
                dataKey="xp"
                fill="var(--color-secondary-background)"   // white fill
                stroke="var(--color-border)"               // black outline
                strokeWidth={2}
                radius={[6, 6, 0, 0]}
                filter="url(#brutalShadow)"
                maxBarSize={30} // keeps proportions similar to other items
                >
                <LabelList
                    dataKey="xp"
                    position="top"
                    className="fill-[var(--color-foreground)] text-[11px] font-semibold"
                    offset={6}
                />
                </Bar>
            </BarChart>
            </ChartContainer>
        </CardContent>

        <CardFooter className="pt-1 pb-3 px-4 flex-col items-start gap-1 text-[11px]">
            <div className="flex gap-2 leading-none font-medium">
            Trending up by 5.2% this week <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none opacity-90">Daily XP totals for the last 7 days</div>
        </CardFooter>
        </Card>
    );
}
