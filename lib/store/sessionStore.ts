import { create } from 'zustand'

export type Mode = 'simple' | 'raw' | 'spicy'
export type Phase = 'idle' | 'active' | 'winding'

interface SessionState {
  mode: Mode | null
  duration: number
  elapsed: number
  phase: Phase
  pickups: number
  isRunning: boolean
  sound: string | null
  startSession: (mode: Mode, duration: number, sound: string | null) => void
  pauseSession: () => void
  resumeSession: () => void
  endSession: () => void
  registerPickup: () => void
  tickElapsed: () => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  mode: null,
  duration: 0,
  elapsed: 0,
  phase: 'idle',
  pickups: 0,
  isRunning: false,
  sound: null,

  startSession: (mode, duration, sound) =>
    set({ mode, duration, elapsed: 0, phase: 'active', pickups: 0, isRunning: true, sound }),

  pauseSession: () => set({ isRunning: false }),

  resumeSession: () => set({ isRunning: true }),

  endSession: () => set({ isRunning: false, phase: 'idle' }),

  registerPickup: () => set((s) => ({ pickups: s.pickups + 1 })),

  tickElapsed: () =>
    set((s) => {
      const elapsed = s.elapsed + 1
      const remaining = s.duration - elapsed
      const phase: Phase = remaining <= 60 ? 'winding' : 'active'
      return { elapsed, phase }
    }),

  reset: () =>
    set({ mode: null, duration: 0, elapsed: 0, phase: 'idle', pickups: 0, isRunning: false, sound: null }),
}))
