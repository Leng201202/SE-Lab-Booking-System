import { AlertTriangle, LogOut, RotateCcw, ShieldOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { useLanguage } from '../../i18n/LanguageContext'

const RECOVERY_WINDOW_DAYS = 7
const RECOVERY_WINDOW_MS = RECOVERY_WINDOW_DAYS * 24 * 60 * 60 * 1000

function formatRequestedDate(isoDate) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate))
}

export function AccountDeactivatedPage() {
  const { user, logout, reactivateAccount } = useApp()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [reactivating, setReactivating] = useState(false)
  const [error, setError] = useState('')

  const [now] = useState(() => Date.now())
  const requestedAt = new Date(user.deletionRequestedAt).getTime()
  const expiresAt = requestedAt + RECOVERY_WINDOW_MS
  const expired = now >= expiresAt
  const daysRemaining = Math.max(0, Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000)))

  const cancelAndLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      // AppContext keeps the session in place and surfaces the error via appError.
    }
  }

  const reactivate = async () => {
    setReactivating(true)
    setError('')
    try {
      await reactivateAccount()
    } catch (reactivateError) {
      setError(reactivateError.message)
    } finally {
      setReactivating(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mfu-950 p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur sm:p-7">
        <span className={`grid size-12 place-items-center rounded-xl ${expired ? 'bg-red-500/15 text-red-300' : 'bg-amber-400/15 text-amber-300'}`}>
          {expired ? <ShieldOff size={24} /> : <AlertTriangle size={24} />}
        </span>
        <h1 className="mt-5 text-xl font-bold">{expired ? t('accountDeactivated.expiredTitle') : t('accountDeactivated.title')}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {expired
            ? t('accountDeactivated.expiredDescription')
            : t('accountDeactivated.description', { date: formatRequestedDate(user.deletionRequestedAt) })}
        </p>
        {!expired && (
          <p className="mt-3 text-sm font-semibold text-amber-300">
            {daysRemaining === 0 ? t('accountDeactivated.lastDay') : t('accountDeactivated.daysRemaining', { count: daysRemaining })}
          </p>
        )}
        {error && <p className="mt-4 rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-xs leading-5 text-red-100" role="alert">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <Button className="w-full" variant="secondary" onClick={cancelAndLogout} disabled={reactivating}>
            <LogOut size={17} />{expired ? t('accountDeactivated.logout') : t('accountDeactivated.cancelLogout')}
          </Button>
          {!expired && (
            <Button className="w-full" onClick={reactivate} disabled={reactivating}>
              <RotateCcw size={17} />{reactivating ? t('accountDeactivated.reactivating') : t('accountDeactivated.reactivate')}
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
