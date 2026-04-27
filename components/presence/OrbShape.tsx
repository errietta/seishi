import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    interpolateColor,
    Easing,
} from "react-native-reanimated";
import { colors } from "../../lib/theme";
import type { PresenceShapeProps } from "./types";

export default function OrbShape({
    phase,
    joltTrigger,
    size,
    angry,
    coreColor,
    glowColor,
}: PresenceShapeProps) {
    const scale = useSharedValue(1);
    const coreOpacity = useSharedValue(0.6);
    const glowOpacity = useSharedValue(0.3);
    const driftX = useSharedValue(0);
    const driftY = useSharedValue(0);
    const angryProgress = useSharedValue(0);

    const angryRef = useRef(angry);
    angryRef.current = angry;

    useEffect(() => {
        if (angry) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.22, { duration: 280, easing: Easing.out(Easing.quad) }),
                    withTiming(0.96, { duration: 520, easing: Easing.in(Easing.quad) }),
                ),
                -1,
                false,
            );
            coreOpacity.value = withRepeat(
                withSequence(
                    withTiming(1.0, { duration: 180 }),
                    withTiming(0.65, { duration: 520 }),
                ),
                -1,
                false,
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(1.0, { duration: 180 }),
                    withTiming(0.25, { duration: 520 }),
                ),
                -1,
                false,
            );
        } else {
            const breathIn = phase === "idle" ? 6000 : phase === "winding" ? 5000 : 4000;
            const hold = breathIn / 2;
            const halfCycle = breathIn + hold / 2;

            scale.value = withRepeat(
                withTiming(1.18, { duration: halfCycle, easing: Easing.inOut(Easing.sin) }),
                -1,
                true,
            );
            coreOpacity.value = withRepeat(
                withTiming(1.0, { duration: halfCycle, easing: Easing.inOut(Easing.sin) }),
                -1,
                true,
            );
            glowOpacity.value = withRepeat(
                withTiming(phase === "idle" ? 0.5 : 0.8, {
                    duration: halfCycle,
                    easing: Easing.inOut(Easing.sin),
                }),
                -1,
                true,
            );
        }
    }, [angry, phase]);

    useEffect(() => {
        angryProgress.value = withTiming(angry ? 1 : 0, { duration: 500 });
        if (angry) {
            driftX.value = withSpring(0, { damping: 12, stiffness: 80 });
            driftY.value = withSpring(0, { damping: 12, stiffness: 80 });
        }
    }, [angry]);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        function drift() {
            if (angryRef.current) {
                timeoutId = setTimeout(drift, 500);
                return;
            }
            driftX.value = withSpring((Math.random() - 0.5) * 80, { damping: 20, stiffness: 8 });
            driftY.value = withSpring((Math.random() - 0.5) * 60, { damping: 20, stiffness: 8 });
            timeoutId = setTimeout(drift, 3000 + Math.random() * 3000);
        }
        drift();
        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        if (joltTrigger === 0) return;
        scale.value = withSequence(
            withSpring(1.5, { damping: 5, stiffness: 200 }),
            withSpring(1.0, { damping: 12, stiffness: 100 }),
        );
    }, [joltTrigger]);

    const orbStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: driftX.value },
            { translateY: driftY.value },
            { scale: scale.value },
        ],
        opacity: coreOpacity.value,
    }));

    const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

    const coreColorStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(angryProgress.value, [0, 1], [coreColor, colors.danger]),
        shadowColor: interpolateColor(angryProgress.value, [0, 1], [glowColor, colors.danger]),
    }));

    const glowColorStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(angryProgress.value, [0, 1], [glowColor, colors.danger]),
    }));

    const midColorStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(angryProgress.value, [0, 1], [coreColor, colors.danger]),
    }));

    const half = size / 2;
    const glowSize = size * 2.2;

    return (
        <View style={{ alignItems: "center", justifyContent: "center", width: size, height: size }}>
            <Animated.View style={[{ alignItems: "center", justifyContent: "center" }, orbStyle]}>
                <Animated.View
                    style={[
                        {
                            position: "absolute",
                            width: glowSize,
                            height: glowSize,
                            borderRadius: glowSize / 2,
                        },
                        glowColorStyle,
                        glowStyle,
                    ]}
                />
                <Animated.View
                    style={[
                        {
                            position: "absolute",
                            width: size * 1.5,
                            height: size * 1.5,
                            borderRadius: (size * 1.5) / 2,
                            opacity: 0.12,
                        },
                        midColorStyle,
                    ]}
                />
                <Animated.View
                    style={[
                        {
                            width: size,
                            height: size,
                            borderRadius: half,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 40,
                            elevation: 25,
                        },
                        coreColorStyle,
                    ]}
                >
                    <View
                        style={{
                            position: "absolute",
                            top: size * 0.15,
                            left: size * 0.2,
                            width: size * 0.3,
                            height: size * 0.2,
                            borderRadius: size * 0.1,
                            backgroundColor: glowColor,
                            opacity: 0.6,
                        }}
                    />
                </Animated.View>
            </Animated.View>
        </View>
    );
}
