"use client";

import { HeadsChance } from "@/components/charts/HeadsChance";
import { OutcomesOverSession } from "@/components/charts/OutcomesOverSession";
import { StreakFrequencyOverCurrentSession } from "@/components/charts/StreakOverSession";
import CoinCard from "@/components/CoinCard";
import { ModeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChartBar, Delete, Repeat, Sun, Trash, X } from "lucide-react";

export default function HomePage() {
	return (
		<div className="flex flex-row gap-2 p-4 justify-center">
			<div className="w-[400px] flex flex-col gap-2">
				<OutcomesOverSession />
				<StreakFrequencyOverCurrentSession />
				<HeadsChance />
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
		</div >
	)
}