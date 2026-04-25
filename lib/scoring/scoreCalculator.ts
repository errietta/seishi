import type { Mode, PunishmentMode } from "../store/sessionStore";

export function calculateScore(pickups: number, streakDays: number): number {
    const base = 100;
    const penalty = pickups * 20;
    const multiplier = 1 + Math.min(streakDays * 0.05, 1.0);
    return Math.max(0, base - penalty) * multiplier;
}

export function calculateCoins(params: {
    pickups: number;
    streakDays: number;
    durationSeconds: number;
    mode: Mode;
    punishmentMode: PunishmentMode;
}): number {
    const { pickups, streakDays, durationSeconds, mode, punishmentMode } =
        params;

    const rawScore = calculateScore(pickups, streakDays);

    const durationMult = Math.max(
        1.0,
        Math.min(3.0, 1 + Math.log(durationSeconds / 300) / Math.log(6)),
    );

    const modeMults: Record<Mode, number> = {
        simple: 1.0,
        raw: 1.3,
        spicy: 1.5,
    };

    const punishmentMults: Record<PunishmentMode, number> = {
        none: 1.0,
        "add-time": 1.2,
        "add-time-long": 1.4,
        reset: 1.5,
        random: 1.3,
    };

    return Math.round(
        rawScore *
            durationMult *
            modeMults[mode] *
            punishmentMults[punishmentMode],
    );
}
