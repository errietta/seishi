import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Spacer from "../components/ui/Spacer";
import { useSessionStore, type Mode } from "../lib/store/sessionStore";
import { calculateCoins } from "../lib/scoring/scoreCalculator";
import { colors, spacing, typography } from "../lib/theme";

const MODES: { key: Mode; badge?: string }[] = [
    { key: "simple" },
    { key: "raw" },
    { key: "spicy", badge: "🌶" },
];

// Reference range: min = 5 min, 2 pickups, no punishment, no streak
//                 max = 20/30 min, 0 pickups, reset punishment, 7-day streak
function modeRange(mode: Mode): { min: number; max: number } {
    const maxDur = mode === "spicy" ? 1800 : 1200;
    return {
        min: calculateCoins({
            pickups: 2,
            streakDays: 0,
            durationSeconds: 300,
            mode,
            punishmentMode: "none",
        }),
        max: calculateCoins({
            pickups: 0,
            streakDays: 7,
            durationSeconds: maxDur,
            mode,
            punishmentMode: "reset",
        }),
    };
}

export default function ModeSelect() {
    const { t } = useTranslation();
    const reset = useSessionStore((s) => s.reset);

    function selectMode(mode: Mode) {
        reset();
        router.push({ pathname: "/session-config", params: { mode } });
    }

    return (
        <Screen>
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.back}
                >
                    <Text style={[typography.caption, { color: colors.muted }]}>
                        ← BACK
                    </Text>
                </TouchableOpacity>

                <Text style={[typography.title, { color: colors.text }]}>
                    {t("modes.title")}
                </Text>
                <Spacer size={spacing.xl} />

                {MODES.map(({ key, badge }) => {
                    const range = modeRange(key);
                    return (
                        <TouchableOpacity
                            key={key}
                            onPress={() => selectMode(key)}
                            activeOpacity={0.75}
                        >
                            <Card style={styles.card}>
                                <Text
                                    style={[
                                        typography.title,
                                        { color: colors.accent },
                                    ]}
                                >
                                    {t(`modes.${key}.name`)}
                                    {badge ? ` ${badge}` : ""}
                                </Text>
                                <Spacer size={spacing.sm} />
                                <Text
                                    style={[
                                        typography.body,
                                        { color: colors.muted },
                                    ]}
                                >
                                    {t(`modes.${key}.description`)}
                                </Text>
                                <Spacer size={spacing.md} />
                                <View style={styles.coinRow}>
                                    <Text style={styles.coinRangeText}>
                                        🪙 {range.min} – {range.max.toLocaleString()}
                                    </Text>
                                    <Text style={styles.coinRangeHint}>
                                        per session
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.xl,
    },
    back: {
        padding: spacing.md,
        marginBottom: spacing.sm,
        alignSelf: "flex-start",
    },
    card: {
        marginBottom: spacing.md,
    },

    coinRow: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: spacing.sm,
    },

    coinRangeText: {
        fontSize: 14,
        fontWeight: "300" as const,
        letterSpacing: 1,
        color: colors.gold,
    },

    coinRangeHint: {
        fontSize: 11,
        letterSpacing: 1,
        color: colors.gold + "66",
    },
});
