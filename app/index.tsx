import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Screen from "../components/ui/Screen";
import Button from "../components/ui/Button";
import Spacer from "../components/ui/Spacer";
import PresenceDisplay from "../components/PresenceDisplay";
import StreakDisplay from "../components/StreakDisplay";
import HintModal, { HintTip } from "../components/HintModal";
import { useStreakStore } from "../lib/store/streakStore";
import { useShopStore } from "../lib/store/shopStore";
import { CATALOG } from "../lib/shop/catalog";
import { colors, spacing, typography } from "../lib/theme";

export default function Home() {
    const { t } = useTranslation();

    const streak = useStreakStore((s) => s.currentStreak);
    const history = useStreakStore((s) => s.history);
    const showWelcome = useStreakStore((s) => s.showWelcome);
    const setShowWelcome = useStreakStore((s) => s.setShowWelcome);

    const purchases = useShopStore((s) => s.purchases);
    const activePresenceTheme = useShopStore((s) => s.activePresenceTheme);
    const activeTitle = useShopStore((s) => s.activeTitle);
    const devCoins = useShopStore((s) => s.devCoins);

    const formatCoins = (n: number): string => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}m`;
        if (n >= 10_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
        return n.toLocaleString();
    };

    const lastScore = history[0]?.score;
    const earned = Math.round(history.reduce((sum, r) => sum + r.score, 0)) + devCoins;
    const spent = purchases.reduce((sum, p) => sum + p.cost, 0);
    const balance = earned - spent;

    const activeTitleItem = activeTitle
        ? CATALOG.find((c) => c.id === activeTitle)
        : null;

    return (
        <Screen>
            <View style={styles.container}>
                {/* ── top nav ── */}
                <View style={styles.topNav}>
                    <TouchableOpacity
                        onPress={() => router.push("/shop")}
                        style={styles.navButton}
                    >
                        <Text
                            style={[
                                typography.caption,
                                { color: colors.muted },
                            ]}
                        >
                            {t("shop.title")}
                        </Text>
                        {balance > 0 && (
                            <Text style={styles.walletLabel}>
                                🪙 {formatCoins(balance)}
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

                {/* ── title ── */}
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
                    {activeTitleItem && (
                        <Text style={styles.titleBadge}>
                            {activeTitleItem.icon}
                            {activeTitleItem.titleText}
                        </Text>
                    )}
                </View>

                {/* ── orb ── */}
                <View style={styles.orbArea}>
                    <PresenceDisplay
                        phase="idle"
                        size={110}
                        itemId={activePresenceTheme}
                    />
                </View>

                {/* ── stats ── */}
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
                            {t("home.lastScore")}: 🪙{" "}
                            {Math.round(lastScore).toLocaleString()}
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

    titleBadge: {
        ...typography.caption,
        color: colors.gold,
        letterSpacing: 3,
        marginTop: spacing.xs,
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
