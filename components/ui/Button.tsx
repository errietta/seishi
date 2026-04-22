import React from 'react'
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native'
import { colors, radius, spacing } from '../../lib/theme'

type Variant = 'primary' | 'ghost' | 'danger'

interface Props {
  label: string
  onPress: () => void
  variant?: Variant
  style?: ViewStyle
  disabled?: boolean
}

export default function Button({ label, onPress, variant = 'primary', style, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, variant !== 'primary' && styles.altLabel]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.muted,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.3 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 3,
    color: colors.bg,
  },
  altLabel: {
    color: colors.text,
  },
})
