import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Screen from '../components/ui/Screen'
import Card from '../components/ui/Card'
import Spacer from '../components/ui/Spacer'
import { useSessionStore, type Mode } from '../lib/store/sessionStore'
import { colors, spacing, typography } from '../lib/theme'

const MODES: { key: Mode; badge?: string }[] = [
  { key: 'simple' },
  { key: 'raw' },
  { key: 'spicy', badge: '🌶' },
]

export default function ModeSelect() {
  const { t } = useTranslation()
  const reset = useSessionStore((s) => s.reset)

  function selectMode(mode: Mode) {
    reset()
    router.push({ pathname: '/session-config', params: { mode } })
  }

  return (
    <Screen>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={[typography.caption, { color: colors.muted }]}>← BACK</Text>
        </TouchableOpacity>

        <Text style={[typography.title, { color: colors.text }]}>{t('modes.title')}</Text>
        <Spacer size={spacing.xl} />

        {MODES.map(({ key, badge }) => (
          <TouchableOpacity key={key} onPress={() => selectMode(key)} activeOpacity={0.75}>
            <Card style={styles.card}>
              <Text style={[typography.title, { color: colors.accent }]}>
                {t(`modes.${key}.name`)}
                {badge ? ` ${badge}` : ''}
              </Text>
              <Spacer size={spacing.sm} />
              <Text style={[typography.body, { color: colors.muted }]}>
                {t(`modes.${key}.description`)}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  back: {
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
})
