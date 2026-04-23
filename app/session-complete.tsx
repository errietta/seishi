import React, { useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Screen from '../components/ui/Screen'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spacer from '../components/ui/Spacer'
import ConcentrationSlider from '../components/ConcentrationSlider'
import { useSessionStore } from '../lib/store/sessionStore'
import { useStreakStore } from '../lib/store/streakStore'
import { calculateScore } from '../lib/scoring/scoreCalculator'
import { getRandomMessage } from '../lib/i18n'
import { colors, spacing, typography } from '../lib/theme'

export default function SessionComplete() {
  const { t } = useTranslation()
  const session = useSessionStore()
  const streak = useStreakStore()

  const [concentration, setConcentration] = useState(5)
  const savedRef = useRef(false)

  const devMode = useStreakStore((s) => s.devMode)

  const score = calculateScore(session.pickups, streak.currentStreak)
  const message = useRef(getRandomMessage(streak.tone, 'complete')).current
  const challengeMinutes = useRef(Math.floor(Math.random() * 10) + 1).current
  const challengeMessage = useRef(getRandomMessage(streak.tone, 'challenge')).current

  const scoreScale = useSharedValue(0)
  useEffect(() => {
    scoreScale.value = withSpring(1, { damping: 10, stiffness: 80 })
  }, [])

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }))

  async function save() {
    if (!savedRef.current && session.mode) {
      savedRef.current = true
      await streak.recordSession({
        score,
        concentration,
        mode: session.mode,
        duration: session.duration,
        pickups: session.pickups,
      })
    }
  }

  async function handleContinue() {
    await save()
    session.reset()
    router.replace('/')
  }

  async function handleAcceptChallenge() {
    await save()
    session.startSession('spicy', devMode ? 5 : challengeMinutes * 60, null, 'none', false, true)
    router.replace('/session')
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[typography.title, { color: colors.text }]}>{t('complete.title')}</Text>
        <Spacer size={spacing.xl} />

        <Animated.View style={[styles.scoreBlock, scoreStyle]}>
          <Text style={[typography.caption]}>{t('complete.score')}</Text>
          <Text style={[typography.hero, { color: colors.accent }]}>
            {Math.round(score)}
          </Text>
        </Animated.View>

        <Spacer size={spacing.lg} />
        <Text style={[typography.body, { color: colors.muted, textAlign: 'center', fontStyle: 'italic' }]}>
          {message}
        </Text>

        {session.pickups > 0 && (
          <>
            <Spacer size={spacing.sm} />
            <Text style={[typography.caption, { color: colors.danger }]}>
              {session.pickups} {t('complete.pickups')}
            </Text>
          </>
        )}

        <Spacer size={spacing.xl} />
        <Text style={[typography.caption]}>{t('complete.concentration')}</Text>
        <Text style={[typography.caption, { marginTop: spacing.xs }]}>
          {t('complete.concentrationHint')}
        </Text>
        <Spacer size={spacing.md} />
        <ConcentrationSlider value={concentration} onChange={setConcentration} />

        <Spacer size={spacing.xl} />

        {!session.isChallenge ? (
          <Card style={styles.challengeCard}>
            <Text style={[typography.caption, { color: colors.accent, letterSpacing: 3 }]}>
              {t('challenge.title')}
            </Text>
            <Spacer size={spacing.sm} />
            <Text style={[typography.body, { color: colors.text, textAlign: 'center' }]}>
              {t('challenge.description', { minutes: challengeMinutes })}
            </Text>
            <Spacer size={spacing.sm} />
            <Text style={[typography.caption, { color: colors.muted, fontStyle: 'italic', textAlign: 'center' }]}>
              {challengeMessage}
            </Text>
            <Spacer size={spacing.lg} />
            <View style={styles.challengeButtons}>
              <Button
                label={t('challenge.decline')}
                onPress={handleContinue}
                variant="ghost"
                style={styles.challengeBtn}
              />
              <Button
                label={t('challenge.accept')}
                onPress={handleAcceptChallenge}
                style={styles.challengeBtn}
              />
            </View>
          </Card>
        ) : (
          <Button label={t('complete.continue')} onPress={handleContinue} />
        )}

        <Spacer size={spacing.xl} />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  scoreBlock: {
    alignItems: 'center',
  },
  challengeCard: {
    width: '100%',
    alignItems: 'center',
  },
  challengeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  challengeBtn: {
    flex: 1,
  },
})
