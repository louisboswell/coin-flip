// lib/audio.ts

let audioContext: AudioContext | null = null;

// Lazily create and retrieve the AudioContext to ensure it's
// created only once and after user interaction.
const getAudioContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null;

    if (!audioContext) {
        audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// This function calculates the frequency for a given combo number.
// It uses a logarithmic scale (semitones) for a natural musical feel.
const comboToFrequency = (combo: number): number => {
    const baseFrequency = 150; // The pitch for combo x2 (in Hz)
    const semitoneRatio = 1.05946; // The 12th root of 2

    // We start increasing the pitch from the second combo
    const pitchSteps = Math.max(0, combo - 2);

    return baseFrequency * Math.pow(semitoneRatio, pitchSteps);
};

export const playComboSound = (combo: number) => {
    const context = getAudioContext();
    if (!context) return;

    // Browsers may suspend the AudioContext until a user interacts with the page.
    // This ensures it's running before we try to play a sound.
    if (context.state === "suspended") {
        context.resume();
    }

    // 1. Create the Oscillator: This is our sound source (the synth).
    const oscillator = context.createOscillator();
    oscillator.type = "triangle"; // 'sine', 'square', 'sawtooth', 'triangle'
    oscillator.frequency.setValueAtTime(
        comboToFrequency(combo),
        context.currentTime,
    );

    // 2. Create the Gain Node: This controls the volume to create the "thud" effect.
    const gainNode = context.createGain();

    // Create a volume envelope: start loud, then quickly fade out.
    gainNode.gain.setValueAtTime(0.5, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.3,
    ); // Fade out over 0.3s

    // 3. Connect the nodes: Oscillator -> Gain -> Speakers
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // 4. Play the sound and schedule it to stop.
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3); // Stop after the fade-out is complete
};