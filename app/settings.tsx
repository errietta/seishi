import React from 'react'
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Screen from '../components/ui/Screen'
import Card from '../components/ui/Card'
import Spacer from '../components/ui/Spacer'
import { useStreakStore } from '../lib/store/streakStore'
import { DEV_MODE_AVAILABLE } from '../lib/config'
import { colors, spacing, typography } from '../lib/theme'

export default function Settings() {
  const { t } = useTranslation()
  const tone = useStreakStore((s) => s.tone)
  const setTone = useStreakStore((s) => s.setTone)
  const devMode = useStreakStore((s) => s.devMode)
  const setDevMode = useStreakStore((s) => s.setDevMode)

  return (
    <Screen>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={[typography.caption, { color: colors.muted }]}>← BACK</Text>
        </TouchableOpacity>

        <Text style={[typography.title, { color: colors.text }]}>{t('settings.title')}</Text>
        <Spacer size={spacing.xl} />

        <Card>
          <Text style={[typography.caption]}>{t('settings.tone')}</Text>
          <Spacer size={spacing.md} />
          <View style={styles.row}>
            <Text
              style={[typography.body, { color: tone === 'encouraging' ? colors.accent : colors.muted }]}
            >
              {t('settings.toneEncouraging')}
            </Text>
            <Switch
              value={tone === 'strict'}
              onValueChange={(v) => setTone(v ? 'strict' : 'encouraging')}
              trackColor={{ false: colors.muted, true: colors.accent }}
              thumbColor={colors.text}
            />
            <Text
              style={[typography.body, { color: tone === 'strict' ? colors.accent : colors.muted }]}
            >
              {t('settings.toneStrict')}
            </Text>
          </View>
          <Spacer size={spacing.sm} />
          <Text style={[typography.caption]}>
            {tone === 'strict' ? '"Acceptable. Do not celebrate."' : '"Beautiful. You showed up."'}
          </Text>
        </Card>

        {DEV_MODE_AVAILABLE && (
          <>
            <Spacer size={spacing.md} />
            <Card style={styles.devCard}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.caption, { color: colors.danger, letterSpacing: 3 }]}>
                    DEV MODE
                  </Text>
                  <Spacer size={spacing.xs} />
                  <Text style={[typography.caption, { color: colors.muted }]}>
                    {devMode ? 'Sessions are 5 seconds.' : 'Normal session durations.'}
                  </Text>
                </View>
                <Switch
                  value={devMode}
                  onValueChange={setDevMode}
                  trackColor={{ false: colors.muted, true: colors.danger }}
                  thumbColor={colors.text}
                />
              </View>
            </Card>
          </>
        )}
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
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  devCard: {
    borderWidth: 1,
    borderColor: colors.danger + '44',
  },
})
