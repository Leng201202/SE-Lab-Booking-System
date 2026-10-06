import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LanguageToggle } from '../../components/ui/LanguageToggle'
import { useLanguage } from '../../i18n/LanguageContext'

export function LegalPage({ document }) {
  const { t } = useLanguage()
  const content = t(`legal.${document}`)
  const linkClass = 'rounded text-sm font-semibold text-mfu-700 underline underline-offset-4 hover:text-mfu-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mfu-700'

  return (
    <main className="relative min-h-screen bg-[#f5f8f5] px-4 py-8 sm:px-6 sm:py-12">
      <div className="brand-stripe absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/login" className={`inline-flex items-center gap-2 ${linkClass}`}>
            <ArrowLeft size={16} aria-hidden="true" />
            {t('legal.backToSignIn')}
          </Link>
          <LanguageToggle />
        </div>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10">
          <header>
            <img src="/SE_Logo.png" alt="Software Engineering logo" className="mb-4 h-14 w-auto" />
            <p className="text-sm font-semibold text-mfu-700">SE Lab PC Booking System</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{content.title}</h1>
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">{t('legal.draftNotice')}</p>
            <p className="mt-5 text-sm leading-7 text-slate-600">{content.introduction}</p>
          </header>
          <div className="mt-8 space-y-8">
            {content.sections.map((section, index) => (
              <section key={index} aria-labelledby={`legal-section-${index}`}>
                <h2 id={`legal-section-${index}`} className="text-lg font-bold text-slate-900">{section.title}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="mt-3 break-words text-sm leading-7 text-slate-600">{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
          <nav aria-label={t('legal.navigationLabel')} className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200 pt-6">
            <Link to="/privacy-policy" aria-current={document === 'privacy' ? 'page' : undefined} className={linkClass}>{t('legal.privacy.title')}</Link>
            <Link to="/terms-of-service" aria-current={document === 'terms' ? 'page' : undefined} className={linkClass}>{t('legal.terms.title')}</Link>
          </nav>
        </article>
      </div>
    </main>
  )
}
