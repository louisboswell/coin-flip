// src/context/FlipContext.tsx (or app/context/FlipContext.tsx)
"use client"; // Important for client-side context

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { FlipHistory, Flip, FlipSession, FlipData } from '@/lib/types';

// 1. Define the shape of your context data
interface FlipContextType {
    session: FlipSession;
    history: FlipHistory;
    data: FlipData;
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
        setFlipHistory(prevHistory => {
            const newHistory = JSON.parse(JSON.stringify(prevHistory));
            if (newHistory.sessions.length === 0) {
                newHistory.sessions.push({ id: crypto.randomUUID(), flips: [newFlip], record: 0 });
            } else {
                newHistory.sessions[newHistory.sessions.length - 1].flips.push(newFlip);
            }
            return newHistory;
        });
    }, []);

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

    const getData = useMemo(() => {
        const data: FlipData = {
            currentStreak: currentStreak,
            currentFlips: session.flips.length,
            historyFlips: flipHistory.sessions.reduce((totalFlips, session) => totalFlips + session.flips.length, 0),
            historyStreak: 0
        }

        return data
    }, [session])


    const contextValue: FlipContextType = {
        session: session,
        history: flipHistory,
        addFlip: addFlip,
        data: getData
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
