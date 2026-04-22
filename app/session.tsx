import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import * as Brightness from 'expo-brightness'
import * as KeepAwake from 'expo-keep-awake'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import PresenceOrb from '../components/PresenceOrb'
import ScoldOverlay from '../components/ScoldOverlay'
import { useSessionStore, PUNISHMENT_SECONDS } from '../lib/store/sessionStore'
import { useStreakStore } from '../lib/store/streakStore'
import { createPickupDetector, type PickupCause } from '../lib/sensors/pickupDetector'
import { playAmbient, stopAmbient, playGong } from '../lib/audio/ambientPlayer'
import { getRandomMessage } from '../lib/i18n'
import { colors, spacing, typography } from '../lib/theme'
import type { SoundKey } from '../lib/audio/ambientPlayer'

const KEEP_AWAKE_TAG = 'session'
const GRACE_SECONDS = 10

export default function Session() {
  const { t } = useTranslation()
  const session = useSessionStore()
  const tone = useStreakStore((s) => s.tone)

  const [graceRemaining, setGraceRemaining] = useState(GRACE_SECONDS)
  const [graceMessage] = useState(() => getRandomMessage(tone, 'grace'))
  const [scoldVisible, setScoldVisible] = useState(false)
  const [scoldMessage, setScoldMessage] = useState('')
  const [penaltyLabel, setPenaltyLabel] = useState<string | undefined>()
  const [joltTrigger, setJoltTrigger] = useState(0)

  const originalBrightness = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const detector = useRef(createPickupDetector())
  const endingRef = useRef(false)

  const endSession = useCallback(async () => {
    if (endingRef.current) return
    endingRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    detector.current.stop()
    await stopAmbient()
    if (session.gongOnComplete) await playGong()
    KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG)
    if (originalBrightness.current !== null) {
      await Brightness.setBrightnessAsync(originalBrightness.current).catch(() => {})
    }
    session.endSession()
    router.replace('/session-complete')
  }, [])

  const showScold = useCallback(
    (cause: PickupCause) => {
      session.pauseSession()
      session.registerPickup()
      setJoltTrigger((n) => n + 1)

      const isDeliberate = cause === 'app-switch'
      Haptics.notificationAsync(
        isDeliberate
          ? Haptics.NotificationFeedbackType.Error
          : Haptics.NotificationFeedbackType.Warning,
      ).catch(() => {})

      if (originalBrightness.current !== null) {
        Brightness.setBrightnessAsync(originalBrightness.current).catch(() => {})
      }

      const messageKey = isDeliberate ? 'appSwitch' : 'pickup'
      setScoldMessage(getRandomMessage(tone, messageKey))

      let label: string | undefined
      if (isDeliberate) {
        const punishment = session.punishmentMode
        if (punishment === 'add-time') {
          session.addTime(PUNISHMENT_SECONDS)
          label =
            session.mode === 'spicy'
              ? t('scold.penaltyAddTimeSilent')
              : t('scold.penaltyAddTime')
        } else if (punishment === 'reset') {
          session.resetTimer()
          label = t('scold.penaltyReset')
        }
      }
      setPenaltyLabel(label)
      setScoldVisible(true)
    },
    [tone, session.punishmentMode, session.mode],
  )

  function handleResume() {
    setScoldVisible(false)
    Brightness.setBrightnessAsync(0.01).catch(() => {})
    session.resumeSession()
  }

  useEffect(() => {
    let active = true

    async function setup() {
      await KeepAwake.activateKeepAwakeAsync(KEEP_AWAKE_TAG)
      try {
        const current = await Brightness.getBrightnessAsync()
        if (active) originalBrightness.current = current
        await Brightness.setBrightnessAsync(0.01)
      } catch {}
      if (session.sound) {
        playAmbient(session.sound as SoundKey).catch(() => {})
      }
    }

    setup()

    // Grace period — counts down before pickup detection starts
    const graceInterval = setInterval(() => {
      setGraceRemaining((prev) => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(graceInterval)
          // Now start the real session
          detector.current.start(showScold)
          timerRef.current = setInterval(() => {
            session.tickElapsed()
          }, 1000)
        }
        return next
      })
    }, 1000)

    return () => {
      active = false
      clearInterval(graceInterval)
      if (timerRef.current) clearInterval(timerRef.current)
      detector.current.stop()
      stopAmbient()
      KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG)
      Brightness.restoreSystemBrightnessAsync().catch(() => {})
    }
  }, [])

  // Watch for session completion
  useEffect(() => {
    if (session.elapsed >= session.duration && session.duration > 0 && !endingRef.current) {
      endSession()
    }
  }, [session.elapsed])

  const remaining = Math.max(0, session.duration - session.elapsed)
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`

  const phaseKey =
    `session.phase${session.phase.charAt(0).toUpperCase() + session.phase.slice(1)}` as const

  const inGrace = graceRemaining > 0

  return (
    <View style={styles.fullscreen}>
      <View style={styles.center}>
        <PresenceOrb
          phase={inGrace ? 'idle' : session.phase}
          joltTrigger={joltTrigger}
          size={180}
          angry={scoldVisible}
        />

        {inGrace ? (
          <>
            <Text style={[typography.mono, styles.graceCount]}>{graceRemaining}</Text>
            <Text style={styles.subText}>{graceMessage}</Text>
          </>
        ) : (
          <>
            {session.mode === 'simple' && (
              <Text style={[typography.mono, styles.timer]}>{timeStr}</Text>
            )}
            {session.mode !== 'simple' && (
              <Text style={[styles.subText, { marginTop: spacing.xl }]}>{t(phaseKey)}</Text>
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
    </View>
  )
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
})
