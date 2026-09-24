import { useLanguage } from '../../i18n/LanguageContext'

export function LanguageToggle({ tone = 'light', className = '' }) {
  const { language, setLanguage } = useLanguage()
  const activeClass = tone === 'dark' ? 'text-emerald-300' : 'text-mfu-700'
  const inactiveClass = tone === 'dark' ? 'text-emerald-100/45 hover:text-emerald-100/80' : 'text-slate-400 hover:text-slate-600'
  const dividerClass = tone === 'dark' ? 'bg-white/20' : 'bg-slate-300'

  return (
    <div className={`inline-flex items-center gap-2 text-sm font-bold ${className}`} role="group" aria-label="Language / ภาษา">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`transition ${language === 'en' ? activeClass : inactiveClass}`}
      >
        EN
      </button>
      <span className={`h-3.5 w-px shrink-0 ${dividerClass}`} aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLanguage('th')}
        aria-pressed={language === 'th'}
        className={`transition ${language === 'th' ? activeClass : inactiveClass}`}
      >
        TH
      </button>
    </div>
  )
}
