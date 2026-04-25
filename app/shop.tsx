import React, { useMemo } from "react";
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
import Button from "../components/ui/Button";
import Spacer from "../components/ui/Spacer";
import { useStreakStore } from "../lib/store/streakStore";
import { useShopStore } from "../lib/store/shopStore";
import { CATALOG, type CatalogItem } from "../lib/shop/catalog";
import { colors, radius, spacing, typography } from "../lib/theme";

// ── helpers ────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

// ── item card ──────────────────────────────────────────────────────

function ShopItemCard({
    item,
    owned,
    active,
    freezeCount,
    canAfford,
    onBuy,
    onEquip,
    onUnequip,
}: {
    item: CatalogItem;
    owned: boolean;
    active: boolean;
    freezeCount: number;
    canAfford: boolean;
    onBuy: () => void;
    onEquip: () => void;
    onUnequip: () => void;
}) {
    const { t } = useTranslation();
    const isEquippable = item.type === "orb-theme" || item.type === "title";
    const isConsumable = !!item.consumable;

    return (
        <Card style={styles.itemCard}>
            <View style={styles.itemHeader}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View style={styles.itemMeta}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
            </View>

            <Spacer size={spacing.sm} />

            <View style={styles.itemFooter}>
                {/* consumable count badge */}
                {isConsumable && freezeCount > 0 && (
                    <Text style={styles.freezeCount}>×{freezeCount}</Text>
                )}

                {/* state: not owned */}
                {!owned && !isConsumable && (
                    <Button
                        label={
                            canAfford
                                ? `${t("shop.buy")}  🪙 ${item.price.toLocaleString()}`
                                : `🪙 ${item.price.toLocaleString()}`
                        }
                        onPress={onBuy}
                        variant="primary"
                        disabled={!canAfford}
                        style={styles.itemButton}
                    />
                )}

                {/* consumable buy button (always shown) */}
                {isConsumable && (
                    <Button
                        label={`${t("shop.buy")}  🪙 ${item.price.toLocaleString()}`}
                        onPress={onBuy}
                        variant="primary"
                        disabled={!canAfford}
                        style={styles.itemButton}
                    />
                )}

                {/* state: owned, not equippable (sound) */}
                {owned && !isEquippable && (
                    <View style={styles.ownedBadge}>
                        <Text style={styles.ownedText}>{t("shop.owned")}</Text>
                    </View>
                )}

                {/* state: owned equippable, not active */}
                {owned && isEquippable && !active && (
                    <View style={styles.itemActions}>
                        <View style={styles.ownedBadge}>
                            <Text style={styles.ownedText}>
                                {t("shop.owned")}
                            </Text>
                        </View>
                        <Button
                            label={t("shop.equip")}
                            onPress={onEquip}
                            variant="ghost"
                            style={styles.itemButton}
                        />
                    </View>
                )}

                {/* state: active */}
                {owned && isEquippable && active && (
                    <View style={styles.itemActions}>
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeText}>
                                {t("shop.active")}
                            </Text>
                        </View>
                        <Button
                            label={t("shop.unequip")}
                            onPress={onUnequip}
                            variant="ghost"
                            style={styles.itemButton}
                        />
                    </View>
                )}
            </View>
        </Card>
    );
}

// ── section heading ────────────────────────────────────────────────

function SectionHead({ label }: { label: string }) {
    return (
        <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>{label}</Text>
            <View style={styles.sectionLine} />
        </View>
    );
}

// ── main screen ────────────────────────────────────────────────────

