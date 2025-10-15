export interface Flip {
    result: "H" | "T",
    timestamp?: Date
}

export interface FlipSession {
    id: string,
    flips: Flip[],
    record: number
}

export interface FlipHistory {
    sessions: FlipSession[],
    record: number
}

export interface FlipData {
    currentStreak: number,
    historyStreak: number,
    currentFlips: number,
    historyFlips: number,
    activeStreak: number
}