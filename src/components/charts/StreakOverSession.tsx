"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useFlip } from "@/contexts/FlipContext"
import { useMemo } from "react"

export const description = "A bar chart of Heads streak frequencies for the current session"

const chartConfig = {
    frequency: {
        label: "Frequency",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function StreakFrequencyOverCurrentSession() {
    const { session } = useFlip();

    const chartData = useMemo(() => {
        const streakFrequencies = new Map<number, number>();
        let currentStreakLength = 0;

        session.flips.forEach((flip, index) => {
            if (flip.result === "H") {
                currentStreakLength++;
            } else {
                if (currentStreakLength > 0) {
                    streakFrequencies.set(
                        currentStreakLength,
                        (streakFrequencies.get(currentStreakLength) || 0) + 1
                    );
                }
                currentStreakLength = 0;
            }

            if (index === session.flips.length - 1 && currentStreakLength > 0) {
                streakFrequencies.set(
                    currentStreakLength,
                    (streakFrequencies.get(currentStreakLength) || 0) + 1
                );
            }
        });

        const processedData = Array.from(streakFrequencies.entries())
            .map(([streakLength, frequency]) => ({
                streakLength,
                frequency,
            }))
            .sort((a, b) => a.streakLength - b.streakLength);

        return processedData;
    }, [session.flips]);

    // Calculate max streak for display in footer if needed
    const longestStreak = useMemo(() => {
        if (chartData.length === 0) return 'N/A';
        return Math.max(...chartData.map(d => d.streakLength));
    }, [chartData]);

    // Calculate total streaks recorded for display in footer if needed
    const totalStreaksRecorded = useMemo(() => {
        return chartData.reduce((sum, d) => sum + d.frequency, 0);
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Heads Streak Frequencies (Current Session)</CardTitle>
                <CardDescription>Distribution of consecutive Heads streaks in this session.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
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
                                        // Custom formatter to get both frequency and streakLength
                                        formatter={(value, name, props) => {
                                            // 'value' is 'frequency'
                                            // 'props.payload' contains the entire data item { streakLength, frequency }
                                            const { streakLength } = props.payload as { streakLength: number; frequency: number };

                                            let streakText = `${streakLength} flip`;
                                            if (streakLength > 1) {
                                                streakText += 's';
                                            }

                                            let frequencyText = `${value} streak`;
                                            if (value != 1) {
                                                frequencyText += 's';
                                            }


                                            return `You've had ${frequencyText} end at ${streakText}`;
                                        }}
                                    />
                                }
                            />
                            <Bar
                                dataKey="frequency"
                                fill="var(--chart-1)"
                                radius={8}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        No Heads streaks to display in this session yet. Keep flipping!
                    </div>
                )}
            </CardContent>
        </Card>
    );
}