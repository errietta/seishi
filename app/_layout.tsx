import "../lib/i18n";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useStreakStore } from "../lib/store/streakStore";
import { useShopStore } from "../lib/store/shopStore";
import { colors } from "../lib/theme";

export default function RootLayout() {
    const initialize = useStreakStore((s) => s.initialize);
    const initializeShop = useShopStore((s) => s.initialize);

    useEffect(() => {
        initialize();
        initializeShop();
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
