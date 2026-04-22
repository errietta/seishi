import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'

i18next
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  })

export default i18next

type Tone = 'strict' | 'encouraging'
type MessageKey = 'grace' | 'pickup' | 'appSwitch' | 'complete' | 'streakBroken' | 'streakMilestone'

export function getRandomMessage(tone: Tone, key: MessageKey): string {
  const pool = en.messages[tone][key]
  return pool[Math.floor(Math.random() * pool.length)]
}
