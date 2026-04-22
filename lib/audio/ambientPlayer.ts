import { Audio } from 'expo-av'

export type SoundKey = 'rain' | 'whitenoise' | 'binaural'

// Add MP3 files to assets/sounds/ and uncomment the corresponding entries to enable ambient audio.
const SOUND_MODULES: Partial<Record<SoundKey, ReturnType<typeof require>>> = {
  // rain: require('../../assets/sounds/rain.mp3'),
  // whitenoise: require('../../assets/sounds/whitenoise.mp3'),
  // binaural: require('../../assets/sounds/binaural.mp3'),
}

let currentSound: Audio.Sound | null = null

export async function playAmbient(key: SoundKey): Promise<void> {
  const module = SOUND_MODULES[key]
  if (!module) return

  await stopAmbient()
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true })
  const { sound } = await Audio.Sound.createAsync(module, { isLooping: true, volume: 0.6 })
  currentSound = sound
  await sound.playAsync()
}

export async function stopAmbient(): Promise<void> {
  if (currentSound) {
    await currentSound.stopAsync().catch(() => {})
    await currentSound.unloadAsync().catch(() => {})
    currentSound = null
  }
}
