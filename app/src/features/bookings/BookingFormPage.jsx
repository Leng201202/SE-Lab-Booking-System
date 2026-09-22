import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ArrowLeft, CalendarDays, Clock3, Info, Monitor, Wifi } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { Field, Input, Select, Textarea } from '../../components/ui/FormFields'
import { getBangkokDateKey } from '../../utils/booking'

const bookingSchema = z
  .object({
    pcId: z.string().min(1, 'Please select a PC.'),
    startDate: z.string().min(1, 'Start date is required.').refine(
      (date) => !date || date >= getBangkokDateKey(),
      'Past booking dates are not allowed.',
    ),
    endDate: z.string().min(1, 'End date is required.'),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    purpose: z.string().trim().min(5, 'Please provide a purpose of at least 5 characters.'),
    course: z.string().optional(),
  })
  .superRefine((data, context) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      context.addIssue({ code: 'custom', message: 'End date must be on or after the start date.', path: ['endDate'] })
      return
    }
    const isMultiDay = data.startDate && data.endDate && data.startDate !== data.endDate
    if (isMultiDay) return
    if (!data.startTime) context.addIssue({ code: 'custom', message: 'Start time is required.', path: ['startTime'] })
    if (!data.endTime) context.addIssue({ code: 'custom', message: 'End time is required.', path: ['endTime'] })
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      context.addIssue({ code: 'custom', message: 'End time must be later than start time.', path: ['endTime'] })
    }
    if (data.startTime && data.startTime < '08:00') {
      context.addIssue({ code: 'custom', message: 'The lab opens at 08:00.', path: ['startTime'] })
    }
    if (data.endTime && data.endTime > '18:00') {
      context.addIssue({ code: 'custom', message: 'The lab closes at 18:00.', path: ['endTime'] })
    }
  })

