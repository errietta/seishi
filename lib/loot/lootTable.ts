export interface LootItem {
    id: string;
    icon: string;
    name: string;
    description: string;
}

export const LOOT_TABLE: LootItem[] = [
    {
        id: "excuse-certificate",
        icon: "📜",
        name: "EXCUSE CERTIFICATE",
        description: "Official proof that you were going to meditate yesterday.",
    },
    {
        id: "participation-trophy",
        icon: "🏆",
        name: "PARTICIPATION TROPHY",
        description: "You showed up. That's about it.",
    },
    {
        id: "doomscroll-receipt",
        icon: "🧾",
        name: "DOOMSCROLL RECEIPT",
        description: "47 minutes of scrolling, itemised. No refunds.",
    },
    {
        id: "healing-crystal",
        icon: "💎",
        name: "HEALING CRYSTAL",
        description: "Probably does something. Who knows.",
    },
    {
        id: "self-help-book",
        icon: "📚",
        name: "SELF-HELP BOOK",
        description: "Chapter 1 read. Chapter 2 pending since March.",
    },
    {
        id: "cold-brew",
        icon: "☕",
        name: "COLD BREW",
        description: "You meditated AND had coffee. Hero.",
    },
    {
        id: "granola-bar",
        icon: "🍫",
        name: "GRANOLA BAR",
        description: "Found in your meditation cushion. Still edible.",
    },
    {
        id: "scented-candle",
        icon: "🕯️",
        name: "SCENTED CANDLE",
        description: "Promises transformation. Delivers mild lavender.",
    },
    {
        id: "smartwatch",
        icon: "⌚",
        name: "SMARTWATCH",
        description: "Told you to breathe. You were already trying.",
    },
    {
        id: "phone",
        icon: "📱",
        name: "YOUR PHONE",
        description: "You know what you did.",
    },
    {
        id: "stray-thought",
        icon: "💭",
        name: "STRAY THOUGHT",
        description: "About an email. During your best moment.",
    },
    {
        id: "snooze-button",
        icon: "⏰",
        name: "SNOOZE BUTTON",
        description: "Hit five times before this session. A personal record.",
    },
    {
        id: "todo-list",
        icon: "📝",
        name: "TODO LIST",
        description: "Grew three items longer while you were sitting still.",
    },
    {
        id: "yoga-mat",
        icon: "🧘",
        name: "YOGA MAT",
        description: "Used as a rug since November.",
    },
    {
        id: "incense-stub",
        icon: "🌸",
        name: "INCENSE STUB",
        description: "Burned 40% before forgetting it existed.",
    },
    {
        id: "app-subscription",
        icon: "💸",
        name: "APP SUBSCRIPTION",
        description: "You have four of them. You use this one. Sometimes.",
    },
    {
        id: "notification",
        icon: "🔔",
        name: "NOTIFICATION",
        description: "From your other meditation app. Ironic.",
    },
    {
        id: "mindfulness-journal",
        icon: "📓",
        name: "MINDFULNESS JOURNAL",
        description: "Three entries. One is a grocery list.",
    },
    {
        id: "weighted-blanket",
        icon: "🛌",
        name: "WEIGHTED BLANKET",
        description: "You meditate better horizontal. This is fine.",
    },
    {
        id: "loose-change",
        icon: "🪙",
        name: "LOOSE CHANGE",
        description: "Found in the lining of your consciousness.",
    },
];

/** Chance (0–1) that a session awards junk. Easy to tune. */
export const LOOT_DROP_CHANCE = 0.1;

/** Returns a random item, or null if the roll misses. */
export function rollLoot(): LootItem | null {
    if (Math.random() > LOOT_DROP_CHANCE) return null;
    return LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
}
