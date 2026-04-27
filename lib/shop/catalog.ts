export type ItemType = "sound" | "orb-theme" | "streak-freeze" | "title" | "presence-shape";

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
    presenceShape?: "orb" | "eye";
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
    {
        id: "theme-ice",
        type: "orb-theme",
        name: "ICE",
        icon: "🔵",
        price: 600,
        description: "Cold and still.",
        orbColors: { core: "#80c0ff", glow: "#c0e0ff" },
    },
    {
        id: "theme-ash",
        type: "orb-theme",
        name: "ASH",
        icon: "⚪",
        price: 400,
        description: "Barely there.",
        orbColors: { core: "#dddddd", glow: "#f5f5f5" },
    },
    {
        id: "theme-ink",
        type: "orb-theme",
        name: "INK",
        icon: "⚫",
        price: 700,
        description: "Absorbs everything.",
        orbColors: { core: "#222222", glow: "#555555" },
    },
    {
        id: "theme-caffeine",
        type: "orb-theme",
        name: "CAFFEINE",
        icon: "☕",
        price: 300,
        description: "Unnecessarily intense.",
        orbColors: { core: "#ff7a3c", glow: "#ffd0a0" },
    },
    {
        id: "theme-blackhole",
        type: "orb-theme",
        name: "BLACKHOLE",
        icon: "🕳️",
        price: 700,
        description: "Once you cross the event horizon...",
        orbColors: { core: "#110f14", glow: "#f6def6" },
    },

    // ── presence shapes ─────────────────────────────────────────────

    {
        id: "shape-eye",
        type: "presence-shape",
        presenceShape: "eye",
        name: "THE EYE",
        icon: "👁",
        price: 900,
        description: "It watches. It blinks. It knows.",
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
        id: "title-focused",
        type: "title",
        name: "FOCUSED",
        icon: "🎯",
        price: 400,
        description: "For those who persevere.",
        titleText: "FOCUSED",
    },
    {
        id: "title-sleepyhead",
        type: "title",
        name: "SLEEPYHEAD",
        icon: "😴",
        price: 100,
        description: "For those who try.",
        titleText: "SLEEPYHEAD",
    },
    {
        id: "zen-master",
        type: "title",
        name: "ZEN MASTER",
        icon: "☯️",
        price: 800,
        description: "For those who transcend.",
        titleText: "ZEN MASTER",
    },
    {
        id: "catch-em-all",
        type: "title",
        name: "CATCH 'EM ALL",
        icon: "🏆",
        price: 1200,
        description: "For those who collect.",
        titleText: "CATCH 'EM ALL",
    },
    {
        id: "title-fidgeter",
        type: "title",
        name: "FIDGETER",
        icon: "🫨",
        price: 50,
        description: "We noticed.",
        titleText: "FIDGETER",
    },
    {
        id: "title-judged",
        type: "title",
        name: "JUDGED",
        icon: "⚖️",
        price: 1000,
        description: "And found acceptable.",
        titleText: "JUDGED",
    },
    {
        id: "title-void-stares-back",
        type: "title",
        name: "THE VOID STARES BACK",
        icon: "🌑",
        price: 2000,
        description: "And you did not blink.",
        titleText: "THE VOID STARES BACK",
    },
    {
        id: "it-was-the-phone",
        type: "title",
        name: "IT WAS THE PHONE",
        icon: "📱",
        price: 150,
        description: "Not your fault.",
        titleText: "IT WAS THE PHONE",
    },
    {
        id: "title-why",
        type: "title",
        name: "WHY AM I DOING THIS",
        icon: "❓",
        price: 420,
        description: "Unknown.",
        titleText: "WHY AM I DOING THIS",
    },
    {
        id: "title-staring",
        type: "title",
        name: "STOP STARING",
        icon: "👀",
        price: 450,
        description: "Seriously.",
        titleText: "STOP STARING",
    },
    {
        id: "title-no-thoughts",
        type: "title",
        name: "NO THOUGHTS",
        icon: "🫥",
        price: 700,
        description: "Head empty.",
        titleText: "NO THOUGHTS",
    },
    {
        id: "title-many-thoughts",
        type: "title",
        name: "MANY THOUGHTS",
        icon: "💭",
        price: 700,
        description: "All at once.",
        titleText: "MANY THOUGHTS",
    },
    {
        id: "title-both",
        type: "title",
        name: "BOTH",
        icon: "♾️",
        price: 900,
        description: "Simultaneously.",
        titleText: "BOTH",
    },
    {
        id: "title-nothing-happened",
        type: "title",
        name: "NOTHING HAPPENED",
        icon: "🫠",
        price: 800,
        description: "Correct.",
        titleText: "NOTHING HAPPENED",
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
