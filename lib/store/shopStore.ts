import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type CatalogItem } from "../shop/catalog";

const SHOP_KEY = "seishi_shop";

export interface Purchase {
    itemId: string;
    cost: number;
    date: string;
}

interface ShopState {
    ownedItems: string[];
    streakFreezes: number;
    activeOrbTheme: string | null;
    activeTitle: string | null;
    purchases: Purchase[];
    initialized: boolean;

    initialize: () => Promise<void>;
    buyItem: (item: CatalogItem, balance: number) => boolean;
    useStreakFreeze: () => void;
    setActiveOrbTheme: (id: string | null) => void;
    setActiveTitle: (id: string | null) => void;
}

function persist(state: {
    ownedItems: string[];
    streakFreezes: number;
    activeOrbTheme: string | null;
    activeTitle: string | null;
    purchases: Purchase[];
}) {
    AsyncStorage.setItem(SHOP_KEY, JSON.stringify(state)).catch(() => {});
}

export const useShopStore = create<ShopState>((set, get) => ({
    ownedItems: [],
    streakFreezes: 0,
    activeOrbTheme: null,
    activeTitle: null,
    purchases: [],
    initialized: false,

    initialize: async () => {
        try {
            const raw = await AsyncStorage.getItem(SHOP_KEY);
            const data = raw ? JSON.parse(raw) : {};
            set({ ...data, initialized: true });
        } catch {
            set({ initialized: true });
        }
    },

    buyItem: (item, balance) => {
        const state = get();
        if (balance < item.price) return false;

        const purchase: Purchase = {
            itemId: item.id,
            cost: item.price,
            date: new Date().toISOString(),
        };

        const next = {
            ownedItems: item.consumable
                ? state.ownedItems
                : [...state.ownedItems, item.id],
            streakFreezes: item.consumable
                ? state.streakFreezes + 1
                : state.streakFreezes,
            activeOrbTheme: state.activeOrbTheme,
            activeTitle: state.activeTitle,
            purchases: [purchase, ...state.purchases].slice(0, 100),
        };

        set(next);
        persist(next);
        return true;
    },

    useStreakFreeze: () => {
        const state = get();
        if (state.streakFreezes <= 0) return;
        const next = {
            ownedItems: state.ownedItems,
            streakFreezes: state.streakFreezes - 1,
            activeOrbTheme: state.activeOrbTheme,
            activeTitle: state.activeTitle,
            purchases: state.purchases,
        };
        set(next);
        persist(next);
    },

    setActiveOrbTheme: (id) => {
        const state = get();
        const next = {
            ownedItems: state.ownedItems,
            streakFreezes: state.streakFreezes,
            activeOrbTheme: id,
            activeTitle: state.activeTitle,
            purchases: state.purchases,
        };
        set(next);
        persist(next);
    },

    setActiveTitle: (id) => {
        const state = get();
        const next = {
            ownedItems: state.ownedItems,
            streakFreezes: state.streakFreezes,
            activeOrbTheme: state.activeOrbTheme,
            activeTitle: id,
            purchases: state.purchases,
        };
        set(next);
        persist(next);
    },
}));
