import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Screen from "../components/ui/Screen";
import Card from "../components/ui/Card";
import Spacer from "../components/ui/Spacer";
import { useStreakStore } from "../lib/store/streakStore";
import { useShopStore } from "../lib/store/shopStore";
import { DEV_MODE_AVAILABLE } from "../lib/config";
import { colors, spacing, typography } from "../lib/theme";
import {
    requestNotificationPermission,
    scheduleDailyReminder,
    cancelDailyReminder,
} from "../lib/notifications";

export default function Settings() {
    const { t } = useTranslation();
    const tone = useStreakStore((s) => s.tone);
    const setTone = useStreakStore((s) => s.setTone);
    const devMode = useStreakStore((s) => s.devMode);
    const setDevMode = useStreakStore((s) => s.setDevMode);
    const devCoins = useShopStore((s) => s.devCoins);
    const addDevCoins = useShopStore((s) => s.addDevCoins);
    const showWelcome = useStreakStore((s) => s.showWelcome);
    const showSessionTips = useStreakStore((s) => s.showSessionTips);
    const resetHints = useStreakStore((s) => s.resetHints);
    const hintsOff = !showWelcome || !showSessionTips;

    const notificationsEnabled = useStreakStore(
        (s) => s.notificationsEnabled,
    );
    const notificationHour = useStreakStore((s) => s.notificationHour);
    const notificationMinute = useStreakStore((s) => s.notificationMinute);
    const setNotificationsEnabled = useStreakStore(
        (s) => s.setNotificationsEnabled,
    );
    const setNotificationTime = useStreakStore((s) => s.setNotificationTime);

    const [pendingHour, setPendingHour] = useState(notificationHour);
    const [pendingMinute, setPendingMinute] = useState(notificationMinute);

    function adjustHour(delta: number) {
        const next = (pendingHour + delta + 24) % 24;
        setPendingHour(next);
        setNotificationTime(next, pendingMinute);
        if (notificationsEnabled) {
            scheduleDailyReminder(next, pendingMinute);
        }
    }

    function adjustMinute(delta: number) {
        const next = (pendingMinute + delta + 60) % 60;
        setPendingMinute(next);
        setNotificationTime(pendingHour, next);
        if (notificationsEnabled) {
            scheduleDailyReminder(pendingHour, next);
        }
    }

    async function handleToggleNotifications(value: boolean) {
        if (value) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                Alert.alert(
                    t("settings.notifications"),
                    t("settings.notificationsPermissionDenied"),
                );
                return;
            }
            setNotificationsEnabled(true);
            scheduleDailyReminder(pendingHour, pendingMinute);
        } else {
            setNotificationsEnabled(false);
            cancelDailyReminder();
        }
    }

    const hourStr = String(pendingHour).padStart(2, "0");
    const minuteStr = String(pendingMinute).padStart(2, "0");

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
                    {t("settings.title")}
                </Text>
                <Spacer size={spacing.xl} />

                <Card>
                    <Text style={[typography.caption]}>
                        {t("settings.tone")}
                    </Text>
                    <Spacer size={spacing.md} />
                    <View style={styles.row}>
                        <Text
                            style={[
                                typography.body,
                                {
                                    color:
                                        tone === "encouraging"
                                            ? colors.accent
                                            : colors.muted,
                                },
                            ]}
                        >
                            {t("settings.toneEncouraging")}
                        </Text>
                        <Switch
                            value={tone === "strict"}
                            onValueChange={(v) =>
                                setTone(v ? "strict" : "encouraging")
                            }
                            trackColor={{
                                false: colors.muted,
                                true: colors.accent,
                            }}
                            thumbColor={colors.text}
                        />
                        <Text
                            style={[
                                typography.body,
                                {
                                    color:
                                        tone === "strict"
                                            ? colors.accent
                                            : colors.muted,
                                },
                            ]}
                        >
                            {t("settings.toneStrict")}
                        </Text>
                    </View>
                    <Spacer size={spacing.sm} />
                    <Text style={[typography.caption]}>
                        {tone === "strict"
                            ? '"Acceptable. Do not celebrate."'
                            : '"Beautiful. You showed up."'}
                    </Text>
                </Card>

                {hintsOff && (
                    <>
                        <Spacer size={spacing.md} />
                        <Card>
                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[typography.caption]}>
                                        {t("settings.hints")}
                                    </Text>
                                    <Spacer size={spacing.xs} />
                                    <Text
                                        style={[
                                            typography.caption,
                                            { color: colors.muted },
                                        ]}
                                    >
                                        {t("settings.hintsDesc")}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={resetHints}
                                    style={styles.resetButton}
                                >
                                    <Text style={styles.resetLabel}>
                                        {t("settings.hintsReset")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    </>
                )}

                <Spacer size={spacing.md} />
                <Card>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={[typography.caption]}>
                                {t("settings.notifications")}
                            </Text>
                            <Spacer size={spacing.xs} />
                            <Text
                                style={[
                                    typography.caption,
                                    { color: colors.muted },
                                ]}
                            >
                                {t("settings.notificationsDesc")}
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleToggleNotifications}
                            trackColor={{
                                false: colors.muted,
                                true: colors.accent,
                            }}
                            thumbColor={colors.text}
                        />
                    </View>

                    {notificationsEnabled && (
                        <>
                            <Spacer size={spacing.md} />
                            <Text style={[typography.caption]}>
                                {t("settings.notificationsTime")}
                            </Text>
                            <Spacer size={spacing.sm} />
                            <View style={styles.row}>
                                <View style={styles.timePicker}>
                                    <TouchableOpacity
                                        onPress={() => adjustHour(1)}
                                        style={styles.timeBtn}
                                    >
                                        <Text style={styles.timeBtnText}>
                                            ▲
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.timeValue}>
                                        {hourStr}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => adjustHour(-1)}
                                        style={styles.timeBtn}
                                    >
                                        <Text style={styles.timeBtnText}>
                                            ▼
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.timeSep}>:</Text>
                                <View style={styles.timePicker}>
                                    <TouchableOpacity
                                        onPress={() => adjustMinute(5)}
                                        style={styles.timeBtn}
                                    >
                                        <Text style={styles.timeBtnText}>
                                            ▲
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.timeValue}>
                                        {minuteStr}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => adjustMinute(-5)}
                                        style={styles.timeBtn}
                                    >
                                        <Text style={styles.timeBtnText}>
                                            ▼
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </Card>

                {DEV_MODE_AVAILABLE && (
                    <>
                        <Spacer size={spacing.md} />
                        <Card style={styles.devCard}>
                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[
                                            typography.caption,
                                            {
                                                color: colors.danger,
                                                letterSpacing: 3,
                                            },
                                        ]}
                                    >
                                        DEV MODE
                                    </Text>
                                    <Spacer size={spacing.xs} />
                                    <Text
                                        style={[
                                            typography.caption,
                                            { color: colors.muted },
                                        ]}
                                    >
                                        {devMode
                                            ? "Sessions are 5 seconds."
                                            : "Normal session durations."}
                                    </Text>
                                </View>
                                <Switch
                                    value={devMode}
                                    onValueChange={setDevMode}
                                    trackColor={{
                                        false: colors.muted,
                                        true: colors.danger,
                                    }}
                                    thumbColor={colors.text}
                                />
                            </View>

                            {devMode && (
                                <>
                                    <Spacer size={spacing.md} />
                                    <View style={styles.devDivider} />
                                    <Spacer size={spacing.md} />
                                    <Text
                                        style={[
                                            typography.caption,
                                            { color: colors.danger + "99" },
                                        ]}
                                    >
                                        COINS
                                    </Text>
                                    <Spacer size={spacing.xs} />
                                    <Text style={styles.devCoinValue}>
                                        🪙 {devCoins.toLocaleString()}
                                    </Text>
                                    <Spacer size={spacing.sm} />
                                    <View style={styles.row}>
                                        {[100, 500, 1000].map((amt) => (
                                            <TouchableOpacity
                                                key={amt}
                                                style={styles.devCoinBtn}
                                                onPress={() =>
                                                    addDevCoins(amt)
                                                }
                                            >
                                                <Text style={styles.devCoinBtnText}>
                                                    +{amt}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                        <TouchableOpacity
                                            style={[
                                                styles.devCoinBtn,
                                                styles.devCoinBtnReset,
                                            ]}
                                            onPress={() =>
                                                addDevCoins(-devCoins)
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.devCoinBtnText,
                                                    { color: colors.danger },
                                                ]}
                                            >
                                                RESET
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </Card>
                    </>
                )}
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
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    devCard: {
        borderWidth: 1,
        borderColor: colors.danger + "44",
    },

    devDivider: {
        height: 1,
        backgroundColor: colors.danger + "22",
    },

    devCoinValue: {
        fontSize: 24,
        fontWeight: "200" as const,
        letterSpacing: 3,
        color: colors.gold,
    },

    devCoinBtn: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.danger + "55",
    },

    devCoinBtnReset: {
        borderColor: colors.danger + "88",
    },

    devCoinBtnText: {
        fontSize: 11,
        letterSpacing: 1,
        color: colors.danger + "cc",
    },

    resetButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.accent + "66",
    },

    resetLabel: {
        fontSize: 11,
        letterSpacing: 2,
        color: colors.accent,
    },

    timePicker: {
        alignItems: "center",
        gap: spacing.xs,
    },

    timeBtn: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },

    timeBtnText: {
        fontSize: 12,
        color: colors.accent,
    },

    timeValue: {
        fontSize: 28,
        fontWeight: "200" as const,
        letterSpacing: 4,
        color: colors.text,
        minWidth: 48,
        textAlign: "center",
    },

    timeSep: {
        fontSize: 28,
        fontWeight: "200" as const,
        color: colors.muted,
        marginBottom: spacing.xs,
    },
});
