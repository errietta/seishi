import React, { useState } from "react";
import {
    Modal,
    Pressable,
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
import { LOOT_TABLE, LootItem } from "../lib/loot/lootTable";
import { colors, radius, spacing, typography } from "../lib/theme";

export default function Junk() {
    const { t } = useTranslation();
    const junk = useLootStore((s) => s.junk);
    const [selected, setSelected] = useState<LootItem | null>(null);

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
                            <TouchableOpacity
                                key={item.id}
                                activeOpacity={owned ? 0.7 : 1}
                                onPress={
                                    owned
                                        ? () => setSelected(item)
                                        : undefined
                                }
                                style={styles.itemTouchable}
                            >
                                <Card
                                    style={
                                        owned
                                            ? styles.itemCard
                                            : styles.itemCardUnowned
                                    }
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
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Spacer size={spacing.xl} />
            </ScrollView>

            <Modal
                visible={selected !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelected(null)}
            >
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setSelected(null)}
                >
                    <Pressable style={styles.popup} onPress={() => {}}>
                        <Text style={styles.popupIcon}>{selected?.icon}</Text>
                        <Text style={styles.popupName}>{selected?.name}</Text>
                        <Text style={styles.popupDesc}>
                            {selected?.description}
                        </Text>
                        {selected && counts[selected.id] > 1 && (
                            <Text style={styles.popupCount}>
                                ×{counts[selected.id]} collected
                            </Text>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
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
    itemTouchable: {
        width: "47%",
    },
    itemCard: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 100,
        position: "relative",
    },
    itemCardUnowned: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 100,
        position: "relative",
        opacity: 0.35,
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

    // popup
    backdrop: {
        flex: 1,
        backgroundColor: "#000000aa",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
    },
    popup: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.xl,
        width: "100%",
        alignItems: "center",
        gap: spacing.md,
    },
    popupIcon: {
        fontSize: 64,
    },
    popupName: {
        ...typography.title,
        color: colors.text,
        textAlign: "center",
        fontSize: 16,
    },
    popupDesc: {
        ...typography.body,
        color: colors.muted,
        textAlign: "center",
        lineHeight: 24,
    },
    popupCount: {
        ...typography.caption,
        color: colors.accent,
        marginTop: spacing.xs,
    },
});
