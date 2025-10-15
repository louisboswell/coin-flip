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
// It uses a logarithmic scale for a natural musical feel.
const comboToFrequency = (combo: number): number => {
    // Start at a more musical base note, C4 (Middle C)
    const baseFrequency = 261.63;
    // The 12th root of 2, for stepping up in musical semitones
    const semitoneRatio = 1.05946;

    // We'll use a pentatonic scale for a pleasing, open sound.
    // Steps in the major pentatonic scale are: 2, 2, 3, 2, 3 semitones.
    const pentatonicSteps = [0, 2, 4, 7, 9];

    // Ensure we don't use a negative number for our calculations.
    const noteIndex = Math.max(0, combo - 2);

    const octave = Math.floor(noteIndex / 5);
    const stepInScale = noteIndex % 5;

    // Use the nullish coalescing operator (??) to provide a fallback value.
    // This guarantees the result is a number, satisfying TypeScript.
    // If `pentatonicSteps[stepInScale]` were ever undefined, it would default to 0.
    const noteOffset = pentatonicSteps[stepInScale] ?? 0;
    const pitchSteps = 12 * octave + noteOffset;

    return baseFrequency * Math.pow(semitoneRatio, pitchSteps);
};

export const playComboSound = (combo: number) => {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
        context.resume();
    }

    const playTime = context.currentTime;
    const frequency = comboToFrequency(combo);

    // --- Create a more complex, piano-like tone using additive synthesis ---

    // 1. The fundamental tone (the main note you hear)
    const fundamental = context.createOscillator();
    fundamental.type = "sine"; // Sine waves are pure and great for building sounds
    fundamental.frequency.setValueAtTime(frequency, playTime);

    // 2. Harmonics (overtones that give the sound its character)
    const harmonic1 = context.createOscillator();
    harmonic1.type = "sine";
    harmonic1.frequency.setValueAtTime(frequency * 2, playTime); // One octave up

    const harmonic2 = context.createOscillator();
    harmonic2.type = "sine";
    harmonic2.frequency.setValueAtTime(frequency * 3, playTime); // An octave and a fifth up

    // --- Create the Volume Envelope ---
    // This controls the volume over time to mimic a piano key strike.
    const masterGain = context.createGain();
    masterGain.gain.setValueAtTime(0, playTime);
    // Attack: A very fast rise in volume
    masterGain.gain.linearRampToValueAtTime(0.4, playTime + 0.01);
    // Decay & Sustain: A longer, natural fade-out
    masterGain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.7);

    // Control the volume of the harmonics (they should be quieter)
    const harmonicGain = context.createGain();
    harmonicGain.gain.setValueAtTime(0.5, playTime); // Make harmonics 50% volume

    // --- Connect the Audio Graph ---
    // Connect harmonics to their own gain node
    harmonic1.connect(harmonicGain);
    harmonic2.connect(harmonicGain);

    // Connect the fundamental and the harmonics' gain to the master gain
    fundamental.connect(masterGain);
    harmonicGain.connect(masterGain);

    // Connect the master gain to the speakers
    masterGain.connect(context.destination);

    // --- Play and Stop ---
    const stopTime = playTime + 0.8;
    fundamental.start(playTime);
    harmonic1.start(playTime);
    harmonic2.start(playTime);

    fundamental.stop(stopTime);
    harmonic1.stop(stopTime);
    harmonic2.stop(stopTime);
};

export const playFailureSound = () => {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
        context.resume();
    }

    const playTime = context.currentTime;

    // --- Create a low, dissonant piano chord for a "failure" sound ---
    // This mimics pressing two low, adjacent keys on a piano.
    const note1 = context.createOscillator();
    note1.type = "sine";
    note1.frequency.setValueAtTime(82.41, playTime); // E2

    const note2 = context.createOscillator();
    note2.type = "sine";
    note2.frequency.setValueAtTime(87.31, playTime); // F2

    // --- Create the Volume Envelope (similar to the combo sound) ---
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0, playTime);
    gainNode.gain.linearRampToValueAtTime(0.3, playTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + 0.6);

    // --- Connect and Play ---
    note1.connect(gainNode);
    note2.connect(gainNode);
    gainNode.connect(context.destination);

    const stopTime = playTime + 0.7;
    note1.start(playTime);
    note2.start(playTime);
    note1.stop(stopTime);
    note2.stop(stopTime);
};