export function BookingFormPage() {
  const { createBooking, pcs } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedPc = pcs.find((pc) => pc.id === searchParams.get('pc') && pc.status === 'Available') || null
  const requestedDate = searchParams.get('date')
  const requestedStart = searchParams.get('start')
  const requestedEnd = searchParams.get('end')
  const today = getBangkokDateKey()
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate || '') && requestedDate >= today ? requestedDate : ''
  const validTimeSelection = /^\d{2}:\d{2}$/.test(requestedStart || '') && /^\d{2}:\d{2}$/.test(requestedEnd || '') && requestedStart >= '08:00' && requestedStart < requestedEnd && requestedEnd <= '18:00'
  const fromCalendar = searchParams.get('source') === 'calendar' && Boolean(requestedPc && validDate && validTimeSelection)
  const initialValues = {
    pcId: fromCalendar ? requestedPc.id : '',
    startDate: fromCalendar ? validDate : '',
    endDate: fromCalendar ? validDate : '',
    startTime: fromCalendar ? requestedStart : '',
    endTime: fromCalendar ? requestedEnd : '',
    purpose: '',
    course: '',
  }
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(bookingSchema), defaultValues: initialValues })
  const [pcId, startDate, endDate] = useWatch({ control, name: ['pcId', 'startDate', 'endDate'] })
  const selectedPc = pcs.find((pc) => pc.id === pcId) || null
  const isMultiDay = Boolean(startDate && endDate && startDate !== endDate)

  const onSubmit = async (values) => {
    const pc = pcs.find((item) => item.id === values.pcId)
    try {
      const booking = await createBooking(values, pc)
      navigate(`/bookings/${booking.id}`)
    } catch (error) {
      setError('root.server', { message: error.message })
    }
  }

  const startDateRegistration = register('startDate', {
    onChange: (event) => {
      const currentEndDate = getValues('endDate')
      if (!currentEndDate || currentEndDate < event.target.value) {
        setValue('endDate', event.target.value, { shouldValidate: true })
      }
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="New request" title="Book a lab PC" description="Your request will be sent to your advisor first, then to the dean for final approval." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-4 sm:p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {fromCalendar && (
              <div className="flex gap-3 rounded-xl border border-mfu-200 bg-mfu-50 p-4 text-sm text-mfu-900">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mfu-700 text-white"><CalendarDays size={17} /></span>
                <div>
                  <p className="font-bold">Time selected from calendar</p>
                  <p className="mt-1 leading-6 text-mfu-700">{requestedPc.id} · {format(new Date(`${validDate}T00:00:00`), 'EEEE, d MMMM yyyy')} · {requestedStart}–{requestedEnd}. You can adjust these details before submitting.</p>
                </div>
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="PC" required error={errors.pcId?.message}>
                  <Select {...register('pcId')}>
                    <option value="">Select a workstation</option>
                    {pcs.map((pc) => <option key={pc.id} value={pc.id} disabled={pc.status !== 'Available'}>{pc.id} · {pc.room} {pc.status !== 'Available' ? `(${pc.status})` : ''}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="Start date" required error={errors.startDate?.message}>
                <Input type="date" min={format(new Date(), 'yyyy-MM-dd')} {...startDateRegistration} />
              </Field>
              <Field label="End date" required error={errors.endDate?.message} hint="Use the start date for a one-day booking.">
                <Input type="date" min={format(new Date(), 'yyyy-MM-dd')} {...register('endDate')} />
              </Field>
              {isMultiDay ? (
                <div className="flex gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 sm:col-span-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700"><Wifi size={17} /></span>
                  <div>
                    <p className="font-bold">24-hour remote reservation</p>
                    <p className="mt-1 leading-6 text-violet-700">This PC will be reserved continuously from the start date through the end date. Lab opening hours do not apply to remote access.</p>
                  </div>
                </div>
              ) : (
                <>
                  <Field label="Start time" required error={errors.startTime?.message} hint="Lab opens at 08:00.">
                    <Input type="time" min="08:00" max="18:00" step="900" {...register('startTime')} />
                  </Field>
                  <Field label="End time" required error={errors.endTime?.message} hint="Lab closes at 18:00.">
                    <Input type="time" min="08:00" max="18:00" step="900" {...register('endTime')} />
                  </Field>
                </>
              )}
            </div>
            <Field label="Purpose" required error={errors.purpose?.message} hint="Explain what you need the PC for.">
              <Textarea placeholder="e.g. Run the integration tests for our capstone project" {...register('purpose')} />
            </Field>
            <Field label="Course / Project" error={errors.course?.message}>
              <Input placeholder="e.g. SE 498 · Capstone Project" {...register('course')} />
            </Field>
            {errors.root?.server && (
              <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><Info className="mt-0.5 shrink-0" size={18} /><div><p className="font-semibold">Request not submitted</p><p className="mt-1">{errors.root.server.message}</p></div></div>
            )}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
              <Link className="block w-full sm:w-auto" to={fromCalendar ? '/calendar' : '/dashboard'}><Button className="w-full sm:w-auto" type="button" variant="ghost"><ArrowLeft size={17} />{fromCalendar ? 'Back to calendar' : 'Cancel'}</Button></Link>
              <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting}>Submit booking request</Button>
            </div>
          </form>
        </Card>
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <h2 className="flex items-center gap-2 font-bold text-slate-900"><Monitor size={18} className="text-mfu-700" />Selected workstation</h2>
            {selectedPc ? <div className="mt-4"><p className="text-2xl font-bold text-slate-950">{selectedPc.id}</p><p className="mt-1 text-sm text-slate-500">{selectedPc.room}</p><p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">{selectedPc.specification}</p></div> : <p className="mt-4 text-sm leading-6 text-slate-500">Choose a PC to view its room and specification.</p>}
            <Link to="/pcs" className="mt-4 inline-flex text-sm font-semibold text-mfu-700 hover:text-mfu-900">View all lab PCs →</Link>
          </Card>
          <Card className="p-4 sm:p-5">
            <h2 className="font-bold text-slate-900">Before you submit</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-mfu-700" /> One day uses normal lab opening hours.</li>
              <li className="flex gap-2"><Wifi size={16} className="mt-0.5 shrink-0 text-mfu-700" /> Two or more days enable 24-hour remote access.</li>
              <li className="flex gap-2"><Clock3 size={16} className="mt-0.5 shrink-0 text-mfu-700" /> Conflicts are checked for the entire reservation.</li>
              <li className="flex gap-2"><Info size={16} className="mt-0.5 shrink-0 text-mfu-700" /> Approval is required before use.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
