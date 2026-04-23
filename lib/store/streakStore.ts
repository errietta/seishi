import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Mode } from './sessionStore'

export interface SessionRecord {
  date: string
  score: number
  concentration: number
  mode: Mode
  duration: number
  pickups: number
}

const STREAK_KEY = 'seishi_streak'
const TONE_KEY = 'seishi_tone'
const DEV_MODE_KEY = 'seishi_devmode'
const GRACE_HOURS = 2

function isConsecutiveDay(lastDateStr: string, now: Date): boolean {
  const last = new Date(lastDateStr)
  const diffMs = now.getTime() - last.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= 1 + GRACE_HOURS / 24
}

interface StreakState {
  currentStreak: number
  lastSessionDate: string | null
  history: SessionRecord[]
  tone: 'strict' | 'encouraging'
  devMode: boolean
  initialized: boolean
  initialize: () => Promise<void>
  recordSession: (record: Omit<SessionRecord, 'date'>) => Promise<void>
  setTone: (tone: 'strict' | 'encouraging') => void
  setDevMode: (on: boolean) => void
}

export const useStreakStore = create<StreakState>((set, get) => ({
  currentStreak: 0,
  lastSessionDate: null,
  history: [],
  tone: 'strict',
  devMode: false,
  initialized: false,

  initialize: async () => {
    try {
      const [streakRaw, tone, devModeRaw] = await Promise.all([
        AsyncStorage.getItem(STREAK_KEY),
        AsyncStorage.getItem(TONE_KEY),
        AsyncStorage.getItem(DEV_MODE_KEY),
      ])
      const data = streakRaw ? JSON.parse(streakRaw) : {}
      set({
        ...data,
        tone: (tone as 'strict' | 'encouraging') ?? 'strict',
        devMode: devModeRaw === '1',
        initialized: true,
      })
    } catch {
      set({ initialized: true })
    }
  },

  recordSession: async (record) => {
    const state = get()
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const last = state.lastSessionDate

    console.log({
      todayStr,
      last,
      isConsecutive: last ? isConsecutiveDay(last, now) : 'N/A',
    })

    let streak = state.currentStreak
    if (!last) {
      streak = 1
    } else if (last === todayStr) {
      // already recorded today
    } else if (isConsecutiveDay(last, now)) {
      streak += 1
    } else {
      streak = 1
    }

    const entry: SessionRecord = { ...record, date: now.toISOString() }
    const history = [entry, ...state.history].slice(0, 100)
    const next = { currentStreak: streak, lastSessionDate: todayStr, history }
    set(next)
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(next))
  },

  setTone: (tone) => {
    set({ tone })
    AsyncStorage.setItem(TONE_KEY, tone).catch(() => {})
  },

  setDevMode: (on) => {
    set({ devMode: on })
    AsyncStorage.setItem(DEV_MODE_KEY, on ? '1' : '0').catch(() => {})
  },
}))
