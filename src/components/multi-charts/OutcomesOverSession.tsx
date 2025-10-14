"use client";

import { CartesianGrid, Line, LineChart } from "recharts";

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
import type { FlipSession } from "@/lib/types";
import { useMemo } from "react";

const chartConfig = {
    heads: {
        label: "% Heads",
        color: "hsl(var(--chart-1))",
    },
    tails: {
        label: "% Tails",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

// Define props for the component
type OutcomesChartProps = {
    scope: "session" | "alltime";
};

export function OutcomesChart({ scope }: OutcomesChartProps) {
    // We need both 'session' and 'sessions' from the context
    const { session, history } = useFlip();

    const chartData = useMemo(() => {
        // ==========================================================
        // Logic for the current session view
        // ==========================================================
        if (scope === "session") {
            const processedData: {
                flipIndex: number;
                heads: number;
                tails: number;
            }[] = [];
            let headsCount = 0;
            let tailsCount = 0;

            session.flips.forEach((flip, index) => {
                if (flip.result === "H") {
                    headsCount++;
                } else {
                    tailsCount++;
                }

                const totalFlips = index + 1;
                const percentHeads = (headsCount / totalFlips) * 100;
                const percentTails = (tailsCount / totalFlips) * 100;

                processedData.push({
                    flipIndex: totalFlips,
                    heads: parseFloat(percentHeads.toFixed(1)),
                    tails: parseFloat(percentTails.toFixed(1)),
                });
            });
            return processedData;
        }

        // ==========================================================
        // Logic for the all-time sessions view
        // ==========================================================
        if (scope === "alltime") {
            // Filter sessions to only include those with more than 5 flips
            const relevantSessions = history.sessions.filter(
                (s) => s.flips.length > 10,
            );

            return relevantSessions.map((s: FlipSession, index: number) => {
                const totalFlips = s.flips.length;
                const headsCount = s.flips.filter((f) => f.result === "H").length;

                const percentHeads = (headsCount / totalFlips) * 100;
                const percentTails = 100 - percentHeads; // Simpler calculation

                return {
                    sessionIndex: `Session ${index + 1}`, // X-axis label
                    heads: parseFloat(percentHeads.toFixed(1)),
                    tails: parseFloat(percentTails.toFixed(1)),
                };
            });
        }

        return []; // Default return
    }, [scope, session.flips, history]); // Dependencies cover both scopes

    // Dynamic titles and descriptions based on the scope
    const cardTitle =
        scope === "session"
            ? "Heads vs. Tails Over Time"
            : "Session-by-Session Outcomes";
    const cardDescription =
        scope === "session"
            ? "Cumulative percentage of Heads and Tails after each flip in the current session."
            : "Final percentage of Heads vs. Tails for each session with more than 10 flips.";
    const emptyStateMessage =
        scope === "session"
            ? "Flip the coin to see the outcomes over this session!"
            : "Complete a session with more than 10 flips to see it here.";

    return (
        <Card>
            <CardHeader>
                <CardTitle>{cardTitle}</CardTitle>
                <CardDescription>{cardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ left: 12, right: 12, top: 5, bottom: 5 }}
                        >
                            <CartesianGrid vertical={false} />
                            {/* <XAxis
                                dataKey={scope === "session" ? "flipIndex" : "sessionIndex"}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) =>
                                    scope === "alltime" ? value : value.toString()
                                }
                            /> */}
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                            />
                            <Line
                                dataKey="heads"
                                type="monotone"
                                stroke="var(--chart-2)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                dataKey="tails"
                                type="monotone"
                                stroke="var(--chart-4)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                        {emptyStateMessage}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}