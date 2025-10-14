"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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
import { useEffect, useMemo } from "react"

export const description = "A multiple line chart"

// const chartData = [
//     { month: "January", desktop: 186, mobile: 80 },
//     { month: "February", desktop: 305, mobile: 200 },
//     { month: "March", desktop: 237, mobile: 120 },
//     { month: "April", desktop: 73, mobile: 190 },
//     { month: "May", desktop: 209, mobile: 130 },
//     { month: "June", desktop: 214, mobile: 140 },
// ]

const chartConfig = {
    heads: { // Changed from 'desktop'
        label: "% Heads",
        color: "hsl(var(--chart-1))", // Using hsl for better theme compatibility
    },
    tails: { // Changed from 'mobile'
        label: "% Tails",
        color: "hsl(var(--chart-2))", // Using hsl for better theme compatibility
    },
} satisfies ChartConfig;

export function AllTimeOutcomes() {
    const { history } = useFlip();

    const chartData = useMemo(() => {
        const processedData: { session: string; heads: number; tails: number; }[] = [];
        let sessionCounter = 1; // To give sessions a simple numerical label

        history.sessions.forEach((s) => {
            if (s.flips.length > 10) { // Only include sessions with over 5 flips
                const totalFlips = s.flips.length;
                let headsCount = 0;
                let tailsCount = 0;

                s.flips.forEach((flip) => {
                    if (flip.result === "H") {
                        headsCount++;
                    } else {
                        tailsCount++;
                    }
                });

                const percentHeads = (headsCount / totalFlips) * 100;
                const percentTails = (tailsCount / totalFlips) * 100;

                processedData.push({
                    session: `Session ${sessionCounter}`, // Label as "Session 1", "Session 2", etc.
                    heads: parseFloat(percentHeads.toFixed(1)), // Keep one decimal place
                    tails: parseFloat(percentTails.toFixed(1)), // Keep one decimal place
                });
                sessionCounter++;
            }
        });

        return processedData;
    }, [history]);

    console.log(chartData)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Flips Over Time</CardTitle>
                <CardDescription>Tracks your flips' outcomes over time.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="session"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="heads"
                            type="monotone"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            opacity={0.5}
                            dot={false}
                        />
                        <Line
                            dataKey="tails"
                            type="monotone"
                            stroke="var(--chart-4)"
                            opacity={0.6}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
