import { Audio } from "expo-av";

export type SoundKey = "rain" | "whitenoise" | "singingbowl";

// Add MP3 files to assets/sounds/ and uncomment the corresponding entries to enable ambient audio.
const SOUND_MODULES: Partial<Record<SoundKey, ReturnType<typeof require>>> = {
    rain: require("../../assets/sounds/rain.mp3"),
    whitenoise: require("../../assets/sounds/whitenoise.mp3"),
    singingbowl: require("../../assets/sounds/singingbowl.mp3"),
};

// Add gong.mp3 to assets/sounds/ and uncomment to enable the completion gong.
const GONG_MODULE: ReturnType<typeof require> | null = null;
// const GONG_MODULE = require('../../assets/sounds/gong.mp3')

let currentSound: Audio.Sound | null = null;

export async function playAmbient(key: SoundKey): Promise<void> {
    const module = SOUND_MODULES[key];
    if (!module) return;

    await stopAmbient();
    await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
    });
    const { sound } = await Audio.Sound.createAsync(module, {
        isLooping: true,
        volume: 0.6,
    });
    currentSound = sound;
    await sound.playAsync();
}

export async function stopAmbient(): Promise<void> {
    if (currentSound) {
        await currentSound.stopAsync().catch(() => {});
        await currentSound.unloadAsync().catch(() => {});
        currentSound = null;
    }
}

export async function playGong(): Promise<void> {
    if (!GONG_MODULE) return;
    try {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
        });
        const { sound } = await Audio.Sound.createAsync(GONG_MODULE, {
            isLooping: false,
            volume: 1.0,
        });
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                sound.unloadAsync().catch(() => {});
            }
        });
    } catch {}
}
