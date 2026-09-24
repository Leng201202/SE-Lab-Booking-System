/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'se-lab-language'

function getPath(source, path) {
  return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), source)
}

function interpolate(template, vars) {
  if (!vars || typeof template !== 'string') return template
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
}

function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'en' || stored === 'th' ? stored : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(readStoredLanguage)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Storage may be unavailable (private browsing, disabled cookies); language still works for this session.
    }
    document.documentElement.lang = language
  }, [language])

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => (current === 'en' ? 'th' : 'en'))
  }, [])

  const t = useCallback((key, vars) => {
    const template = getPath(translations[language], key) ?? getPath(translations.en, key) ?? key
    return interpolate(template, vars)
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, toggleLanguage, t }), [language, toggleLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
