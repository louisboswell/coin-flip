"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts" // Add YAxis

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
import { useFlip } from "@/contexts/FlipContext" // Import useFlip
import { useMemo } from "react"

export const description = "A bar chart of Heads streak frequencies"

const chartConfig = {
    frequency: { // Changed dataKey to 'frequency'
        label: "Frequency",
        color: "hsl(var(--chart-1))", // Chart color for bars
    },
} satisfies ChartConfig;

export function StreakFrequencyOverHistory() {
    // Access the entire history for all sessions
    const { history } = useFlip();

    const chartData = useMemo(() => {
        // Map to store streak lengths and their frequencies
        const streakFrequencies = new Map<number, number>();

        // Iterate through all sessions in the history
        history.sessions.forEach(session => {
            let currentStreakLength = 0;
            session.flips.forEach((flip, index) => {
                if (flip.result === "H") {
                    currentStreakLength++;
                } else {
                    // Streak ended, record it if it was > 0
                    if (currentStreakLength > 0) {
                        streakFrequencies.set(
                            currentStreakLength,
                            (streakFrequencies.get(currentStreakLength) || 0) + 1
                        );
                    }
                    currentStreakLength = 0; // Reset streak counter
                }

                // If it's the last flip of the session and a streak is active
                if (index === session.flips.length - 1 && currentStreakLength > 0) {
                    streakFrequencies.set(
                        currentStreakLength,
                        (streakFrequencies.get(currentStreakLength) || 0) + 1
                    );
                }
            });
        });

        // Convert the Map to the array format required by Recharts
        const processedData = Array.from(streakFrequencies.entries())
            .map(([streakLength, frequency]) => ({
                streakLength, // x-axis value
                frequency,    // y-axis value
            }))
            .sort((a, b) => a.streakLength - b.streakLength); // Sort by streak length for ordered bars

        return processedData;
    }, [history.sessions]); // Depend on history.sessions to recalculate when history changes

    return (
        <Card>
            <CardHeader>
                <CardTitle>Heads Streak Frequencies</CardTitle>
                <CardDescription>Distribution of consecutive Heads streaks across all sessions.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="streakLength" // X-axis is the length of the streak
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            // tickFormatter={(value) => `Streak ${value}`} // Optional: format tick labels
                            />
                            <YAxis // Add Y-axis for frequency
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            // Optional: if you want to explicitly label it
                            // label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel formatter={(value) => `${value} streaks`} />}
                            />
                            <Bar
                                dataKey="frequency" // Y-axis is the frequency
                                fill="var(--chart-1)" // Use --chart-1 for consistency
                                radius={8}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        No Heads streaks to display yet. Start flipping!
                    </div>
                )}
            </CardContent>
            {/* Optional CardFooter with a statistic, if desired */}
            {/* <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    <TrendingUp className="h-4 w-4" />
                    Longest streak: {chartData.length > 0 ? Math.max(...chartData.map(d => d.streakLength)) : 'N/A'}
                </div>
                <div className="leading-none text-muted-foreground">
                    Total streaks recorded: {chartData.reduce((sum, d) => sum + d.frequency, 0)}
                </div>
            </CardFooter> */}
        </Card>
    );
}