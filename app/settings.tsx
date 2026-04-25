import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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

    const [showPicker, setShowPicker] = useState(false);

    const notificationDate = new Date();
    notificationDate.setHours(notificationHour, notificationMinute, 0, 0);

    const timeLabel =
        `${String(notificationHour).padStart(2, "0")}:${String(notificationMinute).padStart(2, "0")}`;

    function handleTimeChange(_: unknown, selected?: Date) {
        setShowPicker(false);
        if (!selected) return;
        const h = selected.getHours();
        const m = selected.getMinutes();
        setNotificationTime(h, m);
        if (notificationsEnabled) {
            scheduleDailyReminder(h, m);
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
            scheduleDailyReminder(notificationHour, notificationMinute);
        } else {
            setNotificationsEnabled(false);
            cancelDailyReminder();
        }
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
                            <View style={styles.row}>
                                <Text style={[typography.caption, { flex: 1 }]}>
                                    {t("settings.notificationsTime")}
                                </Text>
                                <TouchableOpacity onPress={() => setShowPicker(true)}>
                                    <Text style={styles.timeLabel}>{timeLabel}</Text>
                                </TouchableOpacity>
                            </View>
                            {showPicker && (
                                <DateTimePicker
                                    mode="time"
                                    value={notificationDate}
                                    onChange={handleTimeChange}
                                    display="default"
                                />
                            )}
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

    timeLabel: {
        fontSize: 18,
        fontWeight: "200" as const,
        letterSpacing: 2,
        color: colors.accent,
    },

});
