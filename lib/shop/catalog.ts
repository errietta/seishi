export type ItemType = "sound" | "orb-theme" | "streak-freeze" | "title";

export interface CatalogItem {
    id: string;
    type: ItemType;
    name: string;
    description: string;
    icon: string;
    price: number;
    consumable?: boolean;
    soundKey?: string;
    orbColors?: { core: string; glow: string };
    titleText?: string;
}

export const CATALOG: CatalogItem[] = [

    // ── sounds ──────────────────────────────────────────────────────

    {
        id: "sound-forest",
        type: "sound",
        name: "FOREST",
        icon: "🌲",
        price: 300,
        description: "Birdsong and rustling leaves.",
        soundKey: "forest",
    },
    {
        id: "sound-ocean",
        type: "sound",
        name: "OCEAN",
        icon: "🌊",
        price: 300,
        description: "Slow waves on a quiet shore.",
        soundKey: "ocean",
    },
    {
        id: "sound-fire",
        type: "sound",
        name: "FIRE",
        icon: "🔥",
        price: 400,
        description: "A low crackling hearth.",
        soundKey: "fire",
    },

    // ── orb themes ──────────────────────────────────────────────────

    {
        id: "theme-ember",
        type: "orb-theme",
        name: "EMBER",
        icon: "🔴",
        price: 500,
        description: "Warm red glow.",
        orbColors: { core: "#ff9060", glow: "#ffcca0" },
    },
    {
        id: "theme-void",
        type: "orb-theme",
        name: "VOID",
        icon: "🟣",
        price: 500,
        description: "Cold purple light.",
        orbColors: { core: "#c080ff", glow: "#e0c0ff" },
    },
    {
        id: "theme-aurora",
        type: "orb-theme",
        name: "AURORA",
        icon: "🟢",
        price: 800,
        description: "Shifting green glow.",
        orbColors: { core: "#60ffb0", glow: "#b0ffe0" },
    },

    // ── consumable ──────────────────────────────────────────────────

    {
        id: "streak-freeze",
        type: "streak-freeze",
        name: "STREAK FREEZE",
        icon: "❄️",
        price: 400,
        consumable: true,
        description: "Protects your streak for one missed day.",
    },

    // ── titles ──────────────────────────────────────────────────────

    {
        id: "title-still",
        type: "title",
        name: "THE STILL ONE",
        icon: "🪬",
        price: 200,
        description: "For those who endure.",
        titleText: "THE STILL ONE",
    },
    {
        id: "title-unshakeable",
        type: "title",
        name: "UNSHAKEABLE",
        icon: "🗿",
        price: 600,
        description: "Nothing moves you.",
        titleText: "UNSHAKEABLE",
    },
    {
        id: "title-void",
        type: "title",
        name: "VOID WALKER",
        icon: "🌌",
        price: 1500,
        description: "Beyond thought.",
        titleText: "VOID WALKER",
    },
];
