import React from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Screen from '../components/ui/Screen'
import Card from '../components/ui/Card'
import Spacer from '../components/ui/Spacer'
import StreakDisplay from '../components/StreakDisplay'
import { useStreakStore, type SessionRecord } from '../lib/store/streakStore'
import { colors, spacing, typography } from '../lib/theme'

export default function Stats() {
  const { t } = useTranslation()
  const streak = useStreakStore((s) => s.currentStreak)
  const history = useStreakStore((s) => s.history)

  const avgConc =
    history.length > 0
      ? history.reduce((a, b) => a + b.concentration, 0) / history.length
      : 0

  function renderItem({ item }: { item: SessionRecord }) {
    const date = new Date(item.date)
    return (
      <Card style={styles.item}>
        <View style={styles.itemRow}>
          <Text style={[typography.body, { color: colors.text }]}>
            {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </Text>
          <Text style={[typography.body, { color: colors.accent, fontWeight: '300' }]}>
            {Math.round(item.score)}
          </Text>
        </View>
        <Text style={[typography.caption]}>
          {item.mode.toUpperCase()} · {Math.round(item.duration / 60)}m ·{' '}
          focus {item.concentration}/10 · {item.pickups} pickups
        </Text>
      </Card>
    )
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <FlatList
        data={history}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Text style={[typography.caption, { color: colors.muted }]}>← BACK</Text>
            </TouchableOpacity>

            <Text style={[typography.title, { color: colors.text }]}>{t('stats.title')}</Text>
            <Spacer size={spacing.lg} />

            <Card>
              {streak > 0 ? (
                <StreakDisplay streak={streak} />
              ) : (
                <Text style={[typography.body, { color: colors.muted }]}>No streak yet.</Text>
              )}
              <Spacer size={spacing.sm} />
              <Text style={[typography.caption]}>
                {t('stats.avgConcentration')}: {avgConc.toFixed(1)}/10
              </Text>
            </Card>

            <Spacer size={spacing.lg} />
            <Text style={[typography.caption]}>{t('stats.history')}</Text>
            <Spacer size={spacing.sm} />

            {history.length === 0 && (
              <Text style={[typography.body, { color: colors.muted }]}>{t('stats.empty')}</Text>
            )}
          </View>
        }
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.xl,
  },
  back: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  item: {
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
})
