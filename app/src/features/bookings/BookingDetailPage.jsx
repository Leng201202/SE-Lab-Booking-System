import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleSlash2,
  Clock3,
  FileText,
  GraduationCap,
  MapPin,
  Monitor,
  UserRound,
  X,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/FormFields'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useLanguage } from '../../i18n/LanguageContext'
import { formatBookingDateRange, formatBookingTime, formatRequestDate, isBookingCancellable, isRemoteBooking } from '../../utils/booking'
import { translatedRoleLabel } from '../auth/roles'

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon size={17} /></span>
      <div className="min-w-0"><p className="text-xs font-medium text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-800">{value}</p></div>
    </div>
  )
}

function ProgressStep({ title, state, detail, last, t }) {
  const stateStyle = {
    complete: { icon: Check, wrap: 'bg-emerald-500 text-white', text: 'text-emerald-700', label: t('bookingDetail.stateApproved') },
    rejected: { icon: X, wrap: 'bg-red-500 text-white', text: 'text-red-700', label: t('bookingDetail.stateRejected') },
    cancelled: { icon: CircleSlash2, wrap: 'bg-slate-500 text-white', text: 'text-slate-600', label: t('bookingDetail.stateCancelled') },
    current: { icon: Clock3, wrap: 'bg-mfu-700 text-white ring-4 ring-mfu-100', text: 'text-mfu-700', label: t('bookingDetail.statePending') },
    waiting: { icon: Clock3, wrap: 'bg-slate-100 text-slate-400', text: 'text-slate-400', label: t('bookingDetail.stateWaiting') },
    skipped: { icon: Check, wrap: 'bg-slate-200 text-slate-500', text: 'text-slate-500', label: t('bookingDetail.stateNotRequired') },
  }[state]
  const Icon = stateStyle.icon
  return (
    <div className="relative flex gap-4 pb-7 last:pb-0">
      {!last && <div className={`absolute left-[17px] top-9 h-[calc(100%-24px)] w-px ${state === 'complete' ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
      <span className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full ${stateStyle.wrap}`}><Icon size={17} /></span>
      <div className="pt-0.5"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-slate-800">{title}</p><span className={`text-xs font-semibold ${stateStyle.text}`}>{stateStyle.label}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div>
    </div>
  )
}

function ApprovalProgress({ booking, t }) {
  const isCancelled = booking.status === 'cancelled'
  const technicianState = booking.technicianDecision === 'not_required' ? 'skipped' : booking.technicianDecision === 'approved' ? 'complete' : booking.technicianDecision === 'rejected' ? 'rejected' : booking.status === 'pending_technician' ? 'current' : 'waiting'
  const advisorState = booking.advisorDecision === 'not_required' ? 'skipped' : booking.advisorDecision === 'approved' ? 'complete' : booking.advisorDecision === 'rejected' ? 'rejected' : booking.status === 'pending_advisor' ? 'current' : 'waiting'
  const deanState = booking.deanDecision === 'approved' ? 'complete' : booking.deanDecision === 'rejected' ? 'rejected' : booking.status === 'pending_dean' ? 'current' : 'waiting'
  const finalState = booking.status === 'approved' || booking.status === 'completed' ? 'complete' : booking.status === 'rejected' ? 'rejected' : isCancelled ? 'cancelled' : 'waiting'

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="font-bold text-slate-900">{t('bookingDetail.approvalProgress')}</h2>
      <div className="mt-6">
        <ProgressStep t={t} title={t('bookingDetail.submittedBy', { role: translatedRoleLabel(t, booking.requesterRole) || booking.requesterRole })} state="complete" detail={formatRequestDate(booking.requestedAt)} />
        <ProgressStep t={t} title={t('bookingDetail.technicianReview')} state={technicianState} detail={booking.technicianDecision === 'not_required' ? t('bookingDetail.technicianNotRequired') : booking.technicianDecision === 'approved' ? t('bookingDetail.technicianApproved') : booking.technicianDecision === 'rejected' ? t('bookingDetail.technicianRejected') : booking.status === 'pending_technician' ? t('bookingDetail.technicianWaiting') : t('bookingDetail.technicianUpcoming')} />
        <ProgressStep t={t} title={t('bookingDetail.advisorReview')} state={advisorState} detail={booking.advisorDecision === 'not_required' ? t('bookingDetail.advisorSkipped') : booking.advisorDecision === 'approved' ? t('bookingDetail.advisorApproved') : booking.advisorDecision === 'rejected' ? t('bookingDetail.advisorRejected') : booking.status === 'pending_advisor' ? t('bookingDetail.advisorWaitingNamed', { name: booking.advisorId ? booking.advisorName : t('bookingDetail.advisorUnnamed') }) : t('bookingDetail.advisorUpcoming')} />
        <ProgressStep t={t} title={t('bookingDetail.deanReview')} state={deanState} detail={booking.requesterRole === 'dean' ? t('bookingDetail.deanImmediate') : booking.deanDecision === 'approved' ? t('bookingDetail.deanApproved') : booking.deanDecision === 'rejected' ? t('bookingDetail.deanRejected') : booking.status === 'pending_dean' ? t('bookingDetail.deanWaiting') : t('bookingDetail.deanUpcoming')} />
        <ProgressStep t={t} title={t('bookingDetail.finalBooking')} state={finalState} detail={finalState === 'complete' ? t('bookingDetail.finalComplete') : finalState === 'rejected' ? t('bookingDetail.finalRejected') : finalState === 'cancelled' ? t('bookingDetail.finalCancelled') : t('bookingDetail.finalPending')} last />
      </div>
    </Card>
  )
}

