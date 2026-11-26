export type SessionDurationMode = "simple" | "raw" | "spicy";
export type DurationSelection = 5 | 10 | 15 | 20 | 30 | "custom";

export const SESSION_DURATIONS: Exclude<DurationSelection, "custom">[] = [
    5, 10, 15, 20, 30,
];

export function getSessionDurationSeconds(
    mode: SessionDurationMode,
    selection: DurationSelection,
    customMinutes: string,
): number | null {
    if (mode === "spicy") return null;

    let minutes: number;
    if (selection === "custom") {
        const value = customMinutes.trim();
        if (!/^\d+$/.test(value)) return null;

        minutes = Number(value);
        if (
            !Number.isSafeInteger(minutes) ||
            minutes <= 0 ||
            minutes > Math.floor(Number.MAX_SAFE_INTEGER / 60)
        ) {
            return null;
        }
    } else {
        minutes = selection;
    }

    return minutes * 60;
}
