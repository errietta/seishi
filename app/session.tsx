import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import * as Brightness from 'expo-brightness'
import * as KeepAwake from 'expo-keep-awake'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import PresenceOrb from '../components/PresenceOrb'
import ScoldOverlay from '../components/ScoldOverlay'
import { useSessionStore } from '../lib/store/sessionStore'
import { useStreakStore } from '../lib/store/streakStore'
import { createPickupDetector } from '../lib/sensors/pickupDetector'
import { playAmbient, stopAmbient } from '../lib/audio/ambientPlayer'
import { getRandomMessage } from '../lib/i18n'
import { colors, spacing, typography } from '../lib/theme'
import type { SoundKey } from '../lib/audio/ambientPlayer'

const KEEP_AWAKE_TAG = 'session'

export default function Session() {
  const { t } = useTranslation()
  const session = useSessionStore()
  const tone = useStreakStore((s) => s.tone)

  const [scoldVisible, setScoldVisible] = useState(false)
  const [scoldMessage, setScoldMessage] = useState('')
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
    KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG)
    if (originalBrightness.current !== null) {
      await Brightness.setBrightnessAsync(originalBrightness.current).catch(() => {})
    }
    session.endSession()
    router.replace('/session-complete')
  }, [])

  const showScold = useCallback(() => {
    session.pauseSession()
    session.registerPickup()
    setJoltTrigger((n) => n + 1)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
    if (originalBrightness.current !== null) {
      Brightness.setBrightnessAsync(originalBrightness.current).catch(() => {})
    }
    setScoldMessage(getRandomMessage(tone, 'pickup'))
    setScoldVisible(true)
  }, [tone])

  function handleResume() {
    setScoldVisible(false)
    Brightness.setBrightnessAsync(0.05).catch(() => {})
    session.resumeSession()
  }

  useEffect(() => {
    let active = true

    async function setup() {
      KeepAwake.activateKeepAwake(KEEP_AWAKE_TAG)

      try {
        const current = await Brightness.getBrightnessAsync()
        if (active) originalBrightness.current = current
        await Brightness.setBrightnessAsync(0.05)
      } catch {}

      if (session.sound) {
        playAmbient(session.sound as SoundKey).catch(() => {})
      }

      detector.current.start(showScold)
    }

    setup()

    timerRef.current = setInterval(() => {
      session.tickElapsed()
    }, 1000)

    return () => {
      active = false
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

  const phaseKey = `session.phase${session.phase.charAt(0).toUpperCase() + session.phase.slice(1)}` as const

  return (
    <View style={styles.fullscreen}>
      <View style={styles.center}>
        <PresenceOrb phase={session.phase} joltTrigger={joltTrigger} size={180} />

        {session.mode === 'simple' && (
          <Text style={[typography.mono, styles.timer]}>{timeStr}</Text>
        )}

        {session.mode !== 'simple' && (
          <Text style={[typography.caption, { marginTop: spacing.xl }]}>
            {t(phaseKey)}
          </Text>
        )}
      </View>

      <ScoldOverlay visible={scoldVisible} message={scoldMessage} onResume={handleResume} />
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
  timer: {
    color: colors.muted,
    marginTop: spacing.xl,
  },
})
