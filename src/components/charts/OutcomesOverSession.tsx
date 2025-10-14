"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts" // Add YAxis

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
import { useMemo } from "react" // Remove unused useEffect

// Assuming Flip type is available from @/lib/types
// type Flip = { result: "H" | "T", timestamp: Date };

const chartConfig = {
    heads: {
        label: "% Heads",
        color: "hsl(var(--chart-1))",
    },
    tails: {
        label: "% Tails",
        color: "hsl(var(--chart-2))", // Using var(--chart-2) for tails
    },
} satisfies ChartConfig;

export function OutcomesOverSession() {
    // We need 'session' for its flips array
    const { session } = useFlip();

    const chartData = useMemo(() => {
        const processedData: { flipIndex: number; heads: number; tails: number; }[] = [];
        let headsCount = 0;
        let tailsCount = 0;

        // Iterate through each flip in the current session
        session.flips.forEach((flip, index) => {
            if (flip.result === "H") {
                headsCount++;
            } else {
                tailsCount++;
            }

            const totalFlips = index + 1; // Current total flips
            const percentHeads = (headsCount / totalFlips) * 100;
            const percentTails = (tailsCount / totalFlips) * 100;

            processedData.push({
                flipIndex: totalFlips, // X-axis label
                heads: parseFloat(percentHeads.toFixed(1)),
                tails: parseFloat(percentTails.toFixed(1)),
            });
        });

        return processedData;
    }, [session.flips]); // Depend on session.flips so it re-calculates when flips change

    return (
        <Card>
            <CardHeader>
                <CardTitle>Flip Outcomes Over Session</CardTitle>
                <CardDescription>
                    Cumulative percentage of Heads and Tails after each flip in the current session.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Only render chart if there is data */}
                {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                left: 12,
                                right: 12,
                                top: 5, // Add some top margin for YAxis label if any
                                bottom: 5, // Add some bottom margin
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            {/* <XAxis
                                dataKey="flipIndex" // Use flipIndex for the x-axis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            // Optional: if you want to limit ticks or format them
                            // tickFormatter={(value) => `Flip ${value}`}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `${value}%`} // Format as percentage
                                domain={[0, 100]} // Ensure Y-axis always goes from 0 to 100
                            /> */}
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
                                stroke="var(--chart-4)" // Use --chart-2 for tails
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        Flip the coin to see the outcomes over this session!
                    </div>
                )}
            </CardContent>
            {/* Optional CardFooter with a statistic, if desired */}
            {/* <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    <TrendingUp className="h-4 w-4" />
                    Overall trend: {chartData.length > 0 ? `${chartData[chartData.length - 1].heads}% Heads` : 'N/A'}
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing outcomes for {session.flips.length} flips
                </div>
            </CardFooter> */}
        </Card>
    );
}