import { ChartLineMultiple } from "@/components/charts/FlipsOverTime";
import { ChartPieSimple } from "@/components/charts/OutcomesPie";
import CoinBox from "@/components/Coin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
	return (<div className="flex items-center h-screen justify-center flex-col">
		<div className="grid grid-cols-2 gap-2">
			<div className="flex flex-col gap-2">
				<Card>
					<CardHeader>
						<CardTitle>Your Stats</CardTitle>
						<CardDescription>Breakdown of all your past coin flips.</CardDescription>
					</CardHeader>
				</Card>
				<ChartPieSimple />
				<ChartLineMultiple />
			</div>

			<Card>
				<CoinBox />
			</Card>

		</div>
	</div>)
}