export default function Shop() {
    const { t } = useTranslation();

    const history = useStreakStore((s) => s.history);

    const ownedItems = useShopStore((s) => s.ownedItems);
    const streakFreezes = useShopStore((s) => s.streakFreezes);
    const activeOrbTheme = useShopStore((s) => s.activeOrbTheme);
    const activeTitle = useShopStore((s) => s.activeTitle);
    const purchases = useShopStore((s) => s.purchases);
    const devCoins = useShopStore((s) => s.devCoins);
    const buyItem = useShopStore((s) => s.buyItem);
    const setActiveOrbTheme = useShopStore((s) => s.setActiveOrbTheme);
    const setActiveTitle = useShopStore((s) => s.setActiveTitle);

    const earned = Math.round(history.reduce((sum, r) => sum + r.score, 0)) + devCoins;
    const spent = purchases.reduce((sum, p) => sum + p.cost, 0);
    const balance = earned - spent;

    // merged coin ledger, newest first
    const ledger = useMemo(() => {
        const sessionEntries = history.map((r) => ({
            date: r.date,
            label: t("shop.session"),
            amount: Math.round(r.score),
            positive: true,
        }));
        const purchaseEntries = purchases.map((p) => {
            const item = CATALOG.find((c) => c.id === p.itemId);
            return {
                date: p.date,
                label: item ? `${item.icon} ${item.name}` : p.itemId,
                amount: p.cost,
                positive: false,
            };
        });
        return [...sessionEntries, ...purchaseEntries].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
    }, [history, purchases]);

    function handleBuy(item: CatalogItem) {
        buyItem(item, balance);
    }

    const byType = (type: CatalogItem["type"]) =>
        CATALOG.filter((c) => c.type === type);

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* ── back + title ── */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.back}
                >
                    <Text style={[typography.caption, { color: colors.muted }]}>
                        ← BACK
                    </Text>
                </TouchableOpacity>

                <Text style={[typography.title, { color: colors.text }]}>
                    {t("shop.title")}
                </Text>
                <Spacer size={spacing.xl} />

                {/* ── balance card ── */}
                <Card style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>{t("shop.balance")}</Text>
                    <Text style={styles.balanceValue}>
                        🪙 {balance.toLocaleString()}
                    </Text>
                    <Text style={styles.balanceMeta}>
                        +{earned.toLocaleString()} {t("shop.earned")} ·{" "}
                        -{spent.toLocaleString()} {t("shop.spent")}
                    </Text>
                </Card>

                {/* ── sounds ── */}
                <Spacer size={spacing.lg} />
                <SectionHead label={t("shop.sounds")} />
                {byType("sound").map((item) => (
                    <ShopItemCard
                        key={item.id}
                        item={item}
                        owned={ownedItems.includes(item.id)}
                        active={false}
                        freezeCount={0}
                        canAfford={balance >= item.price}
                        onBuy={() => handleBuy(item)}
                        onEquip={() => {}}
                        onUnequip={() => {}}
                    />
                ))}

                {/* ── orb themes ── */}
                <Spacer size={spacing.lg} />
                <SectionHead label={t("shop.orbThemes")} />
                {byType("orb-theme").map((item) => (
                    <ShopItemCard
                        key={item.id}
                        item={item}
                        owned={ownedItems.includes(item.id)}
                        active={activeOrbTheme === item.id}
                        freezeCount={0}
                        canAfford={balance >= item.price}
                        onBuy={() => handleBuy(item)}
                        onEquip={() => setActiveOrbTheme(item.id)}
                        onUnequip={() => setActiveOrbTheme(null)}
                    />
                ))}

                {/* ── consumables ── */}
                <Spacer size={spacing.lg} />
                <SectionHead label={t("shop.consumables")} />
                {byType("streak-freeze").map((item) => (
                    <ShopItemCard
                        key={item.id}
                        item={item}
                        owned={streakFreezes > 0}
                        active={false}
                        freezeCount={streakFreezes}
                        canAfford={balance >= item.price}
                        onBuy={() => handleBuy(item)}
                        onEquip={() => {}}
                        onUnequip={() => {}}
                    />
                ))}

                {/* ── titles ── */}
                <Spacer size={spacing.lg} />
                <SectionHead label={t("shop.titles")} />
                {byType("title").map((item) => (
                    <ShopItemCard
                        key={item.id}
                        item={item}
                        owned={ownedItems.includes(item.id)}
                        active={activeTitle === item.id}
                        freezeCount={0}
                        canAfford={balance >= item.price}
                        onBuy={() => handleBuy(item)}
                        onEquip={() => setActiveTitle(item.id)}
                        onUnequip={() => setActiveTitle(null)}
                    />
                ))}

                {/* ── record link ── */}
                <Spacer size={spacing.xl} />
                <SectionHead label={t("shop.record")} />
                <TouchableOpacity
                    style={styles.recordRow}
                    onPress={() => router.push("/stats")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.recordLabel}>
                        {t("stats.title")} →
                    </Text>
                </TouchableOpacity>

                {/* ── coin history ── */}
                <Spacer size={spacing.lg} />
                <SectionHead label={t("shop.coinHistory")} />
                {ledger.length === 0 ? (
                    <Text style={styles.emptyText}>{t("stats.empty")}</Text>
                ) : (
                    ledger.map((entry, i) => (
                        <View
                            key={i}
                            style={[
                                styles.ledgerRow,
                                i < ledger.length - 1 &&
                                    styles.ledgerRowBorder,
                            ]}
                        >
                            <Text style={styles.ledgerDate}>
                                {formatDate(entry.date)}
                            </Text>
                            <Text
                                style={styles.ledgerLabel}
                                numberOfLines={1}
                            >
                                {entry.label}
                            </Text>
                            <Text
                                style={[
                                    styles.ledgerAmount,
                                    {
                                        color: entry.positive
                                            ? colors.success
                                            : colors.danger,
                                    },
                                ]}
                            >
                                {entry.positive ? "+" : "-"}
                                {entry.amount.toLocaleString()}
                            </Text>
                        </View>
                    ))
                )}

                <Spacer size={spacing.xxl} />
            </ScrollView>
        </Screen>
    );
}

// ── styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        padding: spacing.xl,
    },

    back: {
        padding: spacing.md,
        marginBottom: spacing.sm,
        alignSelf: "flex-start",
    },

    // ── balance ──

    balanceCard: {
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.gold + "40",
        backgroundColor: colors.gold + "08",
    },

    balanceLabel: {
        ...typography.caption,
        color: colors.gold + "99",
        marginBottom: spacing.xs,
    },

    balanceValue: {
        fontSize: 40,
        fontWeight: "200" as const,
        letterSpacing: 4,
        color: colors.gold,
    },

    balanceMeta: {
        ...typography.caption,
        color: colors.muted,
        marginTop: spacing.xs,
    },

    // ── section ──

    sectionHead: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginBottom: spacing.sm,
    },

    sectionLabel: {
        ...typography.caption,
        color: colors.muted,
        flexShrink: 0,
    },

    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.surface,
    },

    // ── item card ──

    itemCard: {
        marginBottom: spacing.sm,
    },

    itemHeader: {
        flexDirection: "row",
        gap: spacing.md,
        alignItems: "flex-start",
    },

    itemIcon: {
        fontSize: 24,
        lineHeight: 30,
    },

    itemMeta: {
        flex: 1,
    },

    itemName: {
        ...typography.caption,
        color: colors.text,
        letterSpacing: 3,
    },

    itemDesc: {
        ...typography.caption,
        color: colors.muted,
        marginTop: 2,
        letterSpacing: 1,
    },

    itemFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: spacing.sm,
    },

    itemActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },

    itemButton: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
    },

    freezeCount: {
        ...typography.caption,
        color: colors.accent,
        marginRight: spacing.sm,
    },

    ownedBadge: {
        paddingVertical: 4,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.gold + "66",
    },

    ownedText: {
        fontSize: 10,
        letterSpacing: 2,
        color: colors.gold,
    },

    activeBadge: {
        paddingVertical: 4,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: colors.gold + "22",
        borderWidth: 1,
        borderColor: colors.gold,
    },

    activeText: {
        fontSize: 10,
        letterSpacing: 2,
        color: colors.gold,
    },

    // ── record ──

    recordRow: {
        paddingVertical: spacing.md,
    },

    recordLabel: {
        ...typography.body,
        color: colors.accent,
    },

    // ── ledger ──

    emptyText: {
        ...typography.caption,
        color: colors.muted,
        marginTop: spacing.sm,
    },

    ledgerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.sm,
        gap: spacing.md,
    },

    ledgerRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
    },

    ledgerDate: {
        ...typography.caption,
        color: colors.muted,
        width: 44,
        flexShrink: 0,
    },

    ledgerLabel: {
        ...typography.caption,
        color: colors.text,
        flex: 1,
        letterSpacing: 1,
    },

    ledgerAmount: {
        ...typography.caption,
        letterSpacing: 1,
        flexShrink: 0,
    },
});
