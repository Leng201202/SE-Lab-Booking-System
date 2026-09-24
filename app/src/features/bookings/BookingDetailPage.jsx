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
import { formatBookingDateRange, formatBookingTime, formatRequestDate, isBookingCancellable, isRemoteBooking } from '../../utils/booking'
import { roleLabels } from '../auth/roles'

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon size={17} /></span>
      <div className="min-w-0"><p className="text-xs font-medium text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-800">{value}</p></div>
    </div>
  )
}

function ProgressStep({ title, state, detail, last }) {
  const stateStyle = {
    complete: { icon: Check, wrap: 'bg-emerald-500 text-white', text: 'text-emerald-700', label: 'Approved' },
    rejected: { icon: X, wrap: 'bg-red-500 text-white', text: 'text-red-700', label: 'Rejected' },
    cancelled: { icon: CircleSlash2, wrap: 'bg-slate-500 text-white', text: 'text-slate-600', label: 'Cancelled' },
    current: { icon: Clock3, wrap: 'bg-mfu-700 text-white ring-4 ring-mfu-100', text: 'text-mfu-700', label: 'Pending' },
    waiting: { icon: Clock3, wrap: 'bg-slate-100 text-slate-400', text: 'text-slate-400', label: 'Waiting' },
    skipped: { icon: Check, wrap: 'bg-slate-200 text-slate-500', text: 'text-slate-500', label: 'Not required' },
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

function ApprovalProgress({ booking }) {
  const isCancelled = booking.status === 'cancelled'
  const technicianState = booking.technicianDecision === 'not_required' ? 'skipped' : booking.technicianDecision === 'approved' ? 'complete' : booking.technicianDecision === 'rejected' ? 'rejected' : booking.status === 'pending_technician' ? 'current' : 'waiting'
  const advisorState = booking.advisorDecision === 'not_required' ? 'skipped' : booking.advisorDecision === 'approved' ? 'complete' : booking.advisorDecision === 'rejected' ? 'rejected' : booking.status === 'pending_advisor' ? 'current' : 'waiting'
  const deanState = booking.deanDecision === 'approved' ? 'complete' : booking.deanDecision === 'rejected' ? 'rejected' : booking.status === 'pending_dean' ? 'current' : 'waiting'
  const finalState = booking.status === 'approved' || booking.status === 'completed' ? 'complete' : booking.status === 'rejected' ? 'rejected' : isCancelled ? 'cancelled' : 'waiting'

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="font-bold text-slate-900">Approval progress</h2>
      <div className="mt-6">
        <ProgressStep title={`${roleLabels[booking.requesterRole] || booking.requesterRole} submitted`} state="complete" detail={formatRequestDate(booking.requestedAt)} />
        <ProgressStep title="Technician review" state={technicianState} detail={booking.technicianDecision === 'not_required' ? 'Required only for Student requests' : booking.technicianDecision === 'approved' ? 'Technical review approved' : booking.technicianDecision === 'rejected' ? 'Request rejected during technical review' : booking.status === 'pending_technician' ? 'Waiting for a Technician' : 'Begins before Advisor review'} />
        <ProgressStep title="Advisor review" state={advisorState} detail={booking.advisorDecision === 'not_required' ? 'Skipped for Advisor and Dean requests' : booking.advisorDecision === 'approved' ? 'Advisor review approved' : booking.advisorDecision === 'rejected' ? 'Request returned to the requester' : booking.status === 'pending_advisor' ? `Waiting for ${booking.advisorId ? booking.advisorName : 'an Advisor'}` : 'Begins after Technician approval'} />
        <ProgressStep title="Dean review" state={deanState} detail={booking.requesterRole === 'dean' ? 'Approved immediately after availability validation' : booking.deanDecision === 'approved' ? 'Final approval granted' : booking.deanDecision === 'rejected' ? 'Final approval declined' : booking.status === 'pending_dean' ? 'Ready for final review' : 'Begins after Advisor approval'} />
        <ProgressStep title="Final booking" state={finalState} detail={finalState === 'complete' ? 'PC booking is confirmed' : finalState === 'rejected' ? 'Booking was rejected' : finalState === 'cancelled' ? 'Requester cancelled and released the PC time' : 'Confirmation pending'} last />
      </div>
    </Card>
  )
}

export function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
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
    return <Card className="p-6 text-center sm:p-10"><h1 className="text-xl font-bold text-slate-900">Request not found</h1><p className="mt-2 text-sm text-slate-500">This request does not exist or you do not have permission to view it.</p><Button className="mt-5 w-full sm:w-auto" onClick={() => navigate('/dashboard')}>Back to dashboard</Button></Card>
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
    if (!reason.trim()) { setReasonError('A rejection reason is required.'); return }
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
      setCancellationReasonError('Please provide a cancellation reason of at least 5 characters.')
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
          <Link to={booking.requesterId === user.id ? '/bookings' : '/requests/pending'} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-mfu-700"><ArrowLeft size={16} />Back to requests</Link>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{booking.requestNumber}</h1><StatusBadge status={booking.status} /></div>
          <p className="mt-2 text-sm text-slate-500">Submitted {formatRequestDate(booking.requestedAt)}</p>
        </div>
        {(canReview || canCancel) && (
          <div className={`grid gap-3 sm:flex ${canReview ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {canCancel && <Button className="w-full sm:w-auto" variant="danger" onClick={() => setCancelOpen(true)}><CircleSlash2 size={17} />Cancel booking</Button>}
            {canReview && <><Button className="w-full sm:w-auto" variant="secondary" onClick={() => setRejectOpen(true)}><XCircle size={17} />Reject</Button><Button className="w-full sm:w-auto" onClick={() => setConfirmOpen(true)}><CheckCircle2 size={17} />Approve</Button></>}
          </div>
        )}
      </div>

      {actionError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{actionError}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <Card className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-mfu-700">Booking information</p><h2 className="mt-1 text-xl font-bold text-slate-950">{booking.pcId}</h2></div>
              <span className="grid size-11 place-items-center rounded-xl bg-mfu-50 text-mfu-700"><Monitor size={22} /></span>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <DetailItem icon={UserRound} label="Requester" value={`${booking.requesterName} · ${booking.requesterRole} · ${booking.requesterNumber}`} />
              <DetailItem icon={GraduationCap} label="Advisor review" value={booking.requesterRole === 'technician' ? 'Open Advisor queue' : booking.advisorName} />
              <DetailItem icon={MapPin} label="Room" value={booking.room} />
              <DetailItem icon={CalendarDays} label="Booking dates" value={formatBookingDateRange(booking)} />
              <DetailItem icon={Clock3} label={isRemoteBooking(booking) ? 'Access' : 'Lab time'} value={formatBookingTime(booking)} />
              <DetailItem icon={GraduationCap} label="Course / Project" value={booking.course} />
            </div>
            <div className="mt-6 border-t border-slate-100 pt-6"><DetailItem icon={FileText} label="Purpose" value={booking.purpose} /></div>
          </Card>
          {booking.rejectionReason && (
            <Card className="border-red-200 bg-red-50 p-4 sm:p-5"><div className="flex gap-3"><XCircle className="mt-0.5 shrink-0 text-red-600" size={20} /><div className="min-w-0"><h2 className="font-bold text-red-900">Rejected by {booking.rejectedBy}</h2><p className="mt-1 break-words text-sm leading-6 text-red-700">{booking.rejectionReason}</p></div></div></Card>
          )}
          {booking.cancellationReason && (
            <Card className="border-slate-200 bg-slate-50 p-4 sm:p-5"><div className="flex gap-3"><CircleSlash2 className="mt-0.5 shrink-0 text-slate-600" size={20} /><div className="min-w-0"><h2 className="font-bold text-slate-900">Cancelled by requester</h2><p className="mt-1 break-words text-sm leading-6 text-slate-700">{booking.cancellationReason}</p>{booking.cancelledAt && <p className="mt-2 text-xs text-slate-500">Cancelled {formatRequestDate(booking.cancelledAt)}</p>}</div></div></Card>
          )}
        </div>
        <ApprovalProgress booking={booking} />
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => !busy && setConfirmOpen(false)} onConfirm={approve} title={`Approve ${booking.requestNumber}?`} description={user.role === 'technician' ? 'This request will move to the assigned Advisor.' : user.role === 'advisor' ? 'This request will move to the Dean for final review.' : 'This will confirm the PC booking for the requester.'} confirmLabel={busy ? 'Approving…' : 'Approve request'} disabled={busy} />
      <Modal open={rejectOpen} onClose={() => !busy && setRejectOpen(false)} title={`Reject ${booking.requestNumber}`} description="The requester will be able to see this reason in their booking details.">
        <label className="block text-sm font-semibold text-slate-700">Rejection reason</label>
        <Textarea className="mt-2" value={reason} onChange={(event) => { setReason(event.target.value); setReasonError('') }} placeholder="Explain why this request cannot be approved…" autoFocus />
        {reasonError && <p className="mt-1.5 text-sm text-red-600">{reasonError}</p>}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" variant="secondary" disabled={busy} onClick={() => setRejectOpen(false)}>Cancel</Button><Button className="w-full sm:w-auto" variant="danger" disabled={busy} onClick={reject}>{busy ? 'Rejecting…' : 'Reject request'}</Button></div>
      </Modal>
      <Modal open={cancelOpen} onClose={() => !busy && setCancelOpen(false)} title={`Cancel ${booking.requestNumber}`} description="Cancelling releases this PC time immediately. This action cannot be undone.">
        <label className="block text-sm font-semibold text-slate-700">Cancellation reason</label>
        <Textarea className="mt-2" value={cancellationReason} maxLength={2000} onChange={(event) => { setCancellationReason(event.target.value); setCancellationReasonError('') }} placeholder="Explain why you no longer need this booking…" autoFocus />
        {cancellationReasonError && <p className="mt-1.5 text-sm text-red-600">{cancellationReasonError}</p>}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" variant="secondary" disabled={busy} onClick={() => setCancelOpen(false)}>Keep booking</Button><Button className="w-full sm:w-auto" variant="danger" disabled={busy} onClick={cancel}>{busy ? 'Cancelling…' : 'Cancel booking'}</Button></div>
      </Modal>
    </div>
  )
}
