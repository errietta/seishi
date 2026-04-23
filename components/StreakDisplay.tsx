import React from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, spacing } from '../lib/theme'

export default function StreakDisplay({ streak }: { streak: number }) {
  const { t } = useTranslation()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Text style={{ fontSize: 24 }}>🔥</Text>
      <Text style={{ fontSize: 32, fontWeight: '200', color: colors.text, letterSpacing: 2 }}>
        {streak}
      </Text>
      <Text style={{ fontSize: 12, letterSpacing: 2, color: colors.muted, alignSelf: 'flex-end', marginBottom: 4 }}>
        {t('home.streakLabel').toUpperCase()}
      </Text>
    </View>
  )
}
