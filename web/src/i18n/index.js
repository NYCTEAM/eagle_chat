import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入语言包
import en from './locales/en.json'
import zh from './locales/zh.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'
import pt from './locales/pt.json'

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  ko: { translation: ko },
  ru: { translation: ru },
  ar: { translation: ar },
  pt: { translation: pt }
}

i18n
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 传递 i18n 实例给 react-i18next
  .init({
    resources,
    fallbackLng: 'en', // 默认语言
    debug: false,
    
    interpolation: {
      escapeValue: false // React 已经安全处理
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
