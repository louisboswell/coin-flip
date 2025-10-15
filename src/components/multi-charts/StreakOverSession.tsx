"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { useFlip } from "@/contexts/FlipContext";
import type { Flip } from "@/lib/types"; // Assuming you have a Flip type
import { useMemo } from "react";

const chartConfig = {
    frequency: {
        label: "Frequency",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

// 1. A reusable function to calculate streak frequencies from any array of flips.
const calculateStreakFrequencies = (flips: Flip[]) => {
    const streakFrequencies = new Map<number, number>();
    let currentStreakLength = 0;

    flips.forEach((flip, index) => {
        if (flip.result === "H") {
            currentStreakLength++;
        } else {
            // If a streak was in progress, record it
            if (currentStreakLength > 0) {
                streakFrequencies.set(
                    currentStreakLength,
                    (streakFrequencies.get(currentStreakLength) || 0) + 1,
                );
            }
            currentStreakLength = 0; // Reset streak
        }

        // Special case: If the very last flip is part of a streak, record it
        if (index === flips.length - 1 && currentStreakLength > 0) {
            streakFrequencies.set(
                currentStreakLength,
                (streakFrequencies.get(currentStreakLength) || 0) + 1,
            );
        }
    });

    return Array.from(streakFrequencies.entries())
        .map(([streakLength, frequency]) => ({
            streakLength,
            frequency,
        }))
        .sort((a, b) => a.streakLength - b.streakLength);
};

// 2. Define props for the component
type StreakFrequencyChartProps = {
    scope: "session" | "alltime" | "global";
};

// 3. Rename component and accept the 'scope' prop
export function StreakFrequencyChart({ scope }: StreakFrequencyChartProps) {
    const { session, history } = useFlip();

    const chartData = useMemo(() => {
        // 4. Conditional logic based on scope
        if (scope === "session") {
            return calculateStreakFrequencies(session.flips);
        }

        if (scope === "alltime") {
            // Combine all flips from all sessions into one large array
            const allFlips = history.sessions.flatMap((s) => s.flips);
            return calculateStreakFrequencies(allFlips);
        }

        return []; // Default return
    }, [scope, session.flips, history]);

    // 5. Dynamic UI text based on scope
    const cardDescription =
        scope === "session"
            ? "Distribution of consecutive Heads streaks in this session."
            : "Distribution of consecutive Heads streaks across your entire history.";
    const emptyStateMessage =
        scope === "session"
            ? "No Heads streaks to display in this session yet. Keep flipping!"
            : "No Heads streaks to display in your history yet.";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Heads Streak Frequencies</CardTitle>
                <CardDescription>{cardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="streakLength"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        hideLabel
                                        formatter={(value, name, props) => {
                                            const { streakLength } = props.payload as {
                                                streakLength: number;
                                                frequency: number;
                                            };
                                            const streakText = `a streak of ${streakLength} ${streakLength > 1 ? "Heads" : "Head"}`;
                                            const frequencyText = `${value} ${value === 1 ? "time" : "times"}`;
                                            return `You've recorded ${streakText}, ${frequencyText}.`;
                                        }}
                                    />
                                }
                            />
                            <Bar dataKey="frequency" fill="var(--chart-2)" radius={8} />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground mx-12">
                        <CardDescription>{emptyStateMessage}</CardDescription>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}