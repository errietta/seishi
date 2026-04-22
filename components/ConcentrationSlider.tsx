import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, radius, spacing } from '../lib/theme'

interface Props {
  value: number
  onChange: (v: number) => void
}

export default function ConcentrationSlider({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onChange(n)}
          style={[styles.dot, n <= value && styles.dotActive]}
        >
          <Text style={[styles.label, n <= value && styles.labelActive]}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
  },
  labelActive: {
    color: colors.bg,
    fontWeight: '600',
  },
})
