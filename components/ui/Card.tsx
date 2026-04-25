import React from "react";
import { View, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../../lib/theme";

interface Props {
    children: React.ReactNode;
    style?: ViewStyle;
}

export default function Card({ children, style }: Props) {
    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface,
                    borderRadius: radius.md,
                    padding: spacing.lg,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}
