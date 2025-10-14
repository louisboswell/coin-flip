"use client";

import { FlipBiasChart } from "@/components/multi-charts/HeadsChance";
// 1. Renamed for clarity, assuming you've renamed the file and component
import { OutcomesChart } from "@/components/multi-charts/OutcomesOverSession";
import { StreakFrequencyChart } from "@/components/multi-charts/StreakOverSession";
import CoinCard from "@/components/CoinCard";
import { ModeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Repeat, Trash, X } from "lucide-react";
import { useState } from "react";

// Define a type for the scope for better type safety
type ChartScope = "session" | "alltime";

export default function HomePage() {
	// 2. The state now holds the scope for all charts. It's also typed.
	const [chartView, setChartView] = useState<ChartScope>("session");

	return (
		<div className="flex flex-row justify-center gap-2 p-4">
			<div className="flex flex-col gap-2">
				{/* 3. The Select component now correctly updates the shared state */}
				<Select
					value={chartView}
					onValueChange={(value: ChartScope) => setChartView(value)}
				>
					<SelectTrigger className="w-[100px] rounded-xl">
						<SelectValue placeholder="View" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="session">Session</SelectItem>
							<SelectItem value="alltime">All Time</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<div className="flex w-[400px] flex-col gap-2">
				{/* 4. The 'chartView' state is passed as a 'scope' prop to each chart */}
				<OutcomesChart scope={chartView} />
				<StreakFrequencyChart scope={chartView} />
				<FlipBiasChart scope={chartView} />
			</div>
			<CoinCard />
			<div className="flex flex-col justify-between">
				<div className="flex flex-col gap-2">
					<ModeToggle />
					<Button variant="outline" className="rounded-xl">
						<Repeat />
					</Button>
				</div>
				<div className="flex flex-col gap-2">
					<Button variant="destructive" className="rounded-xl">
						<X />
					</Button>
					<Button variant="destructive" className="rounded-xl">
						<Trash />
					</Button>
				</div>
			</div>
		</div>
	);
}