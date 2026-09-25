import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ArrowLeft, CalendarDays, Clock3, IdCard, Info, Monitor, Wifi } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { Field, Input, Select, Textarea } from '../../components/ui/FormFields'
import { useLanguage } from '../../i18n/LanguageContext'
import {
  LAB_CLOSE_TIME,
  LAB_OPEN_TIME,
  getBangkokDateKey,
  getEarliestBookableTime,
} from '../../utils/booking'

function createBookingSchema(t) {
  return z
    .object({
      pcId: z.string().min(1, t('form.pcRequired')),
      startDate: z.string().min(1, t('form.startDateRequired')).refine(
        (date) => !date || date >= getBangkokDateKey(),
        t('form.pastDateError'),
      ),
      endDate: z.string().min(1, t('form.endDateRequired')),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      purpose: z.string().trim().min(5, t('form.purposeMinError')),
      course: z.string().optional(),
    })
    .superRefine((data, context) => {
      if (data.startDate && data.endDate && data.startDate > data.endDate) {
        context.addIssue({ code: 'custom', message: t('form.endDateOrderError'), path: ['endDate'] })
        return
      }
      const isMultiDay = data.startDate && data.endDate && data.startDate !== data.endDate
      if (isMultiDay) {
        if (data.startDate === getBangkokDateKey()) {
          context.addIssue({ code: 'custom', message: t('form.multiDayStartError'), path: ['startDate'] })
        }
        return
      }
      if (!data.startTime) context.addIssue({ code: 'custom', message: t('form.startTimeRequired'), path: ['startTime'] })
      if (!data.endTime) context.addIssue({ code: 'custom', message: t('form.endTimeRequired'), path: ['endTime'] })
      if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        context.addIssue({ code: 'custom', message: t('form.endTimeOrderError'), path: ['endTime'] })
      }
      if (data.startTime && data.startTime < LAB_OPEN_TIME) {
        context.addIssue({ code: 'custom', message: t('form.labOpensError'), path: ['startTime'] })
      }
      if (data.endTime && data.endTime > LAB_CLOSE_TIME) {
        context.addIssue({ code: 'custom', message: t('form.labClosesError'), path: ['endTime'] })
      }
      if (data.startDate === getBangkokDateKey() && data.startTime) {
        const earliestTime = getEarliestBookableTime(data.startDate)
        if (!earliestTime) {
          context.addIssue({ code: 'custom', message: t('form.noTimesRemainError'), path: ['startTime'] })
        } else if (data.startTime < earliestTime) {
          context.addIssue({ code: 'custom', message: t('form.chooseLaterTimeError', { time: earliestTime }), path: ['startTime'] })
        }
      }
    })
}

