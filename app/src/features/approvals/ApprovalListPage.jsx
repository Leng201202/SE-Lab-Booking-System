import { useApp } from '../../app/AppContext'
import { BookingTable } from '../../components/ui/BookingTable'
import { Card, PageHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'

export function PendingRequestsPage() {
  const { user, bookings } = useApp()
  const pendingStatus = user.role === 'advisor' ? 'pending_advisor' : 'pending_dean'
  const pending = bookings.filter((booking) => booking.status === pendingStatus)
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${user.role} review`} title={user.role === 'advisor' ? 'Pending requests' : 'Pending approval'} description={user.role === 'advisor' ? 'Review booking details before forwarding requests to the dean.' : 'These requests have already been approved by the assigned advisor.'} />
      <Card className="overflow-hidden">{pending.length ? <BookingTable bookings={pending} showStudent showAdvisor={user.role === 'dean'} /> : <EmptyState title="No pending requests" description="You have reviewed everything currently in the queue." />}</Card>
    </div>
  )
}

export function ApprovalHistoryPage() {
  const { user, bookings } = useApp()
  const history = bookings.filter((booking) => {
    if (user.role === 'advisor') return booking.advisorDecision === 'approved' || booking.advisorDecision === 'rejected'
    return booking.deanDecision === 'approved' || booking.deanDecision === 'rejected'
  })
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${user.role} review`} title={user.role === 'advisor' ? 'Request history' : 'Approval history'} description="A record of requests that have already received your decision." />
      <Card className="overflow-hidden">{history.length ? <BookingTable bookings={history} showStudent /> : <EmptyState title="No history yet" description="Your reviewed requests will appear here." />}</Card>
    </div>
  )
}
