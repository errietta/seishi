import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JUNK_KEY = "seishi_junk";

interface LootState {
    junk: string[];
    initialized: boolean;
    initialize: () => Promise<void>;
    addJunk: (id: string) => void;
}

function persist(junk: string[]) {
    AsyncStorage.setItem(JUNK_KEY, JSON.stringify(junk)).catch(() => {});
}

export const useLootStore = create<LootState>((set, get) => ({
    junk: [],
    initialized: false,

    initialize: async () => {
        try {
            const raw = await AsyncStorage.getItem(JUNK_KEY);
            const junk = raw ? JSON.parse(raw) : [];
            set({ junk, initialized: true });
        } catch {
            set({ initialized: true });
        }
    },

    addJunk: (id) => {
        const junk = [...get().junk, id];
        set({ junk });
        persist(junk);
    },
}));
