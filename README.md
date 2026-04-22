# Seishi

A gamified meditation app for people who hate meditation. Challenge modes, streak tracking, a scolding sensei, and an animated presence orb that watches you breathe.

---

## Prerequisites

| Tool | Why you need it |
|---|---|
| [Node.js 18+](https://nodejs.org) | Runs the build tooling |
| [Expo CLI](https://docs.expo.dev/get-started/installation/) | Starts the dev server |
| Android Studio or a real device with USB debugging | To run on Android |
| ADB (Android Debug Bridge) | Bundled with Android Studio; used to talk to the device |

Install Expo CLI globally if you don't have it:

```bash
npm install -g expo-cli
```

---

## Install

```bash
git clone <your-repo-url>
cd seishi
npm install
```

That's it. No native build step required for a first run.

---

## Running on an ADB-connected phone

This is the recommended way — Expo Go (the QR-code app) won't grant the system-brightness permission that the dimming feature needs on Android.

### 1. Enable USB debugging on your phone

Settings → About phone → tap **Build number** 7 times → go back to Settings → Developer options → enable **USB debugging**.

### 2. Plug in and verify ADB sees the device

```bash
adb devices
```

You should see something like:

```
List of devices attached
R58M12345XY    device
```

If it shows `unauthorized`, unlock your phone and tap **Allow** on the popup.

### 3. Build and install a dev client

This compiles the app and sideloads it onto your device:

```bash
npx expo run:android
```

First run takes a few minutes (Gradle build). Subsequent runs are fast. The app will open automatically when the build finishes.

### 4. Start the dev server (for future runs)

Once the dev client is installed you can just use:

```bash
npx expo start --android
```

This pushes JS changes instantly without a full rebuild. Press `r` in the terminal to reload, `j` to open the debugger.

---

## Project structure

```
app/                    Screen files — Expo Router turns these into routes automatically
  _layout.tsx           Root wrapper: providers, streak store init
  index.tsx             Home screen: orb, streak display, BEGIN button
  mode-select.tsx       Pick Simple / Raw / Spicy
  session-config.tsx    Set duration, sound (Simple), min/max (Spicy), punishment mode
  session.tsx           The active session: orb, timer (Simple only), pickup detection
  session-complete.tsx  Score reveal, concentration self-rating, streak update
  stats.tsx             Streak + full session history
  settings.tsx          Strict / Encouraging tone toggle

components/
  PresenceOrb.tsx       The animated orb — Reanimated 4, spring drift, breathing pulse
  ScoldOverlay.tsx      Bottom sheet that slides up on phone pickup
  StreakDisplay.tsx      Fire emoji + streak count
  ConcentrationSlider.tsx  Row of 10 tappable dots (1–10 rating)
  ui/                   Reusable primitives: Screen, Card, Button, Spacer

lib/
  theme.ts              Single source of truth for colors, typography, spacing, radius
  i18n/
    en.json             Every string in the app including all sensei message pools
    index.ts            i18next init + getRandomMessage() helper
  store/
    sessionStore.ts     Zustand store: active session state (mode, timer, pickups, punishment)
    streakStore.ts      Zustand + AsyncStorage: streak, history, tone preference
  sensors/
    pickupDetector.ts   Accelerometer threshold + AppState listener, fires 'movement' or 'app-switch'
  audio/
    ambientPlayer.ts    expo-av wrapper (sounds disabled by default — see below)
  scoring/
    scoreCalculator.ts  Score formula: (100 − pickups×20) × streak multiplier

assets/
  sounds/               Drop rain.mp3 / whitenoise.mp3 / binaural.mp3 here to enable ambient audio
```

---

## How it works

### The session loop

1. User picks a mode and hits BEGIN
2. `sessionStore.startSession()` sets duration, mode, sound, and punishment mode
3. `session.tsx` activates keep-awake, dims brightness to ~5%, starts the accelerometer listener and AppState listener, then ticks the elapsed counter every second
4. When the countdown hits zero the session auto-ends and navigates to the score screen

### Pickup detection

Two independent triggers, both defined in `lib/sensors/pickupDetector.ts`:

- **Accelerometer** — fires `'movement'` when the sum of absolute delta across x/y/z exceeds the threshold (default `1.5`). Catches the phone being picked up off a surface.
- **AppState** — fires `'app-switch'` when the app goes to background (home button, notification shade, switching apps). Since keep-awake prevents the auto-lock from firing, any background event is a genuine deliberate escape.

`'app-switch'` triggers get the angrier message pool and can apply a punishment (see below).

### Punishment modes

Configured in session-config before starting. Only fires on `'app-switch'` (deliberate), never on physical movement.

| Mode | What happens |
|---|---|
| None | Just the scold, no time change |
| +2 min | `session.addTime(120)` — extends the session duration. In Spicy mode shows "TIME EXTENDED" since no timer is visible |
| Reset timer | `session.resetTimer()` — sets elapsed back to 0. Session restarts from the beginning |

### Scoring

```
finalScore = max(0, 100 − pickups × 20) × (1 + min(streak × 0.05, 1.0))
```

Max multiplier is 2× at a 20-day streak. Concentration rating (1–10) is recorded separately and never affects score — it's for self-reflection only.

### Streak

One session per calendar day = +1. Persisted in AsyncStorage. A 2-hour grace period applies: if your last session finished within 2 hours before midnight, the next day still counts as consecutive (configurable constant `GRACE_HOURS` in `streakStore.ts`).

### Sensei tone

Two message pools in `en.json` under `messages.strict` and `messages.encouraging`. Toggle in Settings, persisted in AsyncStorage. Affects all scold, completion, streak broken, and streak milestone messages.

---

## Adding ambient sounds

1. Drop MP3 files into `assets/sounds/`:
   - `rain.mp3`
   - `whitenoise.mp3`
   - `binaural.mp3`

2. Uncomment the three `require()` lines near the top of `lib/audio/ambientPlayer.ts`

Sound selection then appears on the Simple mode config screen.

---

## Tuning constants

| File | Constant | Default | What it does |
|---|---|---|---|
| `lib/sensors/pickupDetector.ts` | `MOVEMENT_THRESHOLD` | `1.5` | Accelerometer sensitivity — lower = more sensitive |
| `lib/sensors/pickupDetector.ts` | `COOLDOWN_MS` | `3000` | Minimum ms between pickup triggers |
| `lib/store/sessionStore.ts` | `PUNISHMENT_SECONDS` | `120` | How many seconds the +2 min punishment adds |
| `lib/store/streakStore.ts` | `GRACE_HOURS` | `2` | Hours before midnight where streak grace applies |

---

## Troubleshooting

**`adb devices` shows nothing**
Make sure USB debugging is on and you tapped Allow on the phone. Try a different cable (data cables, not charge-only).

**Brightness doesn't dim on Android**
The `expo-brightness` module needs `WRITE_SETTINGS` permission on Android. A dev build (from `npx expo run:android`) handles this. Expo Go will not.

**Metro bundler port conflict**
```bash
npx expo start --port 8082
```

**App crashes on launch**
Check the Metro terminal for red error output. Most common cause is a missing dependency — run `npm install` again.

**Reanimated worklet error**
Make sure `babel.config.js` has `'react-native-reanimated/plugin'` listed last in plugins, then clear the Metro cache:
```bash
npx expo start --clear
```


*** Sound attribution

Rain loop: https://freesound.org/people/unfa/sounds/177479/
White noise: https://freesound.org/people/Timbre/sounds/843519/
Singing bowl: https://www.imagefilm.berlin/ - https://freesound.org/people/imagefilm.berlin/sounds/763504/
Gong: https://freesound.org/people/univ_lyon3/sounds/324548/