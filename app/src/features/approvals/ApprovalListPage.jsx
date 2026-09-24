import { useApp } from '../../app/AppContext'
import { BookingTable } from '../../components/ui/BookingTable'
import { Card, PageHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { useLanguage } from '../../i18n/LanguageContext'
import { translatedRoleLabel } from '../auth/roles'

function useReviewerContent(t) {
  return {
    technician: {
      status: 'pending_technician',
      title: t('approvals.pendingTitleTechnician'),
      description: t('approvals.pendingDescriptionTechnician'),
    },
    advisor: {
      status: 'pending_advisor',
      title: t('approvals.pendingTitleAdvisor'),
      description: t('approvals.pendingDescriptionAdvisor'),
    },
    dean: {
      status: 'pending_dean',
      title: t('approvals.pendingTitleDean'),
      description: t('approvals.pendingDescriptionDean'),
    },
  }
}

export function PendingRequestsPage() {
  const { user, bookings } = useApp()
  const { t } = useLanguage()
  const content = useReviewerContent(t)[user.role]
  const pending = bookings.filter((booking) => booking.status === content.status)
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('approvals.roleReview', { role: translatedRoleLabel(t, user.role) })} title={content.title} description={content.description} />
      <Card className="overflow-hidden">{pending.length ? <BookingTable bookings={pending} showRequester showAdvisor={user.role === 'dean'} /> : <EmptyState title={t('approvals.noPendingTitle')} description={t('approvals.noPendingDescription')} />}</Card>
    </div>
  )
}

export function ApprovalHistoryPage() {
  const { user, bookings } = useApp()
  const { t } = useLanguage()
  const history = bookings.filter((booking) => {
    if (user.role === 'technician') return booking.technicianDecision === 'approved' || booking.technicianDecision === 'rejected'
    if (user.role === 'advisor') return booking.advisorDecision === 'approved' || booking.advisorDecision === 'rejected'
    return booking.deanDecision === 'approved' || booking.deanDecision === 'rejected'
  })
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('approvals.roleReview', { role: translatedRoleLabel(t, user.role) })} title={user.role === 'dean' ? t('approvals.historyTitleDean') : t('approvals.historyTitleOther')} description={t('approvals.historyDescription')} />
      <Card className="overflow-hidden">{history.length ? <BookingTable bookings={history} showRequester /> : <EmptyState title={t('approvals.noHistoryTitle')} description={t('approvals.noHistoryDescription')} />}</Card>
    </div>
  )
}
