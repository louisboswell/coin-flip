import { useFlip } from "@/contexts/FlipContext";
import CoinBox from "./Coin";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export default function CoinCard() {
    const { data, session } = useFlip();

    return (
        <Card>
            <CardContent>
                <CoinBox />
                <div className="grid grid-cols-2 grid-rows-2 w-full text-5xl text-center gap-x-2 gap-y-2 px-4 mt-4">
                    <div className="rounded-xl p-2 flex flex-col border-1 bg-muted">
                        <p className="font-bold">{data.currentFlips}</p>
                        <CardDescription className="font-light">Session Flips</CardDescription>
                    </div>
                    <div className="rounded-xl p-2 flex flex-col border-1 bg-muted">
                        <p className="font-bold">{data.currentStreak}</p>
                        <CardDescription className="font-light">Session Record</CardDescription>
                    </div>
                    <div className="rounded-xl p-2 flex flex-col border-1 bg-muted">
                        <p className="font-bold">{data.historyFlips}</p>
                        <CardDescription className="font-light">All Time Flips</CardDescription>
                    </div>
                    <div className="rounded-xl p-2 flex flex-col border-1 bg-muted">
                        <p className="font-bold">{data.historyStreak}</p>
                        <CardDescription className="font-light">All Time Record</CardDescription>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <div className="flex flex-col items-center flex-1">
                    <CardDescription>Recent Flips</CardDescription>
                    <div className="grid grid-cols-5 gap-2 mt-2 h-[20px]">
                        {session.flips.slice(-5).map((flip, _) =>
                            flip.result === "H" ?
                                <Badge key={String(flip.timestamp)} className="w-full font-bold" variant="secondary">Heads</Badge> :
                                <Badge key={String(flip.timestamp)} className="w-full font-bold" variant="outline">Tails</Badge>)}
                    </div>
                </div >
            </CardFooter>
        </Card>
    )
}