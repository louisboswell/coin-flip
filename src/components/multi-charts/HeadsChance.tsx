"use client";

import { Label, RadialBar, RadialBarChart } from "recharts";

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
    heads: {
        label: "Heads",
        color: "hsl(var(--chart-1))",
    },
    tails: {
        label: "Tails",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

// 1. Reusable function to calculate flip statistics from any array of flips.
const calculateFlipStats = (flips: Flip[]) => {
    let hCount = 0;
    let tCount = 0;

    flips.forEach((flip) => {
        if (flip.result === "H") {
            hCount++;
        } else {
            tCount++;
        }
    });

    const total = hCount + tCount;
    const pHeads =
        total === 0 ? 0 : parseFloat(((hCount / total) * 100).toFixed(1));
    const pTails = 100 - pHeads; // Simpler calculation

    return {
        headsCount: hCount,
        tailsCount: tCount,
        totalFlips: total,
        percentHeads: pHeads,
        percentTails: parseFloat(pTails.toFixed(1)), // Ensure tails is also rounded
    };
};

// 2. Define props for the component
type FlipBiasChartProps = {
    scope: "session" | "alltime" | "global";
};

// 3. Rename component and accept the 'scope' prop
export function FlipBiasChart({ scope }: FlipBiasChartProps) {
    const { session, history } = useFlip();

    // 4. useMemo now calculates stats based on the scope using our helper function
    const { headsCount, tailsCount, totalFlips, percentHeads, percentTails } =
        useMemo(() => {
            if (scope === "session") {
                return calculateFlipStats(session.flips);
            }

            if (scope === "alltime") {
                const allFlips = history.sessions.flatMap((s) => s.flips);
                return calculateFlipStats(allFlips);
            }

            // Default empty state
            return {
                headsCount: 0,
                tailsCount: 0,
                totalFlips: 0,
                percentHeads: 0,
                percentTails: 0,
            };
        }, [scope, session.flips, history]);

    // This useMemo is fine as it just formats the final data for the chart
    const chartData = useMemo(() => {
        return [
            {
                name: scope === "session" ? "Current Session" : "All Time",
                heads: percentHeads,
                tails: percentTails,
            },
        ];
    }, [scope, percentHeads, percentTails]);

    // 5. Dynamic UI text based on scope
    const cardTitle =
        scope === "session" ? "Session Flip Bias" : "All-Time Flip Bias";
    const cardDescription =
        scope === "session"
            ? "Heads vs. Tails percentage in this session."
            : "Heads vs. Tails percentage across your entire history.";

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{cardTitle}</CardTitle>
                <CardDescription>{cardDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto w-full"
                    style={{ height: "140px" }}
                >
                    <RadialBarChart
                        data={chartData}
                        endAngle={180}
                        startAngle={0}
                        innerRadius={120}
                        outerRadius={170}
                        cx="50%"
                        cy="100%"
                    >
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value, name) => {
                                        const count = name === "heads" ? headsCount : tailsCount;
                                        return (
                                            <>
                                                <span
                                                    style={{
                                                        color:
                                                            chartConfig[name as keyof typeof chartConfig]
                                                                .color,
                                                    }}
                                                >
                                                    {chartConfig[name as keyof typeof chartConfig].label}:
                                                </span>{" "}
                                                {count} ({value}%)
                                            </>
                                        );
                                    }}
                                />
                            }
                        />
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    const labelY = (viewBox.cy || 0) - 30;
                                    return (
                                        <text x={viewBox.cx} y={labelY} textAnchor="middle">
                                            <tspan
                                                x={viewBox.cx}
                                                y={labelY - 16}
                                                className="fill-foreground text-2xl font-bold"
                                            >
                                                {totalFlips > 0 ? `${percentHeads}%` : "—"}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={labelY + 4}
                                                className="fill-muted-foreground"
                                            >
                                                of {totalFlips} Flips
                                            </tspan>
                                        </text>
                                    );
                                }
                            }}
                        />

                        <RadialBar
                            dataKey="tails"
                            fill="var(--chart-4)" // Changed for consistency
                            stackId="a"
                            cornerRadius={5}
                            className="stroke-transparent stroke-2"
                            isAnimationActive={true}
                            animationDuration={800}
                        />

                        <RadialBar
                            dataKey="heads"
                            stackId="a"
                            cornerRadius={5}
                            fill="var(--chart-2)" // Changed for consistency
                            className="stroke-transparent stroke-2"
                            isAnimationActive={true}
                            animationDuration={800}
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}