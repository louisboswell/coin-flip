import { useFlip } from "@/contexts/FlipContext";
import CoinBox from "./Coin";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";


export default function CoinCard() {
    const { data, session } = useFlip();


    if (!data) {
        return <Spinner />
    }

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
                    {/* 4. Attach the ref to the parent div of the badges */}
                    <div className="grid grid-cols-10 gap-1 mt-2 items-start justify-end h-[20px]">
                        {session.flips.slice(-10).map((flip) =>
                            <Badge key={String(flip.timestamp)} // Ensure unique keys for animation
                                className='w-full font-bold w-[50px]'
                                variant={flip.result === 'H' ? "secondary" : "outline"}>
                                {flip.result === "H" ? "Heads" : "Tails"}
                            </Badge>
                        )}
                    </div>
                </div >
            </CardFooter>
        </Card>
    )
}