export function BookingFormPage() {
  const { createBooking, pcs, user } = useApp()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentTime, setCurrentTime] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const requestedPc = pcs.find((pc) => pc.id === searchParams.get('pc') && pc.status === 'Available') || null
  const requestedDate = searchParams.get('date')
  const requestedStart = searchParams.get('start')
  const requestedEnd = searchParams.get('end')
  const today = getBangkokDateKey(currentTime)
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate || '') && requestedDate >= today ? requestedDate : ''
  const earliestRequestedTime = validDate ? getEarliestBookableTime(validDate, currentTime) : null
  const validTimeSelection = Boolean(earliestRequestedTime) && /^\d{2}:\d{2}$/.test(requestedStart || '') && /^\d{2}:\d{2}$/.test(requestedEnd || '') && requestedStart >= earliestRequestedTime && requestedStart < requestedEnd && requestedEnd <= LAB_CLOSE_TIME
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
  const bookingSchema = useMemo(() => createBookingSchema(t), [t])
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
  const multiDayStartsToday = isMultiDay && startDate === today
  const earliestStartTime = startDate ? getEarliestBookableTime(startDate, currentTime) : LAB_OPEN_TIME
  const noTimesRemaining = !isMultiDay && startDate === today && !earliestStartTime
  const missingStudentId = user.role === 'student' && !user.studentId

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

  const formDescription = user.role === 'student'
    ? t('form.descriptionStudent')
    : user.role === 'technician'
      ? t('form.descriptionTechnician')
    : user.role === 'advisor'
      ? t('form.descriptionAdvisor')
      : t('form.descriptionOther')

  const approvalTip = user.role === 'student'
    ? t('form.tipApprovalStudent')
    : user.role === 'technician'
      ? t('form.tipApprovalTechnician')
    : user.role === 'advisor'
      ? t('form.tipApprovalAdvisor')
      : t('form.tipApprovalOther')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('form.newRequestEyebrow')}
        title={t('form.title')}
        description={formDescription}
      />
      {missingStudentId && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
          <IdCard className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-semibold">{t('form.missingStudentIdTitle')}</p>
            <p className="mt-1 leading-6">
              {t('form.missingStudentIdDescription')}{' '}
              <Link to="/profile" className="font-semibold underline underline-offset-2">{t('form.setStudentIdOnProfile')}</Link>{' '}
              {t('form.beforeSubmittingRequest')}
            </p>
          </div>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-4 sm:p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {fromCalendar && (
              <div className="flex gap-3 rounded-xl border border-mfu-200 bg-mfu-50 p-4 text-sm text-mfu-900">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mfu-700 text-white"><CalendarDays size={17} /></span>
                <div>
                  <p className="font-bold">{t('form.timeSelectedFromCalendar')}</p>
                  <p className="mt-1 leading-6 text-mfu-700">{requestedPc.id} · {format(new Date(`${validDate}T00:00:00`), 'EEEE, d MMMM yyyy')} · {requestedStart}–{requestedEnd}. {t('form.adjustBeforeSubmitting')}</p>
                </div>
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label={t('common.pc')} required error={errors.pcId?.message}>
                  <Select {...register('pcId')}>
                    <option value="">{t('form.selectWorkstation')}</option>
                    {pcs.map((pc) => <option key={pc.id} value={pc.id} disabled={pc.status !== 'Available'}>{pc.id} · {pc.room} {pc.status !== 'Available' ? `(${t(`pcStatus.${pc.status}`)})` : ''}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label={t('form.startDate')} required error={errors.startDate?.message}>
                <Input type="date" min={today} {...startDateRegistration} />
              </Field>
              <Field label={t('form.endDate')} required error={errors.endDate?.message} hint={t('form.endDateHint')}>
                <Input type="date" min={today} {...register('endDate')} />
              </Field>
              {isMultiDay ? (
                <div className={`flex gap-3 rounded-xl border p-4 text-sm sm:col-span-2 ${multiDayStartsToday ? 'border-red-200 bg-red-50 text-red-900' : 'border-violet-200 bg-violet-50 text-violet-900'}`}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${multiDayStartsToday ? 'bg-red-100 text-red-700' : 'bg-violet-100 text-violet-700'}`}><Wifi size={17} /></span>
                  <div>
                    <p className="font-bold">{multiDayStartsToday ? t('form.chooseFutureStartDate') : t('form.remoteReservationTitle')}</p>
                    <p className={`mt-1 leading-6 ${multiDayStartsToday ? 'text-red-700' : 'text-violet-700'}`}>{multiDayStartsToday ? t('form.remoteReservationTodayError') : t('form.remoteReservationDescription')}</p>
                  </div>
                </div>
              ) : (
                <>
                  <Field label={t('form.startTime')} required error={errors.startTime?.message} hint={startDate === today && earliestStartTime ? t('form.earliestStartHint', { time: earliestStartTime }) : t('form.labOpensHint')}>
                    <Input type="time" min={earliestStartTime || LAB_CLOSE_TIME} max={LAB_CLOSE_TIME} step="900" disabled={noTimesRemaining} {...register('startTime')} />
                  </Field>
                  <Field label={t('form.endTime')} required error={errors.endTime?.message} hint={t('form.labClosesHint')}>
                    <Input type="time" min={LAB_OPEN_TIME} max={LAB_CLOSE_TIME} step="900" disabled={noTimesRemaining} {...register('endTime')} />
                  </Field>
                  {noTimesRemaining && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:col-span-2">{t('form.noTimesRemainError')}</div>}
                </>
              )}
            </div>
            <Field label={t('common.purpose')} required error={errors.purpose?.message} hint={t('form.purposeHint')}>
              <Textarea placeholder={t('form.purposePlaceholder')} {...register('purpose')} />
            </Field>
            <Field label={t('bookingDetail.courseProject')} error={errors.course?.message}>
              <Input placeholder={t('form.coursePlaceholder')} {...register('course')} />
            </Field>
            {errors.root?.server && (
              <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><Info className="mt-0.5 shrink-0" size={18} /><div><p className="font-semibold">{t('form.requestNotSubmitted')}</p><p className="mt-1">{errors.root.server.message}</p></div></div>
            )}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
              <Link className="block w-full sm:w-auto" to={fromCalendar ? '/calendar' : '/dashboard'}><Button className="w-full sm:w-auto" type="button" variant="ghost"><ArrowLeft size={17} />{fromCalendar ? t('form.backToCalendar') : t('common.cancel')}</Button></Link>
              <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting || noTimesRemaining || multiDayStartsToday || missingStudentId}>{t('form.submitRequest')}</Button>
            </div>
          </form>
        </Card>
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <h2 className="flex items-center gap-2 font-bold text-slate-900"><Monitor size={18} className="text-mfu-700" />{t('form.selectedWorkstation')}</h2>
            {selectedPc ? <div className="mt-4"><p className="text-2xl font-bold text-slate-950">{selectedPc.id}</p><p className="mt-1 text-sm text-slate-500">{selectedPc.room}</p><p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">{selectedPc.specification}</p></div> : <p className="mt-4 text-sm leading-6 text-slate-500">{t('form.chooseAPcHint')}</p>}
            <Link to="/pcs" className="mt-4 inline-flex text-sm font-semibold text-mfu-700 hover:text-mfu-900">{t('form.viewAllPcs')}</Link>
          </Card>
          <Card className="p-4 sm:p-5">
            <h2 className="font-bold text-slate-900">{t('form.beforeYouSubmit')}</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-mfu-700" /> {t('form.tipOneDay')}</li>
              <li className="flex gap-2"><Wifi size={16} className="mt-0.5 shrink-0 text-mfu-700" /> {t('form.tipMultiDay')}</li>
              <li className="flex gap-2"><Clock3 size={16} className="mt-0.5 shrink-0 text-mfu-700" /> {t('form.tipConflicts')}</li>
              <li className="flex gap-2"><Info size={16} className="mt-0.5 shrink-0 text-mfu-700" /> {approvalTip}</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
