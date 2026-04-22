import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated'
import { colors } from '../lib/theme'
import type { Phase } from '../lib/store/sessionStore'

interface Props {
  phase?: Phase
  joltTrigger?: number
  size?: number
}

export default function PresenceOrb({ phase = 'idle', joltTrigger = 0, size = 160 }: Props) {
  const scale = useSharedValue(1)
  const coreOpacity = useSharedValue(0.7)
  const glowOpacity = useSharedValue(0.3)
  const driftX = useSharedValue(0)
  const driftY = useSharedValue(0)

  // Breathing animation — changes speed based on phase
  useEffect(() => {
    const breathIn = phase === 'idle' ? 6000 : phase === 'winding' ? 5000 : 4000
    const hold = breathIn / 2
    const breathOut = breathIn

    scale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: breathIn, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.18, { duration: hold }),
        withTiming(1.0, { duration: breathOut, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    )

    coreOpacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: breathIn, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: hold }),
        withTiming(0.6, { duration: breathOut, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    )

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(phase === 'idle' ? 0.5 : 0.8, { duration: breathIn }),
        withTiming(0.2, { duration: breathOut }),
      ),
      -1,
      true,
    )
  }, [phase])

  // Slow drift — random walk with spring physics
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    function drift() {
      driftX.value = withSpring((Math.random() - 0.5) * 80, { damping: 20, stiffness: 8 })
      driftY.value = withSpring((Math.random() - 0.5) * 60, { damping: 20, stiffness: 8 })
      timeoutId = setTimeout(drift, 3000 + Math.random() * 3000)
    }
    drift()
    return () => clearTimeout(timeoutId)
  }, [])

  // Pickup jolt
  useEffect(() => {
    if (joltTrigger === 0) return
    scale.value = withSequence(
      withSpring(1.5, { damping: 5, stiffness: 200 }),
      withSpring(1.0, { damping: 12, stiffness: 100 }),
    )
  }, [joltTrigger])

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: driftX.value },
      { translateY: driftY.value },
      { scale: scale.value },
    ],
    opacity: coreOpacity.value,
  }))

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }))

  const half = size / 2
  const glowSize = size * 2.2

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, orbStyle]}>
        {/* Outer glow ring */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              backgroundColor: colors.orbGlow,
            },
            glowStyle,
          ]}
        />
        {/* Mid glow */}
        <View
          style={{
            position: 'absolute',
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: (size * 1.5) / 2,
            backgroundColor: colors.orbCore,
            opacity: 0.12,
          }}
        />
        {/* Core */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: half,
            backgroundColor: colors.orbCore,
            shadowColor: colors.orbGlow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 40,
            elevation: 25,
          }}
        >
          {/* Inner highlight */}
          <View
            style={{
              position: 'absolute',
              top: size * 0.15,
              left: size * 0.2,
              width: size * 0.3,
              height: size * 0.2,
              borderRadius: size * 0.1,
              backgroundColor: colors.orbGlow,
              opacity: 0.6,
            }}
          />
        </View>
      </Animated.View>
    </View>
  )
}
