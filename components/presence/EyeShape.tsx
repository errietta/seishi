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

export default function EyeShape({
    phase,
    joltTrigger,
    size,
    angry,
    coreColor,
    glowColor,
}: PresenceShapeProps) {
    const eyeW = size * 1.4;
    const eyeH = size * 0.55;
    const irisSize = size * 0.44;
    const pupilSize = size * 0.18;
    const glowSize = size * 2.4;

    const eyelidH = useSharedValue(0);
    const irisScale = useSharedValue(1);
    const driftX = useSharedValue(0);
    const driftY = useSharedValue(0);
    const angryProgress = useSharedValue(0);

    const angryRef = useRef(angry);
    const phaseRef = useRef(phase);
    angryRef.current = angry;
    phaseRef.current = phase;

    // Blink scheduler — independent of phase/angry so it reacts to ref changes live
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        function blink() {
            const isAngry = angryRef.current;
            const currentPhase = phaseRef.current;
            eyelidH.value = withSequence(
                withTiming(eyeH, { duration: isAngry ? 55 : 100, easing: Easing.in(Easing.quad) }),
                withTiming(0, { duration: isAngry ? 70 : 160, easing: Easing.out(Easing.quad) }),
            );
            const interval = isAngry
                ? 280 + Math.random() * 280
                : currentPhase === "active"
                  ? 6000 + Math.random() * 4000
                  : currentPhase === "winding"
                    ? 2500 + Math.random() * 2000
                    : 3500 + Math.random() * 3000;
            timeoutId = setTimeout(blink, interval);
        }

        timeoutId = setTimeout(blink, 1200 + Math.random() * 1500);
        return () => clearTimeout(timeoutId);
    }, []);

    // Iris breathing
    useEffect(() => {
        if (angry) {
            irisScale.value = withTiming(1, { duration: 300 });
            return;
        }
        const halfCycle = phase === "idle" ? 5000 : phase === "winding" ? 3500 : 2800;
        irisScale.value = withRepeat(
            withTiming(1.07, { duration: halfCycle, easing: Easing.inOut(Easing.sin) }),
            -1,
            true,
        );
    }, [angry, phase]);

    // Angry color + snap to centre
    useEffect(() => {
        angryProgress.value = withTiming(angry ? 1 : 0, { duration: 500 });
        if (angry) {
            driftX.value = withSpring(0, { damping: 12, stiffness: 80 });
            driftY.value = withSpring(0, { damping: 12, stiffness: 80 });
        }
    }, [angry]);

    // Slow drift
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        function drift() {
            if (angryRef.current) {
                timeoutId = setTimeout(drift, 500);
                return;
            }
            driftX.value = withSpring((Math.random() - 0.5) * 60, { damping: 20, stiffness: 8 });
            driftY.value = withSpring((Math.random() - 0.5) * 40, { damping: 20, stiffness: 8 });
            timeoutId = setTimeout(drift, 3000 + Math.random() * 3000);
        }
        drift();
        return () => clearTimeout(timeoutId);
    }, []);

    // Jolt
    useEffect(() => {
        if (joltTrigger === 0) return;
        irisScale.value = withSequence(
            withSpring(1.6, { damping: 5, stiffness: 200 }),
            withSpring(1.0, { damping: 12, stiffness: 100 }),
        );
    }, [joltTrigger]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: driftX.value }, { translateY: driftY.value }],
    }));

    const irisStyle = useAnimatedStyle(() => ({
        transform: [{ scale: irisScale.value }],
        backgroundColor: interpolateColor(
            angryProgress.value,
            [0, 1],
            [coreColor, colors.danger],
        ),
    }));

    const glowColorStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            angryProgress.value,
            [0, 1],
            [glowColor, colors.danger],
        ),
        opacity: 0.18,
    }));

    const eyelidStyle = useAnimatedStyle(() => ({ height: eyelidH.value }));

    return (
        <View
            style={{
                width: eyeW,
                height: eyeH,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Outer glow */}
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        width: glowSize,
                        height: glowSize,
                        borderRadius: glowSize / 2,
                    },
                    glowColorStyle,
                ]}
            />

            <Animated.View style={containerStyle}>
                {/* Eye container — overflow:hidden clips the eyelid to the almond shape */}
                <View
                    style={{
                        width: eyeW,
                        height: eyeH,
                        borderRadius: eyeH / 2,
                        overflow: "hidden",
                        backgroundColor: "#f0f0f8",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* Iris */}
                    <Animated.View
                        style={[
                            {
                                width: irisSize,
                                height: irisSize,
                                borderRadius: irisSize / 2,
                                alignItems: "center",
                                justifyContent: "center",
                            },
                            irisStyle,
                        ]}
                    >
                        {/* Pupil */}
                        <View
                            style={{
                                width: pupilSize,
                                height: pupilSize,
                                borderRadius: pupilSize / 2,
                                backgroundColor: "#080810",
                            }}
                        />
                        {/* Highlight */}
                        <View
                            style={{
                                position: "absolute",
                                width: pupilSize * 0.45,
                                height: pupilSize * 0.45,
                                borderRadius: 999,
                                backgroundColor: "rgba(255,255,255,0.75)",
                                top: irisSize * 0.14,
                                left: irisSize * 0.18,
                            }}
                        />
                    </Animated.View>

                    {/* Eyelid — descends from top, clipped by container's borderRadius */}
                    <Animated.View
                        style={[
                            {
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: colors.bg,
                            },
                            eyelidStyle,
                        ]}
                    />
                </View>
            </Animated.View>
        </View>
    );
}
