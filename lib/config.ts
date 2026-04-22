// True only when EXPO_PUBLIC_DEV_MODE=true is set in the environment.
// Controls whether the Dev Mode toggle is visible in Settings.
export const DEV_MODE_AVAILABLE = process.env.EXPO_PUBLIC_DEV_MODE === 'true'
