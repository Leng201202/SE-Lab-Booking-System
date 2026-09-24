import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { BookingTable } from '../../components/ui/BookingTable'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/FormFields'
import { useLanguage } from '../../i18n/LanguageContext'
import { statusMeta } from '../../utils/booking'

export function MyBookingsPage() {
  const { user, bookings } = useApp()
  const { t } = useLanguage()
  const [filter, setFilter] = useState('all')
  const mine = useMemo(() => bookings.filter((booking) => booking.requesterId === user.id), [bookings, user.id])
  const filtered = filter === 'all' ? mine : mine.filter((booking) => booking.status === filter)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('bookings.myRequestsEyebrow')} title={t('nav.myBookings')} description={t('bookings.myBookingsDescription')} action={<Link to="/book"><Button><Plus size={17} />{t('bookings.newRequest')}</Button></Link>} />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-slate-500"><span className="font-semibold text-slate-800">{t('bookings.requestCount', { count: filtered.length })}</span></p>
          <Select className="w-full sm:max-w-48" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter bookings by status">
            <option value="all">{t('common.allStatuses')}</option>
            {Object.keys(statusMeta).map((value) => <option key={value} value={value}>{t(`status.${value}`)}</option>)}
          </Select>
        </div>
        {filtered.length ? <BookingTable bookings={filtered} /> : <EmptyState title={t('bookings.noMatchingRequests')} description={t('bookings.noMatchingRequestsDescription')} />}
      </Card>
    </div>
  )
}
