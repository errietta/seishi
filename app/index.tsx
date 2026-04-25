import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Screen from "../components/ui/Screen";
import Button from "../components/ui/Button";
import Spacer from "../components/ui/Spacer";
import PresenceOrb from "../components/PresenceOrb";
import StreakDisplay from "../components/StreakDisplay";
import HintModal, { HintTip } from "../components/HintModal";
import { useStreakStore } from "../lib/store/streakStore";
import { colors, spacing, typography } from "../lib/theme";

export default function Home() {
    const { t } = useTranslation();
    const streak = useStreakStore((s) => s.currentStreak);
    const history = useStreakStore((s) => s.history);
    const showWelcome = useStreakStore((s) => s.showWelcome);
    const setShowWelcome = useStreakStore((s) => s.setShowWelcome);
    const lastScore = history[0]?.score;
    const totalPoints = Math.round(
        history.reduce((sum, r) => sum + r.score, 0),
    );

    return (
        <Screen>
            <View style={styles.container}>
                {/* Top nav */}
                <View style={styles.topNav}>
                    <TouchableOpacity
                        onPress={() => router.push("/stats")}
                        style={styles.navButton}
                    >
                        <Text
                            style={[
                                typography.caption,
                                { color: colors.muted },
                            ]}
                        >
                            RECORD
                        </Text>
                        {totalPoints > 0 && (
                            <Text style={styles.walletLabel}>
                                🪙 {totalPoints.toLocaleString()}
                            </Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push("/settings")}
                        style={styles.navButton}
                    >
                        <Text
                            style={[
                                typography.caption,
                                { color: colors.muted },
                            ]}
                        >
                            SETTINGS
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <View style={styles.titleBlock}>
                    <Text style={[typography.hero, { color: colors.text }]}>
                        {t("home.title")}
                    </Text>
                    <Text
                        style={[
                            typography.caption,
                            { color: colors.muted, marginTop: spacing.xs },
                        ]}
                    >
                        {t("home.subtitle")}
                    </Text>
                </View>

                {/* Orb */}
                <View style={styles.orbArea}>
                    <PresenceOrb
                        phase="idle"
                        size={110}
                    />
                </View>

                {/* Stats */}
                <View style={styles.statsBlock}>
                    {streak > 0 ? (
                        <StreakDisplay streak={streak} />
                    ) : (
                        <Text
                            style={[
                                typography.caption,
                                { color: colors.muted },
                            ]}
                        >
                            {t("home.noStreak")}
                        </Text>
                    )}
                    {lastScore !== undefined && (
                        <Text
                            style={[
                                typography.caption,
                                { marginTop: spacing.sm },
                            ]}
                        >
                            {t("home.lastScore")}: 🪙 {Math.round(lastScore).toLocaleString()}
                        </Text>
                    )}
                </View>

                <Button
                    label={t("home.begin")}
                    onPress={() => router.push("/mode-select")}
                />
                <Spacer size={spacing.lg} />
            </View>
            <HintModal
                visible={showWelcome}
                title={t("hints.welcomeTitle")}
                buttonLabel={t("hints.welcomeDismiss")}
                onDismiss={(showAgain) => setShowWelcome(showAgain)}
            >
                <HintTip>{t("hints.welcome1")}</HintTip>
                <HintTip>{t("hints.welcome2")}</HintTip>
                <HintTip>{t("hints.welcome3")}</HintTip>
            </HintModal>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: spacing.xl,
    },
    topNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    navButton: {
        padding: spacing.md,
    },
    titleBlock: {
        alignItems: "center",
    },
    orbArea: {
        flex: 1,
        maxHeight: 180,
        alignItems: "center",
        justifyContent: "center",
    },
    statsBlock: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },

    walletLabel: {
        ...typography.caption,
        color: colors.gold,
        marginTop: 2,
    },
});
