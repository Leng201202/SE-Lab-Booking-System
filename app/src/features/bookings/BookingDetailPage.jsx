import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
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
import { formatBookingDateRange, formatBookingTime, formatRequestDate, isRemoteBooking } from '../../utils/booking'

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
    current: { icon: Clock3, wrap: 'bg-mfu-700 text-white ring-4 ring-mfu-100', text: 'text-mfu-700', label: 'Pending' },
    waiting: { icon: Clock3, wrap: 'bg-slate-100 text-slate-400', text: 'text-slate-400', label: 'Waiting' },
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
  const advisorState = booking.advisorDecision === 'approved' ? 'complete' : booking.advisorDecision === 'rejected' ? 'rejected' : 'current'
  const deanState = booking.deanDecision === 'approved' ? 'complete' : booking.deanDecision === 'rejected' ? 'rejected' : booking.status === 'pending_dean' ? 'current' : 'waiting'
  const finalState = booking.status === 'approved' || booking.status === 'completed' ? 'complete' : booking.status === 'rejected' || booking.status === 'cancelled' ? 'rejected' : 'waiting'

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="font-bold text-slate-900">Approval progress</h2>
      <div className="mt-6">
        <ProgressStep title="Student submitted" state="complete" detail={formatRequestDate(booking.requestedAt)} />
        <ProgressStep title="Advisor review" state={advisorState} detail={booking.advisorDecision === 'approved' ? `Approved by ${booking.advisorName}` : booking.advisorDecision === 'rejected' ? 'Request returned to the student' : `Waiting for ${booking.advisorName}`} />
        <ProgressStep title="Dean review" state={deanState} detail={booking.deanDecision === 'approved' ? 'Final approval granted' : booking.deanDecision === 'rejected' ? 'Final approval declined' : booking.status === 'pending_dean' ? 'Ready for final review' : 'Begins after advisor approval'} />
        <ProgressStep title="Final booking" state={finalState} detail={finalState === 'complete' ? 'PC booking is confirmed' : finalState === 'rejected' ? 'Booking is not active' : 'Confirmation pending'} last />
      </div>
    </Card>
  )
}

export function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, bookings, approveAsAdvisor, rejectAsAdvisor, approveAsDean, rejectAsDean } = useApp()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const booking = bookings.find((item) => item.id === id)

  if (!booking) {
    return <Card className="p-6 text-center sm:p-10"><h1 className="text-xl font-bold text-slate-900">Request not found</h1><p className="mt-2 text-sm text-slate-500">This request does not exist or you do not have permission to view it.</p><Button className="mt-5 w-full sm:w-auto" onClick={() => navigate('/dashboard')}>Back to dashboard</Button></Card>
  }

  const canReview = (user.role === 'advisor' && booking.status === 'pending_advisor') || (user.role === 'dean' && booking.status === 'pending_dean')
  const approve = async () => {
    setBusy(true)
    setActionError('')
    try {
      if (user.role === 'advisor') await approveAsAdvisor(booking.id)
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
      if (user.role === 'advisor') await rejectAsAdvisor(booking.id, reason)
      else await rejectAsDean(booking.id, reason)
      setRejectOpen(false)
      setReason('')
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
          <Link to={user.role === 'student' ? '/bookings' : '/requests/pending'} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-mfu-700"><ArrowLeft size={16} />Back to requests</Link>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{booking.requestNumber}</h1><StatusBadge status={booking.status} /></div>
          <p className="mt-2 text-sm text-slate-500">Submitted {formatRequestDate(booking.requestedAt)}</p>
        </div>
        {canReview && <div className="grid grid-cols-2 gap-3 sm:flex"><Button className="w-full sm:w-auto" variant="secondary" onClick={() => setRejectOpen(true)}><XCircle size={17} />Reject</Button><Button className="w-full sm:w-auto" onClick={() => setConfirmOpen(true)}><CheckCircle2 size={17} />Approve</Button></div>}
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
              <DetailItem icon={UserRound} label="Student" value={`${booking.studentName} · ${booking.studentNumber}`} />
              <DetailItem icon={GraduationCap} label="Advisor" value={booking.advisorName} />
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
        </div>
        <ApprovalProgress booking={booking} />
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => !busy && setConfirmOpen(false)} onConfirm={approve} title={`Approve ${booking.requestNumber}?`} description={user.role === 'advisor' ? 'This request will move to the dean for final review.' : 'This will confirm the PC booking for the student.'} confirmLabel={busy ? 'Approving…' : 'Approve request'} disabled={busy} />
      <Modal open={rejectOpen} onClose={() => !busy && setRejectOpen(false)} title={`Reject ${booking.requestNumber}`} description="The student will be able to see this reason in their booking details.">
        <label className="block text-sm font-semibold text-slate-700">Rejection reason</label>
        <Textarea className="mt-2" value={reason} onChange={(event) => { setReason(event.target.value); setReasonError('') }} placeholder="Explain why this request cannot be approved…" autoFocus />
        {reasonError && <p className="mt-1.5 text-sm text-red-600">{reasonError}</p>}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" variant="secondary" disabled={busy} onClick={() => setRejectOpen(false)}>Cancel</Button><Button className="w-full sm:w-auto" variant="danger" disabled={busy} onClick={reject}>{busy ? 'Rejecting…' : 'Reject request'}</Button></div>
      </Modal>
    </div>
  )
}
