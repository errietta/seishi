import { AppState, AppStateStatus } from 'react-native'
import { Accelerometer } from 'expo-sensors'

const MOVEMENT_THRESHOLD = 1.5
const UPDATE_INTERVAL_MS = 300
const COOLDOWN_MS = 3000

interface PickupDetector {
  start: (onPickup: () => void) => void
  stop: () => void
}

export function createPickupDetector(): PickupDetector {
  let accelSub: ReturnType<typeof Accelerometer.addListener> | null = null
  let appStateSub: ReturnType<typeof AppState.addEventListener> | null = null
  let lastValues = { x: 0, y: 0, z: 0 }
  let onPickupCb: (() => void) | null = null
  let cooldown = false

  function fire() {
    if (cooldown || !onPickupCb) return
    cooldown = true
    onPickupCb()
    setTimeout(() => { cooldown = false }, COOLDOWN_MS)
  }

  return {
    start(onPickup) {
      onPickupCb = onPickup
      cooldown = false

      Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS)
      accelSub = Accelerometer.addListener((data) => {
        const delta =
          Math.abs(data.x - lastValues.x) +
          Math.abs(data.y - lastValues.y) +
          Math.abs(data.z - lastValues.z)
        lastValues = data
        if (delta > MOVEMENT_THRESHOLD) fire()
      })

      appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
        if (state === 'background') fire()
      })
    },

    stop() {
      accelSub?.remove()
      appStateSub?.remove()
      accelSub = null
      appStateSub = null
      onPickupCb = null
    },
  }
}
