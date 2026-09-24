import { useApp } from '../../app/AppContext'
import { BookingTable } from '../../components/ui/BookingTable'
import { Card, PageHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'

const reviewerContent = {
  technician: {
    status: 'pending_technician',
    title: 'Pending technical review',
    description: 'Verify the requested PC and technical suitability before forwarding Student requests to the Advisor.',
  },
  advisor: {
    status: 'pending_advisor',
    title: 'Pending requests',
    description: 'Review Technician-approved Student requests and Technician booking requests before forwarding them to the Dean.',
  },
  dean: {
    status: 'pending_dean',
    title: 'Pending approval',
    description: 'Complete final review for requests that passed their required earlier stages.',
  },
}

export function PendingRequestsPage() {
  const { user, bookings } = useApp()
  const content = reviewerContent[user.role]
  const pending = bookings.filter((booking) => booking.status === content.status)
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${user.role} review`} title={content.title} description={content.description} />
      <Card className="overflow-hidden">{pending.length ? <BookingTable bookings={pending} showRequester showAdvisor={user.role === 'dean'} /> : <EmptyState title="No pending requests" description="You have reviewed everything currently in the queue." />}</Card>
    </div>
  )
}

export function ApprovalHistoryPage() {
  const { user, bookings } = useApp()
  const history = bookings.filter((booking) => {
    if (user.role === 'technician') return booking.technicianDecision === 'approved' || booking.technicianDecision === 'rejected'
    if (user.role === 'advisor') return booking.advisorDecision === 'approved' || booking.advisorDecision === 'rejected'
    return booking.deanDecision === 'approved' || booking.deanDecision === 'rejected'
  })
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${user.role} review`} title={user.role === 'dean' ? 'Approval history' : 'Request history'} description="A record of requests that have already received your decision." />
      <Card className="overflow-hidden">{history.length ? <BookingTable bookings={history} showRequester /> : <EmptyState title="No history yet" description="Your reviewed requests will appear here." />}</Card>
    </div>
  )
}
