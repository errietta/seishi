import "../lib/i18n";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useStreakStore } from "../lib/store/streakStore";
import { colors } from "../lib/theme";

export default function RootLayout() {
    const initialize = useStreakStore((s) => s.initialize);

    useEffect(() => {
        initialize();
    }, []);

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
