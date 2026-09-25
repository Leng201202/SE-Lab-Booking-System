import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Navigate, Link, useLocation } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { LanguageToggle } from '../../components/ui/LanguageToggle'
import { useLanguage } from '../../i18n/LanguageContext'

export function LoginPage() {
  const { signInWithGoogle, isSupabaseConfigured, appError } = useApp()
  const { t } = useLanguage()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const accountDeleted = Boolean(location.state?.accountDeleted)

  const login = async () => {
    setSubmitting(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (nextError) {
      setError(nextError.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-mfu-950 px-4 py-6 text-white sm:px-5 sm:py-10">
      <div className="brand-stripe absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-24 size-96 rounded-full bg-mfu-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-blue-600/12 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-3rem)] max-w-5xl flex-col justify-center sm:min-h-[calc(100dvh-5rem)]">
        <div className="absolute right-0 top-0"><LanguageToggle tone="dark" /></div>
        <div className="mb-6 text-center sm:mb-10">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-white p-2 shadow-xl shadow-black/30 sm:mb-5 sm:size-16"><img src="/SE_Logo.png" alt="Software Engineering logo" className="h-full w-auto object-contain" /></div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Mae Fah Luang University · ADT</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-4xl">SE Lab PC Booking System</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-100/60">{t('login.subtitle')}</p>
        </div>
        {accountDeleted && (
          <div className="mx-auto mb-6 w-full max-w-md rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100" role="status">
            {t('login.accountDeletedNotice')}
          </div>
        )}
        <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur sm:p-7">
          <span className="grid size-11 place-items-center rounded-xl bg-mfu-500/15 text-emerald-200"><ShieldCheck size={22} /></span>
          <h2 className="mt-5 text-xl font-bold">{t('login.secureHeading')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{t('login.secureDescription')}</p>
          <button disabled={!isSupabaseConfigured || submitting} onClick={login} className="group mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white font-bold text-slate-900 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50">
            <span className="grid size-6 place-items-center rounded-full bg-white text-sm font-black text-blue-600 ring-1 ring-slate-200">G</span>
            {submitting ? t('login.redirecting') : t('login.continueWithGoogle')}
            {!submitting && <ArrowRight size={17} className="transition group-hover:translate-x-1" />}
          </button>
          {!isSupabaseConfigured && (
            <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
              {t('login.notConfiguredPrefix')} <code>app/.env.example</code> {t('login.notConfiguredSuffix')} <code>app/.env.local</code>.
            </p>
          )}
          {(error || appError) && <p className="mt-4 rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-xs leading-5 text-red-100" role="alert">{error || appError}</p>}
        </div>
        <p className="mt-6 text-center text-xs leading-5 text-emerald-100/35 sm:mt-8">{t('login.footerNote')}</p>
      </div>
    </main>
  )
}

export function AuthCallbackPage() {
  const { user, authReady, workspaceLoading, appError } = useApp()
  const { t } = useLanguage()
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <main className="grid min-h-screen place-items-center bg-mfu-950 p-4 text-white">
      <div className="max-w-md text-center">
        <img src="/SE_Logo.png" alt="Software Engineering logo" className="mx-auto h-16 w-auto rounded-xl bg-white p-2" />
        <h1 className="mt-5 text-xl font-bold">{t('login.completingSignIn')}</h1>
        <p className="mt-2 text-sm leading-6 text-emerald-100/65">{appError || (!authReady || workspaceLoading ? t('login.loadingAccount') : t('login.noSession'))}</p>
        {authReady && !workspaceLoading && !user && <Link to="/login" className="mt-5 inline-flex text-sm font-semibold text-emerald-300">{t('login.returnToSignIn')}</Link>}
      </div>
    </main>
  )
}
