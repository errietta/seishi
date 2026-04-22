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
}

export default function ScoldOverlay({ visible, message, onResume }: Props) {
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
        <Text style={[typography.title, { color: colors.danger, textAlign: 'center', lineHeight: 36 }]}>
          {message}
        </Text>
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
    backgroundColor: 'rgba(0,0,0,0.75)',
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
})
