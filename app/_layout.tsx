import "../lib/i18n";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useStreakStore } from "../lib/store/streakStore";
import { useShopStore } from "../lib/store/shopStore";
import {
    scheduleDailyReminder,
    cancelDailyReminder,
    requestNotificationPermission,
} from "../lib/notifications";
import { colors } from "../lib/theme";

export default function RootLayout() {
    const initialize = useStreakStore((s) => s.initialize);
    const initializeShop = useShopStore((s) => s.initialize);
    const initialized = useStreakStore((s) => s.initialized);
    const notificationsEnabled = useStreakStore(
        (s) => s.notificationsEnabled,
    );
    const notificationHour = useStreakStore((s) => s.notificationHour);
    const notificationMinute = useStreakStore((s) => s.notificationMinute);

    useEffect(() => {
        initialize();
        initializeShop();
    }, []);

    useEffect(() => {
        if (!initialized) return;
        if (notificationsEnabled) {
            requestNotificationPermission().then((granted) => {
                if (granted) {
                    scheduleDailyReminder(notificationHour, notificationMinute);
                }
            });
        } else {
            cancelDailyReminder();
        }
    }, [initialized, notificationsEnabled, notificationHour, notificationMinute]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.bg },
                        animation: "fade",
                    }}
                />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
