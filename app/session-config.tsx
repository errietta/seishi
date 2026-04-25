import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
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
import { colors, radius, spacing, typography } from "../lib/theme";

const DURATIONS = [5, 10, 15, 20];
const SPICY_MINS = [5, 7, 10, 12];
const SPICY_MAXS = [10, 15, 20, 30];
const SOUNDS = ["none", "rain", "whitenoise", "singingbowl"] as const;

export default function SessionConfig() {
    const { t } = useTranslation();
    const { mode } = useLocalSearchParams<{ mode: Mode }>();
    const startSession = useSessionStore((s) => s.startSession);
    const devMode = useStreakStore((s) => s.devMode);

    const [duration, setDuration] = useState(10);
    const [sound, setSound] = useState<string | null>(null);
    const [spicyMin, setSpicyMin] = useState(7);
    const [spicyMax, setSpicyMax] = useState(15);
    const [punishment, setPunishment] = useState<PunishmentMode>("none");
    const [gong, setGong] = useState(false);

    const soundLabel = (key: string) => {
        if (key === "none") return t("config.soundNone");
        if (key === "rain") return t("config.soundRain");
        if (key === "whitenoise") return t("config.soundWhiteNoise");
        return t("config.soundSingingBowl");
    };

    function begin() {
        const finalDuration = devMode
            ? 5
            : mode === "spicy"
              ? (spicyMin +
                    Math.floor(Math.random() * (spicyMax - spicyMin + 1))) *
                60
              : duration * 60;
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
                            {DURATIONS.map((d) => (
                                <Chip
                                    key={d}
                                    label={`${d} min`}
                                    active={duration === d}
                                    onPress={() => setDuration(d)}
                                />
                            ))}
                        </View>
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
                                {SOUNDS.map((key) => (
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
                <Button
                    label={t("config.begin")}
                    onPress={begin}
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
});
