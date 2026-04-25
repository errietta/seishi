export const colors = {
    bg: "#0a0a0f",
    surface: "#12121a",
    orbCore: "#a0c4ff",
    orbGlow: "#e0f0ff",
    accent: "#6fa3ef",
    text: "#e8e8f0",
    muted: "#5a5a72",
    danger: "#ff6b6b",
    success: "#6bffb8",
    gold: "#f5c842",
};

export const typography = {
    hero: { fontSize: 48, fontWeight: "200" as const, letterSpacing: 8 },
    title: { fontSize: 24, fontWeight: "300" as const, letterSpacing: 4 },
    body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
    caption: {
        fontSize: 12,
        fontWeight: "400" as const,
        letterSpacing: 2,
        color: "#5a5a72",
    },
    mono: { fontSize: 32, fontWeight: "100" as const },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, xxl: 64 };

export const radius = { sm: 8, md: 16, pill: 999 };
