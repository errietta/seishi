import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import Button from './ui/Button'
import { colors, radius, spacing, typography } from '../lib/theme'
import { useTranslation } from 'react-i18next'

interface Props {
  visible: boolean
  message: string
  onResume: () => void
  penaltyLabel?: string
}

export default function ScoldOverlay({ visible, message, onResume, penaltyLabel }: Props) {
  const { t } = useTranslation()
  const translateY = useSharedValue(500)
  const backdropOpacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 250 })
      translateY.value = withSpring(0, { damping: 22, stiffness: 120 })
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 })
      translateY.value = withSpring(500, { damping: 22, stiffness: 120 })
    }
  }, [visible])

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }))
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.container]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <Text style={[typography.title, styles.message]}>{message}</Text>

        {penaltyLabel && (
          <View style={styles.penaltyBadge}>
            <Text style={styles.penaltyText}>{penaltyLabel}</Text>
          </View>
        )}

        <View style={{ height: spacing.xl }} />
        <Button label={t('scold.resume')} onPress={onResume} variant="ghost" />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  message: {
    color: colors.danger,
    textAlign: 'center',
    lineHeight: 36,
  },
  penaltyBadge: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.sm,
  },
  penaltyText: {
    fontSize: 18,
    fontWeight: '200',
    letterSpacing: 6,
    color: colors.danger,
  },
})
