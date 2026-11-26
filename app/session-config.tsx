import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Spacer from "../components/ui/Spacer";
import {
    useSessionStore,
    type Mode,
    type PunishmentMode,
} from "../lib/store/sessionStore";
import { useStreakStore } from "../lib/store/streakStore";
import { useShopStore } from "../lib/store/shopStore";
import { CATALOG } from "../lib/shop/catalog";
import {
    getSessionDurationSeconds,
    SESSION_DURATIONS,
    type DurationSelection,
} from "../lib/sessionDuration";
import { calculateCoins } from "../lib/scoring/scoreCalculator";
import { colors, radius, spacing, typography } from "../lib/theme";

const SPICY_MINS = [5, 7, 10, 12];
const SPICY_MAXS = [10, 15, 20, 30];
const BASE_SOUNDS = ["none", "rain", "whitenoise", "singingbowl"];

export default function SessionConfig() {
    const { t } = useTranslation();
    const { mode } = useLocalSearchParams<{ mode: Mode }>();
    const startSession = useSessionStore((s) => s.startSession);
    const devMode = useStreakStore((s) => s.devMode);
    const streak = useStreakStore((s) => s.currentStreak);
    const ownedItems = useShopStore((s) => s.ownedItems);

    const availableSounds = [
        ...BASE_SOUNDS,
        ...CATALOG.filter(
            (item) => item.type === "sound" && ownedItems.includes(item.id),
        ).map((item) => item.soundKey!),
    ];

    const [duration, setDuration] = useState<DurationSelection>(10);
    const [customDuration, setCustomDuration] = useState("");
    const [sound, setSound] = useState<string | null>(null);
    const [spicyMin, setSpicyMin] = useState(7);
    const [spicyMax, setSpicyMax] = useState(15);
    const [punishment, setPunishment] = useState<PunishmentMode>("none");
    const [gong, setGong] = useState(true);

    const selectedDurationSeconds = getSessionDurationSeconds(
        mode as Mode,
        duration,
        customDuration,
    );
    const isDurationValid =
        mode === "spicy" || selectedDurationSeconds !== null;

    const soundLabel = (key: string) => {
        if (key === "none") return t("config.soundNone");
        if (key === "rain") return t("config.soundRain");
        if (key === "whitenoise") return t("config.soundWhiteNoise");
        if (key === "singingbowl") return t("config.soundSingingBowl");
        const item = CATALOG.find((c) => c.soundKey === key);
        return item ? item.name : key.toUpperCase();
    };

    function begin() {
        let finalDuration = 5;
        if (!devMode) {
            if (mode === "spicy") {
                finalDuration =
                    (spicyMin +
                        Math.floor(Math.random() * (spicyMax - spicyMin + 1))) *
                    60;
            } else {
                const durationSeconds = getSessionDurationSeconds(
                    mode as Mode,
                    duration,
                    customDuration,
                );
                if (durationSeconds === null) return;
                finalDuration = durationSeconds;
            }
        }
        console.log({ gong });
        startSession(
            mode as Mode,
            finalDuration,
            mode === "simple" ? sound : null,
            punishment,
            gong,
        );
        router.replace("/session");
    }

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.back}
                >
                    <Text style={[typography.caption, { color: colors.muted }]}>
                        ← BACK
                    </Text>
                </TouchableOpacity>

                <Text style={[typography.title, { color: colors.text }]}>
                    {t(`modes.${mode}.name`)}
                </Text>
                <Spacer size={spacing.xl} />

                {mode === "spicy" ? (
                    <Card>
                        <Text style={[typography.caption]}>
                            {t("config.range")}
                        </Text>
                        <Spacer size={spacing.md} />
                        <Text style={[typography.body, { color: colors.text }]}>
                            {t("config.rangeMin")}:{" "}
                            <Text style={{ color: colors.accent }}>
                                {spicyMin} min
                            </Text>
                        </Text>
                        <Spacer size={spacing.sm} />
                        <View style={styles.chipRow}>
                            {SPICY_MINS.map((v) => (
                                <Chip
                                    key={v}
                                    label={String(v)}
                                    active={spicyMin === v}
                                    onPress={() =>
                                        setSpicyMin(Math.min(v, spicyMax - 1))
                                    }
                                />
                            ))}
                        </View>
                        <Spacer size={spacing.md} />
                        <Text style={[typography.body, { color: colors.text }]}>
                            {t("config.rangeMax")}:{" "}
                            <Text style={{ color: colors.accent }}>
                                {spicyMax} min
                            </Text>
                        </Text>
                        <Spacer size={spacing.sm} />
                        <View style={styles.chipRow}>
                            {SPICY_MAXS.map((v) => (
                                <Chip
                                    key={v}
                                    label={String(v)}
                                    active={spicyMax === v}
                                    onPress={() =>
                                        setSpicyMax(Math.max(v, spicyMin + 1))
                                    }
                                />
                            ))}
                        </View>
                    </Card>
                ) : (
                    <Card>
                        <Text style={[typography.caption]}>
                            {t("config.duration")}
                        </Text>
                        <Spacer size={spacing.md} />
                        <View style={styles.chipRow}>
                            {SESSION_DURATIONS.map((d) => (
                                <Chip
                                    key={d}
                                    label={`${d} min`}
                                    active={duration === d}
                                    onPress={() => setDuration(d)}
                                />
                            ))}
                            <Chip
                                label={t("config.durationCustom")}
                                active={duration === "custom"}
                                onPress={() => setDuration("custom")}
                            />
                        </View>
                        {duration === "custom" && (
                            <>
                                <Spacer size={spacing.md} />
                                <TextInput
                                    accessibilityLabel={t(
                                        "config.durationCustomPlaceholder",
                                    )}
                                    keyboardType="number-pad"
                                    onChangeText={setCustomDuration}
                                    placeholder={t(
                                        "config.durationCustomPlaceholder",
                                    )}
                                    placeholderTextColor={colors.muted}
                                    style={styles.customDurationInput}
                                    value={customDuration}
                                />
                                <Text style={styles.customDurationHint}>
                                    {t("config.durationCustomHint")}
                                </Text>
                            </>
                        )}
                    </Card>
                )}

                {mode === "simple" && (
                    <>
                        <Spacer size={spacing.md} />
                        <Card>
                            <Text style={[typography.caption]}>
                                {t("config.sound")}
                            </Text>
                            <Spacer size={spacing.md} />
                            <View style={styles.chipRow}>
                                {availableSounds.map((key) => (
                                    <Chip
                                        key={key}
                                        label={soundLabel(key)}
                                        active={
                                            sound ===
                                            (key === "none" ? null : key)
                                        }
                                        onPress={() =>
                                            setSound(
                                                key === "none" ? null : key,
                                            )
                                        }
                                    />
                                ))}
                            </View>
                        </Card>
                    </>
                )}

                <Spacer size={spacing.md} />
                <Card>
                    <Text style={[typography.caption]}>
                        {t("config.punishment")}
                    </Text>
                    <Spacer size={spacing.md} />
                    <View style={styles.chipRow}>
                        {(
                            [
                                "none",
                                "add-time",
                                "add-time-long",
                                "reset",
                                "random",
                            ] as PunishmentMode[]
                        ).map((key) => (
                            <Chip
                                key={key}
                                label={
                                    key === "none"
                                        ? t("config.punishmentNone")
                                        : key === "add-time"
                                          ? t("config.punishmentAddTime")
                                          : key === "add-time-long"
                                            ? t("config.punishmentAddTimeLong")
                                            : key === "reset"
                                              ? t("config.punishmentReset")
                                              : t("config.punishmentRandom")
                                }
                                active={punishment === key}
                                onPress={() => setPunishment(key)}
                                danger={key !== "none"}
                            />
                        ))}
                    </View>
                </Card>

                <Spacer size={spacing.md} />
                <Card>
                    <Text style={[typography.caption]}>{t("config.gong")}</Text>
                    <Spacer size={spacing.md} />
                    <View style={styles.chipRow}>
                        <Chip
                            label={t("config.gongOff")}
                            active={!gong}
                            onPress={() => setGong(false)}
                        />
                        <Chip
                            label={t("config.gongOn")}
                            active={gong}
                            onPress={() => setGong(true)}
                        />
                    </View>
                </Card>

                <Spacer size={spacing.xl} />

                {(() => {
                    if (!isDurationValid) return null;
                    const base = {
                        pickups: 0,
                        streakDays: streak,
                        punishmentMode: punishment,
                        mode: mode as Mode,
                    };
                    const isSpicy = mode === "spicy";
                    const durationSeconds = isSpicy
                        ? spicyMin * 60
                        : selectedDurationSeconds;
                    if (durationSeconds === null) return null;
                    const minCoins = calculateCoins({
                        ...base,
                        durationSeconds,
                    });
                    const maxCoins = isSpicy
                        ? calculateCoins({
                              ...base,
                              durationSeconds: spicyMax * 60,
                          })
                        : null;
                    return (
                        <View style={styles.coinEstimate}>
                            <Text style={styles.coinEstimateLabel}>UP TO</Text>
                            <Text style={styles.coinEstimateValue}>
                                {maxCoins !== null
                                    ? `🪙 ${minCoins.toLocaleString()} – ${maxCoins.toLocaleString()}`
                                    : `🪙 ${minCoins.toLocaleString()}`}
                            </Text>
                            <Text style={styles.coinEstimateHint}>
                                if no pickups
                            </Text>
                        </View>
                    );
                })()}

                <Spacer size={spacing.md} />
                <Button
                    label={t("config.begin")}
                    onPress={begin}
                    disabled={!isDurationValid}
                />
                <Spacer size={spacing.xl} />
            </ScrollView>
        </Screen>
    );
}

