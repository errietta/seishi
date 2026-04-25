import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import en from "./i18n/en.json";

const NOTIFICATION_ID = "seishi_daily_reminder";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === "web") return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
}

export async function scheduleDailyReminder(
    hour: number,
    minute: number,
): Promise<void> {
    await cancelDailyReminder();
    const messages = en.notifications.reminderMessages;
    const body = messages[Math.floor(Math.random() * messages.length)];

    await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_ID,
        content: {
            title: en.notifications.reminderTitle,
            body,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
    });
}

export async function cancelDailyReminder(): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(
        NOTIFICATION_ID,
    ).catch(() => {});
}
