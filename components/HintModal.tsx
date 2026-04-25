import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Button from "./ui/Button";
import { colors, radius, spacing, typography } from "../lib/theme";

interface Props {
    visible: boolean;
    title: string;
    buttonLabel: string;
    onDismiss: (showAgain: boolean) => void;
    children: React.ReactNode;
}

export default function HintModal({
    visible,
    title,
    buttonLabel,
    onDismiss,
    children,
}: Props) {
    const { t } = useTranslation();
    const [showAgain, setShowAgain] = useState(false);

    function handleDismiss() {
        onDismiss(showAgain);
        setShowAgain(false);
    }

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={false}
            statusBarTranslucent
        >
            <View style={styles.container}>

                {/* ── scrollable content ── */}
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>{title}</Text>

                    <View style={styles.body}>{children}</View>
                </ScrollView>

                {/* ── footer ── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.showAgainRow}
                        onPress={() => setShowAgain((v) => !v)}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                showAgain && styles.checkboxOn,
                            ]}
                        >
                            {showAgain && <View style={styles.checkboxDot} />}
                        </View>
                        <Text style={styles.showAgainText}>
                            {t("hints.showAgain")}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.buttonWrap}>
                        <Button
                            label={buttonLabel}
                            onPress={handleDismiss}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export function HintTip({ children }: { children: React.ReactNode }) {
    return (
        <View style={tipStyles.row}>
            <Text style={tipStyles.bullet}>·</Text>
            <Text style={tipStyles.text}>{children}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    scroll: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
    },

    title: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.xl,
    },

    body: {
        gap: spacing.lg,
    },

    footer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.surface,
        gap: spacing.lg,
    },

    showAgainRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        alignSelf: "center",
    },

    checkbox: {
        width: 18,
        height: 18,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
    },

    checkboxOn: {
        borderColor: colors.accent,
        backgroundColor: colors.accent + "22",
    },

    checkboxDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.accent,
    },

    showAgainText: {
        ...typography.caption,
        color: colors.muted,
    },

    buttonWrap: {
        alignItems: "center",
    },
});

const tipStyles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: spacing.md,
    },

    bullet: {
        ...typography.body,
        color: colors.accent,
        marginTop: 1,
    },

    text: {
        ...typography.body,
        color: colors.muted,
        flex: 1,
        lineHeight: 26,
    },
});
