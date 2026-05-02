import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";

i18next.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
});

export default i18next;

type TranslationData = typeof en;

const translationMap: Record<string, TranslationData> = { en };

export function getTranslations(lang: string): TranslationData {
    return translationMap[lang] ?? translationMap.en;
}

type Tone = "strict" | "encouraging";
type MessageKey =
    | "grace"
    | "pickup"
    | "appSwitch"
    | "complete"
    | "streakBroken"
    | "streakMilestone"
    | "challenge";

export function getRandomMessage(tone: Tone, key: MessageKey, lang = "en"): string {
    const pool = getTranslations(lang).messages[tone][key];
    return pool[Math.floor(Math.random() * pool.length)];
}
