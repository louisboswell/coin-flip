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
import { CircleQuestionMark, Coins, Repeat, Trash, X } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFlip } from "@/contexts/FlipContext";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

// Define a type for the scope for better type safety
type ChartScope = "session" | "alltime";

export default function HomePage() {
	// 2. The state now holds the scope for all charts. It's also typed.
	const [chartView, setChartView] = useState<ChartScope>("session");
	const { resetSession, data, history, deleteHistory } = useFlip();

	return (
		<div>
			<div className="flex flex-row mx-auto justify-between w-[1060px] items-center">
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
				<Tooltip>
					<TooltipTrigger>
						<div className="flex flex-row gap-2 items-center m-2 rounded-xl border bg-secondary px-2 py-0">
							<Coins />
							<p className="text-2xl font-bold">coinflip</p>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<div className="flex flex-col gap-2 w-[400px]">
							<p>Welcome to coin flipper!</p>
							<p>Click the coin to flip it. Heads are good, tails are bad.</p>
							<p>Streaks of heads are saved so you can brag to your friends.</p>
							{/* <p>You can change the settings on the left to view different types of statistics.</p> */}


						</div>
					</TooltipContent>
				</Tooltip>
				<div className="flex flex-row gap-2">

					<ModeToggle />
					<Button variant="outline" className="rounded-xl" onClick={resetSession}>
						<Repeat />
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" className="rounded-xl">
								<Trash />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Local History</AlertDialogTitle>
								<AlertDialogDescription>{`This will irreversibly delete all ${data.historyFlips} from your ${history.sessions.length} saved sessions. `}</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<div className="flex flex-row justify-between w-full">
									<Button type="submit" onClick={() => {
										deleteHistory();
										window.location.reload();
									}}><Trash />Confirm</Button>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
								</div>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
			<div className="flex flex-row justify-center gap-2">
				<div className="flex w-[400px] flex-col gap-2">
					<OutcomesChart scope={chartView} />
					<StreakFrequencyChart scope={chartView} />
					<FlipBiasChart scope={chartView} />
				</div>
				<CoinCard />
			</div>
		</div >
	);
}