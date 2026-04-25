import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Mode } from "./sessionStore";

export interface SessionRecord {
    date: string;
    score: number;
    concentration: number;
    mode: Mode;
    duration: number;
    pickups: number;
}

const STREAK_KEY = "seishi_streak";
const TONE_KEY = "seishi_tone";
const DEV_MODE_KEY = "seishi_devmode";
const SHOW_WELCOME_KEY = "seishi_show_welcome";
const SHOW_TIPS_KEY = "seishi_show_tips";
const GRACE_HOURS = 2;

function isConsecutiveDay(lastDateStr: string, now: Date): boolean {
    const last = new Date(lastDateStr);
    const diffMs = now.getTime() - last.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 1 + GRACE_HOURS / 24;
}

interface StreakState {
    currentStreak: number;
    lastSessionDate: string | null;
    history: SessionRecord[];
    tone: "strict" | "encouraging";
    devMode: boolean;
    showWelcome: boolean;
    showSessionTips: boolean;
    initialized: boolean;
    initialize: () => Promise<void>;
    recordSession: (record: Omit<SessionRecord, "date">) => Promise<void>;
    setTone: (tone: "strict" | "encouraging") => void;
    setDevMode: (on: boolean) => void;
    setShowWelcome: (v: boolean) => void;
    setShowSessionTips: (v: boolean) => void;
    resetHints: () => void;
}

export const useStreakStore = create<StreakState>((set, get) => ({
    currentStreak: 0,
    lastSessionDate: null,
    history: [],
    tone: "strict",
    devMode: false,
    showWelcome: true,
    showSessionTips: true,
    initialized: false,

    initialize: async () => {
        try {
            const [streakRaw, tone, devModeRaw, showWelcomeRaw, showTipsRaw] =
                await Promise.all([
                    AsyncStorage.getItem(STREAK_KEY),
                    AsyncStorage.getItem(TONE_KEY),
                    AsyncStorage.getItem(DEV_MODE_KEY),
                    AsyncStorage.getItem(SHOW_WELCOME_KEY),
                    AsyncStorage.getItem(SHOW_TIPS_KEY),
                ]);
            const data = streakRaw ? JSON.parse(streakRaw) : {};
            set({
                ...data,
                tone: (tone as "strict" | "encouraging") ?? "strict",
                devMode: devModeRaw === "1",
                // null = never stored (first launch) → show it
                showWelcome: showWelcomeRaw !== "0",
                showSessionTips: showTipsRaw !== "0",
                initialized: true,
            });
        } catch {
            set({ initialized: true });
        }
    },

    recordSession: async (record) => {
        const state = get();
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        const last = state.lastSessionDate;

        console.log({
            todayStr,
            last,
            isConsecutive: last ? isConsecutiveDay(last, now) : "N/A",
        });

        let streak = state.currentStreak;
        if (!last) {
            streak = 1;
        } else if (last === todayStr) {
            // already recorded today
        } else if (isConsecutiveDay(last, now)) {
            streak += 1;
        } else {
            streak = 1;
        }

        const entry: SessionRecord = { ...record, date: now.toISOString() };
        const history = [entry, ...state.history].slice(0, 100);
        const next = {
            currentStreak: streak,
            lastSessionDate: todayStr,
            history,
        };
        set(next);
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(next));
    },

    setTone: (tone) => {
        set({ tone });
        AsyncStorage.setItem(TONE_KEY, tone).catch(() => {});
    },

    setDevMode: (on) => {
        set({ devMode: on });
        AsyncStorage.setItem(DEV_MODE_KEY, on ? "1" : "0").catch(() => {});
    },

    setShowWelcome: (v) => {
        set({ showWelcome: v });
        AsyncStorage.setItem(SHOW_WELCOME_KEY, v ? "1" : "0").catch(() => {});
    },

    setShowSessionTips: (v) => {
        set({ showSessionTips: v });
        AsyncStorage.setItem(SHOW_TIPS_KEY, v ? "1" : "0").catch(() => {});
    },

    resetHints: () => {
        set({ showWelcome: true, showSessionTips: true });
        AsyncStorage.setItem(SHOW_WELCOME_KEY, "1").catch(() => {});
        AsyncStorage.setItem(SHOW_TIPS_KEY, "1").catch(() => {});
    },
}));
