import { create } from "zustand";

export type Mode = "simple" | "raw" | "spicy";
export type Phase = "idle" | "active" | "winding";
export type PunishmentMode =
    | "none"
    | "add-time"
    | "add-time-long"
    | "reset"
    | "random";

const PUNISHMENT_SECONDS = 120;
const PUNISHMENT_SECONDS_LONG = 300;

interface SessionState {
    mode: Mode | null;
    duration: number;
    elapsed: number;
    phase: Phase;
    pickups: number;
    isRunning: boolean;
    sound: string | null;
    punishmentMode: PunishmentMode;
    gongOnComplete: boolean;
    isChallenge: boolean;
    startSession: (
        mode: Mode,
        duration: number,
        sound: string | null,
        punishment: PunishmentMode,
        gong: boolean,
        challenge?: boolean,
    ) => void;
    pauseSession: () => void;
    resumeSession: () => void;
    endSession: () => void;
    registerPickup: () => void;
    tickElapsed: () => void;
    addTime: (seconds: number) => void;
    resetTimer: () => void;
    reset: () => void;
}

export { PUNISHMENT_SECONDS, PUNISHMENT_SECONDS_LONG };

export const useSessionStore = create<SessionState>((set) => ({
    mode: null,
    duration: 0,
    elapsed: 0,
    phase: "idle",
    pickups: 0,
    isRunning: false,
    sound: null,
    punishmentMode: "none",
    gongOnComplete: false,
    isChallenge: false,

    startSession: (
        mode,
        duration,
        sound,
        punishment,
        gong,
        challenge = false,
    ) =>
        set({
            mode,
            duration,
            elapsed: 0,
            phase: "active",
            pickups: 0,
            isRunning: true,
            sound,
            punishmentMode: punishment,
            gongOnComplete: gong,
            isChallenge: challenge,
        }),

    pauseSession: () => set({ isRunning: false }),

    resumeSession: () => set({ isRunning: true }),

    endSession: () => set({ isRunning: false, phase: "idle" }),

    registerPickup: () => set((s) => ({ pickups: s.pickups + 1 })),

    tickElapsed: () =>
        set((s) => {
            const elapsed = s.elapsed + 1;
            const remaining = s.duration - elapsed;
            const phase: Phase = remaining <= 60 ? "winding" : "active";
            return { elapsed, phase };
        }),

    addTime: (seconds) =>
        set((s) => {
            const duration = s.duration + seconds;
            const remaining = duration - s.elapsed;
            const phase: Phase = remaining <= 60 ? "winding" : "active";
            return { duration, phase };
        }),

    resetTimer: () => set({ elapsed: 0, phase: "active" }),

    reset: () =>
        set({
            mode: null,
            duration: 0,
            elapsed: 0,
            phase: "idle",
            pickups: 0,
            isRunning: false,
            sound: null,
            punishmentMode: "none",
            gongOnComplete: false,
            isChallenge: false,
        }),
}));