export function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, bookings, approveAsTechnician, rejectAsTechnician, approveAsAdvisor, rejectAsAdvisor, approveAsDean, rejectAsDean, cancelOwnBooking } = useApp()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancellationReasonError, setCancellationReasonError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const booking = bookings.find((item) => item.id === id)

  if (!booking) {
    return <Card className="p-6 text-center sm:p-10"><h1 className="text-xl font-bold text-slate-900">{t('bookingDetail.notFoundTitle')}</h1><p className="mt-2 text-sm text-slate-500">{t('bookingDetail.notFoundDescription')}</p><Button className="mt-5 w-full sm:w-auto" onClick={() => navigate('/dashboard')}>{t('bookingDetail.backToDashboard')}</Button></Card>
  }

  const canReview = (user.role === 'technician' && booking.status === 'pending_technician') || (user.role === 'advisor' && booking.status === 'pending_advisor') || (user.role === 'dean' && booking.status === 'pending_dean')
  const canCancel = isBookingCancellable(booking, user)
  const approve = async () => {
    setBusy(true)
    setActionError('')
    try {
      if (user.role === 'technician') await approveAsTechnician(booking.id)
      else if (user.role === 'advisor') await approveAsAdvisor(booking.id)
      else await approveAsDean(booking.id)
      setConfirmOpen(false)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusy(false)
    }
  }
  const reject = async () => {
    if (!reason.trim()) { setReasonError(t('bookingDetail.rejectionRequiredError')); return }
    setBusy(true)
    setActionError('')
    try {
      if (user.role === 'technician') await rejectAsTechnician(booking.id, reason)
      else if (user.role === 'advisor') await rejectAsAdvisor(booking.id, reason)
      else await rejectAsDean(booking.id, reason)
      setRejectOpen(false)
      setReason('')
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusy(false)
    }
  }
  const cancel = async () => {
    if (cancellationReason.trim().length < 5) {
      setCancellationReasonError(t('bookingDetail.cancellationMinError'))
      return
    }
    setBusy(true)
    setActionError('')
    try {
      await cancelOwnBooking(booking.id, cancellationReason)
      setCancelOpen(false)
      setCancellationReason('')
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link to={booking.requesterId === user.id ? '/bookings' : '/requests/pending'} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-mfu-700"><ArrowLeft size={16} />{t('bookingDetail.backToRequests')}</Link>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{booking.requestNumber}</h1><StatusBadge status={booking.status} /></div>
          <p className="mt-2 text-sm text-slate-500">{t('bookingDetail.submittedOn', { date: formatRequestDate(booking.requestedAt) })}</p>
        </div>
        {(canReview || canCancel) && (
          <div className={`grid gap-3 sm:flex ${canReview ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {canCancel && <Button className="w-full sm:w-auto" variant="danger" onClick={() => setCancelOpen(true)}><CircleSlash2 size={17} />{t('bookingDetail.cancelBooking')}</Button>}
            {canReview && <><Button className="w-full sm:w-auto" variant="secondary" onClick={() => setRejectOpen(true)}><XCircle size={17} />{t('common.reject')}</Button><Button className="w-full sm:w-auto" onClick={() => setConfirmOpen(true)}><CheckCircle2 size={17} />{t('common.approve')}</Button></>}
          </div>
        )}
      </div>

      {actionError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{actionError}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <Card className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-mfu-700">{t('bookingDetail.bookingInformation')}</p><h2 className="mt-1 text-xl font-bold text-slate-950">{booking.pcId}</h2></div>
              <span className="grid size-11 place-items-center rounded-xl bg-mfu-50 text-mfu-700"><Monitor size={22} /></span>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <DetailItem icon={UserRound} label={t('bookingDetail.requester')} value={`${booking.requesterName} · ${booking.requesterRole} · ${booking.requesterNumber}`} />
              <DetailItem icon={GraduationCap} label={t('bookingDetail.advisorReview')} value={booking.requesterRole === 'technician' ? t('bookingDetail.openAdvisorQueue') : booking.advisorName} />
              <DetailItem icon={MapPin} label={t('common.room')} value={booking.room} />
              <DetailItem icon={CalendarDays} label={t('bookingDetail.bookingDates')} value={formatBookingDateRange(booking)} />
              <DetailItem icon={Clock3} label={isRemoteBooking(booking) ? t('bookingDetail.access') : t('bookingDetail.labTime')} value={formatBookingTime(booking, t)} />
              <DetailItem icon={GraduationCap} label={t('bookingDetail.courseProject')} value={booking.course} />
            </div>
            <div className="mt-6 border-t border-slate-100 pt-6"><DetailItem icon={FileText} label={t('common.purpose')} value={booking.purpose} /></div>
          </Card>
          {booking.rejectionReason && (
            <Card className="border-red-200 bg-red-50 p-4 sm:p-5"><div className="flex gap-3"><XCircle className="mt-0.5 shrink-0 text-red-600" size={20} /><div className="min-w-0"><h2 className="font-bold text-red-900">{t('bookingDetail.rejectedBy', { role: booking.rejectedBy })}</h2><p className="mt-1 break-words text-sm leading-6 text-red-700">{booking.rejectionReason}</p></div></div></Card>
          )}
          {booking.cancellationReason && (
            <Card className="border-slate-200 bg-slate-50 p-4 sm:p-5"><div className="flex gap-3"><CircleSlash2 className="mt-0.5 shrink-0 text-slate-600" size={20} /><div className="min-w-0"><h2 className="font-bold text-slate-900">{t('bookingDetail.cancelledByRequester')}</h2><p className="mt-1 break-words text-sm leading-6 text-slate-700">{booking.cancellationReason}</p>{booking.cancelledAt && <p className="mt-2 text-xs text-slate-500">{t('bookingDetail.cancelledOn', { date: formatRequestDate(booking.cancelledAt) })}</p>}</div></div></Card>
          )}
        </div>
        <ApprovalProgress booking={booking} t={t} />
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => !busy && setConfirmOpen(false)} onConfirm={approve} title={t('bookingDetail.approveTitle', { requestNumber: booking.requestNumber })} description={user.role === 'technician' ? t('bookingDetail.approveDescTechnician') : user.role === 'advisor' ? t('bookingDetail.approveDescAdvisor') : t('bookingDetail.approveDescDean')} confirmLabel={busy ? t('common.approving') : t('bookingDetail.approveRequest')} disabled={busy} />
      <Modal open={rejectOpen} onClose={() => !busy && setRejectOpen(false)} title={t('bookingDetail.rejectTitle', { requestNumber: booking.requestNumber })} description={t('bookingDetail.rejectDescription')}>
        <label className="block text-sm font-semibold text-slate-700">{t('bookingDetail.rejectionReasonLabel')}</label>
        <Textarea className="mt-2" value={reason} onChange={(event) => { setReason(event.target.value); setReasonError('') }} placeholder={t('bookingDetail.rejectionPlaceholder')} autoFocus />
        {reasonError && <p className="mt-1.5 text-sm text-red-600">{reasonError}</p>}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" variant="secondary" disabled={busy} onClick={() => setRejectOpen(false)}>{t('common.cancel')}</Button><Button className="w-full sm:w-auto" variant="danger" disabled={busy} onClick={reject}>{busy ? t('common.rejecting') : t('bookingDetail.rejectRequest')}</Button></div>
      </Modal>
      <Modal open={cancelOpen} onClose={() => !busy && setCancelOpen(false)} title={t('bookingDetail.cancelTitle', { requestNumber: booking.requestNumber })} description={t('bookingDetail.cancelDescription')}>
        <label className="block text-sm font-semibold text-slate-700">{t('bookingDetail.cancellationReasonLabel')}</label>
        <Textarea className="mt-2" value={cancellationReason} maxLength={2000} onChange={(event) => { setCancellationReason(event.target.value); setCancellationReasonError('') }} placeholder={t('bookingDetail.cancellationPlaceholder')} autoFocus />
        {cancellationReasonError && <p className="mt-1.5 text-sm text-red-600">{cancellationReasonError}</p>}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" variant="secondary" disabled={busy} onClick={() => setCancelOpen(false)}>{t('bookingDetail.keepBooking')}</Button><Button className="w-full sm:w-auto" variant="danger" disabled={busy} onClick={cancel}>{busy ? t('bookingDetail.cancelling') : t('bookingDetail.cancelBooking')}</Button></div>
      </Modal>
    </div>
  )
}
