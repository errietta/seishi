import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Brightness from "expo-brightness";
import * as KeepAwake from "expo-keep-awake";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

import PresenceOrb from "../components/PresenceOrb";
import ScoldOverlay from "../components/ScoldOverlay";
import HintModal, { HintTip } from "../components/HintModal";
import {
    useSessionStore,
    PUNISHMENT_SECONDS,
    PUNISHMENT_SECONDS_LONG,
} from "../lib/store/sessionStore";
import { useStreakStore } from "../lib/store/streakStore";
import { useShopStore } from "../lib/store/shopStore";
import { CATALOG } from "../lib/shop/catalog";
import {
    createPickupDetector,
    type PickupCause,
} from "../lib/sensors/pickupDetector";
import { playAmbient, stopAmbient } from "../lib/audio/ambientPlayer";
import { getRandomMessage } from "../lib/i18n";
import { colors, spacing, typography } from "../lib/theme";
import type { SoundKey } from "../lib/audio/ambientPlayer";

const KEEP_AWAKE_TAG = "session";
const GRACE_SECONDS = 10;
const BRIGHTNESS_DIM_VALUE = 0.05;

export default function Session() {
    const { t } = useTranslation();
    const session = useSessionStore();
    const tone = useStreakStore((s) => s.tone);
    const showSessionTips = useStreakStore((s) => s.showSessionTips);
    const setShowSessionTips = useStreakStore((s) => s.setShowSessionTips);
    const activeOrbTheme = useShopStore((s) => s.activeOrbTheme);
    const activeOrbItem = activeOrbTheme
        ? CATALOG.find((c) => c.id === activeOrbTheme)
        : null;

    const [graceRemaining, setGraceRemaining] = useState(GRACE_SECONDS);
    const [graceMessage] = useState(() => getRandomMessage(tone, "grace"));
    const [scoldVisible, setScoldVisible] = useState(false);
    const [scoldMessage, setScoldMessage] = useState("");
    const [penaltyLabel, setPenaltyLabel] = useState<string | undefined>();
    const [joltTrigger, setJoltTrigger] = useState(0);

    const originalBrightness = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const detector = useRef(createPickupDetector());
    const endingRef = useRef(false);

    // ── end session ────────────────────────────────────────────────

    const endSession = useCallback(async () => {
        if (endingRef.current) return;
        endingRef.current = true;

        if (timerRef.current) clearInterval(timerRef.current);
        detector.current.stop();
        await stopAmbient();

        if (session.gongOnComplete) {
            const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
                (e) => {
                    console.error("Haptics error:", e);
                },
            );
            await delay(120);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
                (e) => {
                    console.error("Haptics error:", e);
                },
            );
            await delay(80);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
                (e) => {
                    console.error("Haptics error:", e);
                },
            );
        }

        KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG);

        if (originalBrightness.current !== null) {
            await Brightness.setBrightnessAsync(
                originalBrightness.current,
            ).catch(() => {});
        }

        session.endSession();
        router.replace("/session-complete");
    }, []);

    // ── scold on pickup ────────────────────────────────────────────

    const showScold = useCallback(
        (cause: PickupCause) => {
            session.pauseSession();
            session.registerPickup();
            setJoltTrigger((n) => n + 1);

            const isDeliberate = cause === "app-switch";

            Haptics.notificationAsync(
                isDeliberate
                    ? Haptics.NotificationFeedbackType.Error
                    : Haptics.NotificationFeedbackType.Warning,
            ).catch(() => {});

            if (originalBrightness.current !== null) {
                Brightness.setBrightnessAsync(originalBrightness.current).catch(
                    () => {},
                );
            }

            const messageKey = isDeliberate ? "appSwitch" : "pickup";
            setScoldMessage(getRandomMessage(tone, messageKey));

            let label: string | undefined;

            if (isDeliberate) {
                let punishment = session.punishmentMode;

                if (punishment === "random") {
                    const options = [
                        "add-time",
                        "add-time-long",
                        "reset",
                    ] as const;
                    punishment =
                        options[Math.floor(Math.random() * options.length)];
                }

                if (punishment === "add-time") {
                    session.addTime(PUNISHMENT_SECONDS);
                    label =
                        session.mode === "spicy"
                            ? t("scold.penaltyAddTimeSilent")
                            : t("scold.penaltyAddTime");
                } else if (punishment === "add-time-long") {
                    session.addTime(PUNISHMENT_SECONDS_LONG);
                    label = t("scold.penaltyAddTimeLong");
                } else if (punishment === "reset") {
                    session.resetTimer();
                    label = t("scold.penaltyReset");
                }
            }

            setPenaltyLabel(label);
            setScoldVisible(true);
        },
        [tone, session.punishmentMode, session.mode],
    );

    // ── resume after scold ─────────────────────────────────────────

    function handleResume() {
        setScoldVisible(false);
        Brightness.setBrightnessAsync(BRIGHTNESS_DIM_VALUE).catch(() => {});
        session.resumeSession();
    }

    // ── setup & grace period ───────────────────────────────────────

    useEffect(() => {
        let active = true;

        async function setup() {
            await KeepAwake.activateKeepAwakeAsync(KEEP_AWAKE_TAG);
            try {
                const current = await Brightness.getBrightnessAsync();
                if (active) originalBrightness.current = current;
            } catch {}
            if (session.sound) {
                playAmbient(session.sound as SoundKey).catch(() => {});
            }
        }

        setup();

        const graceInterval = setInterval(() => {
            setGraceRemaining((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    clearInterval(graceInterval);
                    Brightness.setBrightnessAsync(BRIGHTNESS_DIM_VALUE).catch(
                        () => {},
                    );
                    detector.current.start(showScold);
                    timerRef.current = setInterval(() => {
                        if (useSessionStore.getState().isRunning) {
                            session.tickElapsed();
                        }
                    }, 1000);
                }
                return next;
            });
        }, 1000);

        return () => {
            active = false;
            clearInterval(graceInterval);
            if (timerRef.current) clearInterval(timerRef.current);
            detector.current.stop();
            stopAmbient();
            KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG);
            Brightness.restoreSystemBrightnessAsync().catch(() => {});
        };
    }, []);

    // ── watch for completion ───────────────────────────────────────

    useEffect(() => {
        if (
            session.elapsed >= session.duration &&
            session.duration > 0 &&
            !endingRef.current
        ) {
            endSession();
        }
    }, [session.elapsed]);

    // ── derived display values ─────────────────────────────────────

    const remaining = Math.max(0, session.duration - session.elapsed);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

    const phaseKey =
        `session.phase${session.phase.charAt(0).toUpperCase() + session.phase.slice(1)}` as const;

    const inGrace = graceRemaining > 0;

    // ── render ─────────────────────────────────────────────────────

    return (
        <View style={styles.fullscreen}>
            <View style={styles.center}>
                <PresenceOrb
                    phase={inGrace ? "idle" : session.phase}
                    joltTrigger={joltTrigger}
                    size={180}
                    angry={scoldVisible}
                    orbCoreColor={activeOrbItem?.orbColors?.core}
                    orbGlowColor={activeOrbItem?.orbColors?.glow}
                />

                {inGrace ? (
                    <>
                        <Text style={styles.graceInstruction}>
                            {t("session.graceInstruction")}
                        </Text>
                        <Text style={[typography.mono, styles.graceCount]}>
                            {graceRemaining}
                        </Text>
                        <Text style={styles.subText}>{graceMessage}</Text>
                    </>
                ) : (
                    <>
                        {session.mode === "simple" && (
                            <Text style={[typography.mono, styles.timer]}>
                                {timeStr}
                            </Text>
                        )}
                        {session.mode !== "simple" && (
                            <Text
                                style={[
                                    styles.subText,
                                    { marginTop: spacing.xl },
                                ]}
                            >
                                {t(phaseKey)}
                            </Text>
                        )}
                    </>
                )}
            </View>

            <ScoldOverlay
                visible={scoldVisible}
                message={scoldMessage}
                penaltyLabel={penaltyLabel}
                onResume={handleResume}
            />

            <HintModal
                visible={showSessionTips}
                title={t("hints.tipsTitle")}
                buttonLabel={t("hints.tipsDismiss")}
                onDismiss={(showAgain) => setShowSessionTips(showAgain)}
            >
                <HintTip>{t("hints.tips1")}</HintTip>
                <HintTip>{t("hints.tips2")}</HintTip>
                <HintTip>{t("hints.tips3")}</HintTip>
                <HintTip>{t("hints.tips4")}</HintTip>
            </HintModal>
        </View>
    );
}

// ── styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    graceInstruction: {
        fontSize: 18,
        letterSpacing: 3,
        color: colors.text,
        opacity: 0.75,
        textAlign: "center",
        marginBottom: spacing.sm,
    },

    graceCount: {
        color: colors.text,
        marginTop: spacing.xl,
        opacity: 0.4,
    },

    timer: {
        color: colors.text,
        marginTop: spacing.xl,
        opacity: 0.45,
    },

    subText: {
        fontSize: 12,
        letterSpacing: 2,
        color: colors.text,
        opacity: 0.45,
        marginTop: spacing.sm,
        textAlign: "center",
    },
});
