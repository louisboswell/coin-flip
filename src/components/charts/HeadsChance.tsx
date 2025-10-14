"use client"

import { TrendingUp } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

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

export const description = "A radial chart showing Heads vs. Tails percentage in current session"

const chartConfig = {
    heads: {
        label: "Heads",
        color: "hsl(var(--chart-1))",
    },
    tails: {
        label: "Tails",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function HeadsChance() {
    const { session } = useFlip();

    const { headsCount, tailsCount, totalFlips, percentHeads, percentTails } = useMemo(() => {
        let hCount = 0;
        let tCount = 0;

        session.flips.forEach(flip => {
            if (flip.result === 'H') {
                hCount++;
            } else {
                tCount++;
            }
        });

        const total = hCount + tCount;
        const pHeads = total === 0 ? 0 : parseFloat(((hCount / total) * 100).toFixed(1));
        const pTails = total === 0 ? 0 : parseFloat(((tCount / total) * 100).toFixed(1));

        return {
            headsCount: hCount,
            tailsCount: tCount,
            totalFlips: total,
            percentHeads: pHeads,
            percentTails: pTails
        };
    }, [session.flips]);

    const chartData = useMemo(() => {
        return [
            {
                name: "Current Session",
                heads: percentHeads,
                tails: percentTails,
            }
        ];
    }, [percentHeads, percentTails]);


    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Session Flip Bias</CardTitle>
                <CardDescription>Heads vs. Tails percentage in this session.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center pb-0"> {/* Added justify-center */}
                <ChartContainer
                    config={chartConfig}
                    // --- KEY CHANGES HERE ---
                    className="mx-auto w-full" // Removed aspect-square, adjusted width
                    style={{ height: '140px' }} // Explicitly set a fixed height for the container
                >
                    <RadialBarChart
                        data={chartData}
                        endAngle={180}
                        startAngle={0} // Explicitly set start angle to 0 for half-circle bottom
                        innerRadius={120} // Adjusted to be smaller relative to outerRadius for a chunkier bar
                        outerRadius={170} // Adjusted for a larger overall arc, and the .5 for rendering bug
                        cx="50%" // Center X-position
                        cy="100%" // Center Y-position at the bottom of the chart area
                    >
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value, name, props) => {
                                        const count = (name === 'heads' ? headsCount : tailsCount);
                                        return (
                                            <>
                                                <span style={{ color: chartConfig[name as keyof typeof chartConfig].color }}>
                                                    {chartConfig[name as keyof typeof chartConfig].label}:
                                                </span>{' '}
                                                {count} ({value}%)
                                            </>
                                        );
                                    }}
                                />
                            }
                        />
                        <PolarRadiusAxis
                            tick={false}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        // Adjust y position for the label to appear higher up in the half-circle
                                        const labelY = (viewBox.cy || 0) - 30; // Move up from the bottom center

                                        return (
                                            <text x={viewBox.cx} y={labelY} textAnchor="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={labelY - 16} // Further adjusted up
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {totalFlips > 0 ? `${percentHeads}%` : '—'}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={labelY + 4} // Further adjusted up
                                                    className="fill-muted-foreground"
                                                >
                                                    of {totalFlips} Flips
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                        <RadialBar
                            dataKey="heads"
                            stackId="a"
                            cornerRadius={5}
                            fill="var(--chart-2)"
                            className="stroke-transparent stroke-2"
                            isAnimationActive={true}
                            animationDuration={800}
                        />
                        <RadialBar
                            dataKey="tails"
                            fill="var(--chart-4)"
                            stackId="a"
                            cornerRadius={5}
                            className="stroke-transparent stroke-2"
                            isAnimationActive={true}
                            animationDuration={800}
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}