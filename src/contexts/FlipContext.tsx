// src/context/FlipContext.tsx (or app/context/FlipContext.tsx)
"use client"; // Important for client-side context

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { FlipHistory, Flip, FlipSession, FlipData } from '@/lib/types';

// 1. Define the shape of your context data
interface FlipContextType {
    session: FlipSession;
    history: FlipHistory;
    data: FlipData;
    resetSession: () => void;
    deleteHistory: () => void;
    addFlip: (result: "H" | "T") => void;
}

const FlipContext = createContext<FlipContextType | undefined>(undefined);

interface FlipProviderProps {
    children: React.ReactNode;
}

export const FlipProvider: React.FC<FlipProviderProps> = ({ children }) => {

    // Load flipHistory from storage, or create default
    const [flipHistory, setFlipHistory] = useState<FlipHistory>(() => {
        if (typeof window !== 'undefined') {
            const storedHistory = localStorage.getItem("flipHistory");
            if (storedHistory) {
                return JSON.parse(storedHistory);
            }
        }
        return { sessions: [], record: 0 }; // Default empty history
    });

    // Save whenever history updates
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem("flipHistory", JSON.stringify(flipHistory));
        }
        return;
    }, [flipHistory]);

    const deleteHistory = () => {
        if (typeof window !== 'undefined') {
            const storedHistory = localStorage.clear();
        }
        return { sessions: [], record: 0 }; // Default empty history
    }
    // Create a new session
    const startNewSession = useCallback(() => {
        setFlipHistory(prevHistory => ({ ...prevHistory, sessions: [...prevHistory.sessions, { id: crypto.randomUUID(), flips: [], record: 0 }] }));
        return flipHistory;
    }, [])

    // Create a new session at startup
    useEffect(() => {
        startNewSession();
    }, [startNewSession]);

    // Get current session
    const session = useMemo(() => {
        return flipHistory.sessions[flipHistory.sessions.length - 1] || { id: 'default', flips: [], record: 0 };
    }, [flipHistory]);

    // Add a new flip to history -> this will then trigger the useEffect to save to memory
    const addFlip = useCallback((result: "H" | "T") => {
        const newFlip: Flip = { result, timestamp: new Date() };

        setFlipHistory((prevHistory) => {
            // 1. Create a deep clone to safely mutate.
            const newHistory = JSON.parse(JSON.stringify(prevHistory)) as FlipHistory;

            // 2. Get a reference to the last session. TS correctly infers its type
            // as `FlipSession | undefined`.
            let currentSession = newHistory.sessions[newHistory.sessions.length - 1];

            // 3. If there is no session, create one and re-assign the reference.
            if (!currentSession) {
                const newSession: FlipSession = {
                    id: crypto.randomUUID(),
                    flips: [],
                    record: 0,
                };
                newHistory.sessions.push(newSession);
                currentSession = newSession; // Now, TS knows currentSession is definitely a FlipSession.
            }

            // From this point on, TypeScript knows `currentSession` is guaranteed to exist.

            // 4. Add the new flip to the session.
            currentSession.flips.push(newFlip);

            // 5. Calculate the new streak based on the UPDATED flips array.
            const newStreak = calculateCurrentStreak(currentSession.flips);

            // 6. Compare and update the record.
            if (newStreak > currentSession.record) {
                currentSession.record = newStreak;
            }

            // 7. Return the fully updated clone.
            return newHistory;
        });
    }, []);

    const calculateCurrentStreak = (flips: Flip[]): number => {
        if (flips.length === 0) {
            return 0;
        }

        const lastFlip = flips[flips.length - 1];
        const lastResult = lastFlip?.result;
        let streak = 0;

        // Loop backwards from the end of the array
        for (let i = flips.length - 1; i >= 0; i--) {
            const currentFlip = flips[i];
            if (currentFlip?.result === lastResult && lastResult === "H") {
                streak++;
            } else {
                // Stop as soon as a different result is found
                break;
            }
        }

        return streak;
    };

    const currentStreak = useMemo(() => {
        if (session.flips.length === 0) return 0;
        const lastResult = session.flips[session.flips.length - 1];
        if (!lastResult || lastResult.result !== 'H') return 0;
        let streak = 0;
        for (let i = session.flips.length - 1; i >= 0; i--) {
            const flip = session.flips[i];
            if (flip && flip.result === 'H') {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }, [session]);

    const currentFlips = useMemo(() => {
        return session.flips.length;
    }, [session]);

    const historyFlips = useMemo(() => {
        return flipHistory.sessions.reduce((totalFlips, session) => totalFlips + session.flips.length, 0);
    }, [flipHistory]);

    const historyStreak = useMemo(() => {
        let maxRecord = 0;

        // Use forEach for clarity when not creating a new array
        flipHistory.sessions.forEach((checkSession) => {
            if (checkSession.record > maxRecord) {
                // FIX: Use single '=' for assignment
                maxRecord = checkSession.record;
            }
        });

        return maxRecord;
    }, [flipHistory]);

    const contextValue: FlipContextType = {
        session: session,
        history: flipHistory,
        addFlip: addFlip,
        data: {
            currentFlips: currentFlips,
            currentStreak: session.record,
            historyFlips: historyFlips,
            historyStreak: historyStreak,
            activeStreak: currentStreak
        },
        resetSession: startNewSession,
        deleteHistory: deleteHistory,
    };

    // --- FIX: Add the missing return statement ---
    return (
        <FlipContext.Provider value={contextValue}>
            {children}
        </FlipContext.Provider>
    );
};

// 4. Create a custom hook to consume the context
export const useFlip = () => {
    const context = useContext(FlipContext);
    if (context === undefined) {
        throw new Error('useFlip must be used within a FlipProvider');
    }
    return context;
};
