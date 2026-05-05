import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Spacer from "../components/ui/Spacer";
import { useLootStore } from "../lib/store/lootStore";
import { LOOT_TABLE } from "../lib/loot/lootTable";
import { colors, spacing, typography } from "../lib/theme";

export default function Junk() {
    const { t } = useTranslation();
    const junk = useLootStore((s) => s.junk);

    const counts = junk.reduce<Record<string, number>>((acc, id) => {
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
    }, {});

    const collected = LOOT_TABLE.filter((item) => counts[item.id]).length;

    return (
        <Screen edges={["top", "bottom"]}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text
                            style={[
                                typography.caption,
                                { color: colors.muted },
                            ]}
                        >
                            ← BACK
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={[typography.title, { color: colors.text }]}>
                    {t("junk.pageTitle")}
                </Text>
                <Spacer size={spacing.xs} />
                <Text style={[typography.caption, { color: colors.muted }]}>
                    {t("junk.collected", {
                        count: collected,
                        total: LOOT_TABLE.length,
                    })}
                </Text>

                <Spacer size={spacing.xl} />

                <View style={styles.grid}>
                    {LOOT_TABLE.map((item) => {
                        const count = counts[item.id] ?? 0;
                        const owned = count > 0;
                        return (
                            <Card
                                key={item.id}
                                style={[
                                    styles.itemCard,
                                    !owned && styles.unownedCard,
                                ]}
                            >
                                <Text style={styles.itemEmoji}>
                                    {owned ? item.icon : "❓"}
                                </Text>
                                <Text
                                    style={[
                                        styles.itemName,
                                        !owned && styles.unownedText,
                                    ]}
                                    numberOfLines={2}
                                >
                                    {owned ? item.name : "???"}
                                </Text>
                                {owned && count > 1 && (
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countText}>
                                            ×{count}
                                        </Text>
                                    </View>
                                )}
                            </Card>
                        );
                    })}
                </View>

                <Spacer size={spacing.xl} />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        alignItems: "center",
    },
    header: {
        width: "100%",
        marginBottom: spacing.lg,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        width: "100%",
        gap: spacing.sm,
    },
    itemCard: {
        width: "47%",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 100,
        position: "relative",
    },
    unownedCard: {
        opacity: 0.35,
    },
    itemEmoji: {
        fontSize: 32,
        marginBottom: spacing.xs,
    },
    itemName: {
        ...typography.caption,
        color: colors.text,
        textAlign: "center",
        letterSpacing: 1,
    },
    unownedText: {
        color: colors.muted,
    },
    countBadge: {
        position: "absolute",
        top: spacing.xs,
        right: spacing.xs,
        backgroundColor: colors.accent + "33",
        borderRadius: 999,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    countText: {
        fontSize: 10,
        letterSpacing: 1,
        color: colors.accent,
    },
});
