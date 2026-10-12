import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { LanguageMode } from '@/domain/types';
import en from './locales/en';
import zhCN from './locales/zh-CN';

export const SUPPORTED = ['zh-CN', 'en'] as const;
export type SupportedLang = (typeof SUPPORTED)[number];

/** 系统语言不受支持时统一回退 zh-CN。 */
export function systemLanguage(): SupportedLang {
  const tag = getLocales()[0]?.languageTag ?? 'zh-CN';
  if (tag.toLowerCase().startsWith('en')) return 'en';
  if (tag.toLowerCase().startsWith('zh')) return 'zh-CN';
  return 'zh-CN';
}

export function resolveLanguage(mode: LanguageMode): SupportedLang {
  if (mode === 'zh-CN' || mode === 'en') return mode;
  return systemLanguage();
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      'zh-CN': { translation: zhCN },
      en: { translation: en },
    },
    lng: systemLanguage(),
    fallbackLng: 'zh-CN',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export function setLanguage(mode: LanguageMode) {
  const lang = resolveLanguage(mode);
  if (i18n.language !== lang) void i18n.changeLanguage(lang);
}

export default i18n;
