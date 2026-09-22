import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { BookingTable } from '../../components/ui/BookingTable'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/FormFields'
import { statusMeta } from '../../utils/booking'

export function MyBookingsPage() {
  const { user, bookings } = useApp()
  const [filter, setFilter] = useState('all')
  const mine = useMemo(() => bookings.filter((booking) => booking.requesterId === user.id), [bookings, user.id])
  const filtered = filter === 'all' ? mine : mine.filter((booking) => booking.status === filter)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="My requests" title="My bookings" description="Review every request and follow its current approval status." action={<Link to="/book"><Button><Plus size={17} />New request</Button></Link>} />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-slate-500"><span className="font-semibold text-slate-800">{filtered.length}</span> requests</p>
          <Select className="w-full sm:max-w-48" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter bookings by status">
            <option value="all">All statuses</option>
            {Object.entries(statusMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
          </Select>
        </div>
        {filtered.length ? <BookingTable bookings={filtered} /> : <EmptyState title="No matching requests" description="Try another status filter or create a new booking." />}
      </Card>
    </div>
  )
}