function Chip({
    label,
    active,
    onPress,
    danger = false,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
    danger?: boolean;
}) {
    const activeColor = danger ? colors.danger : colors.accent;
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.chip,
                active && {
                    backgroundColor: activeColor,
                    borderColor: activeColor,
                },
                !active && danger && { borderColor: colors.danger + "66" },
            ]}
        >
            <Text
                style={[
                    styles.chipText,
                    active && { color: colors.bg },
                    !active && danger && { color: colors.danger + "aa" },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.xl,
    },
    back: {
        padding: spacing.md,
        marginBottom: spacing.sm,
        alignSelf: "flex-start",
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    chip: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.muted,
    },
    chipText: {
        fontSize: 12,
        letterSpacing: 1,
        color: colors.muted,
    },
    customDurationInput: {
        borderWidth: 1,
        borderColor: colors.muted,
        borderRadius: radius.md,
        color: colors.text,
        fontSize: 16,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    customDurationHint: {
        color: colors.muted,
        fontSize: 11,
        marginTop: spacing.xs,
    },

    coinEstimate: {
        alignItems: "center" as const,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.gold + "40",
        backgroundColor: colors.gold + "0a",
    },

    coinEstimateLabel: {
        fontSize: 10,
        letterSpacing: 2,
        color: colors.gold + "80",
        marginBottom: spacing.xs,
    },

    coinEstimateValue: {
        fontSize: 28,
        fontWeight: "200" as const,
        letterSpacing: 4,
        color: colors.gold,
    },

    coinEstimateHint: {
        fontSize: 10,
        letterSpacing: 1,
        color: colors.gold + "60",
        marginTop: spacing.xs,
    },
});
