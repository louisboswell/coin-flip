import { useFlip } from "@/contexts/FlipContext";
import CoinBox from "./Coin";
import { Card, CardContent, CardDescription, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils"; // Assuming you use this from shadcn
import { playComboSound, playFailureSound } from "@/lib/audio";

export default function CoinCard() {
    const { data, session } = useFlip();

    const [displayStreak, setDisplayStreak] = useState(0);
    const [animationState, setAnimationState] = useState<
        "shaking" | "fading" | "idle"
    >("idle");

    const [activeStreak, setActiveStreak] = useState<boolean>(false);

    useEffect(() => {
        if (!data) return;

        const newStreak = data.activeStreak;

        if (newStreak >= 1) {
            setDisplayStreak(newStreak);
            setActiveStreak(true);
            setAnimationState("shaking");
            // 2. Play the sound when the streak increases!
            playComboSound(newStreak + 1);
        } else if (newStreak <= 1) {
            if (activeStreak === true) {
                playFailureSound();
                setActiveStreak(false);
            }
            setAnimationState("fading");
            const timer = setTimeout(() => {
                setAnimationState("idle");
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [data?.activeStreak, displayStreak]);

    // ... the rest of your component logic remains the same
    const comboFontSize = useMemo(() => {
        if (displayStreak <= 1) return "0.75rem";
        const baseSize = 1.25;
        const increment = 0.15;
        const maxSize = 3;
        const calculatedSize = baseSize + (displayStreak - 2) * increment;
        return `${Math.min(calculatedSize, maxSize)}rem`;
    }, [displayStreak]);

    if (!data) {
        return <Spinner />;
    }

    return (
        <Card className="relative">
            <div
                className="
          pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2
          rounded-full bg-background/80 px-4 py-1 backdrop-blur-sm
        "
            >
                {data.activeStreak > 1 ? (
                    // 2. This is the new animated combo counter
                    <p
                        // The KEY is crucial. Changing it forces React to re-render
                        // the element, which restarts the CSS animation.
                        key={data.activeStreak}
                        className={cn(
                            "animate-balatro-shake font-black text-amber-400",
                            "drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]", // A sharper drop shadow
                        )}
                        // 3. Apply the dynamic font size calculated above.
                        style={{ fontSize: comboFontSize }}
                    >
                        {`x${data.activeStreak} COMBO`}
                    </p>
                ) : (
                    <p className="text-xs font-semibold text-muted-foreground">
                        Click Coin or Press Space
                    </p>
                )}
            </div>

            <CardContent>
                <CoinBox />
                <div className="mt-4 grid w-full grid-cols-2 grid-rows-2 gap-x-2 gap-y-2 px-4 text-center text-5xl">
                    <div className="flex flex-col rounded-xl border-1 bg-muted p-2">
                        <p className="font-bold">{data.currentFlips}</p>
                        <CardDescription className="font-light">
                            Session Flips
                        </CardDescription>
                    </div>
                    <div className="flex flex-col rounded-xl border-1 bg-muted p-2">
                        <p className="font-bold">{data.currentStreak}</p>
                        <CardDescription className="font-light">
                            Session Record
                        </CardDescription>
                    </div>
                    <div className="flex flex-col rounded-xl border-1 bg-muted p-2">
                        <p className="font-bold">{data.historyFlips}</p>
                        <CardDescription className="font-light">
                            All Time Flips
                        </CardDescription>
                    </div>
                    <div className="flex flex-col rounded-xl border-1 bg-muted p-2">
                        <p className="font-bold">{data.historyStreak}</p>
                        <CardDescription className="font-light">
                            All Time Record
                        </CardDescription>
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <div className="flex flex-1 flex-col items-center">
                    <CardDescription>Recent Flips</CardDescription>
                    <div className="mt-2 grid h-[20px] grid-cols-10 items-start justify-end gap-1">
                        {session.flips.slice(-10).map((flip) => (
                            <Badge
                                key={String(flip.timestamp)}
                                className="w-full w-[50px] font-bold"
                                variant={flip.result === "H" ? "secondary" : "outline"}
                            >
                                {flip.result === "H" ? "Heads" : "Tails"}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}