import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatBookingDateRange, formatBookingTime } from '../../utils/booking'
import { Badge, StatusBadge } from './StatusBadge'

export function BookingTable({ bookings, showRequester = false, showAdvisor = false }) {
  return (
    <>
      <div className="divide-y divide-slate-100 md:hidden">
        {bookings.map((booking) => (
          <Link key={booking.id} to={`/bookings/${booking.id}`} className="block p-4 transition active:bg-slate-50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-400">{booking.requestNumber}</p>
                <p className="mt-1 text-lg font-bold text-mfu-700">{booking.pcId}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <StatusBadge status={booking.status} />
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </div>

            {showRequester && (
              <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-800">{booking.requesterName}</p>
                <p className="mt-0.5 text-xs capitalize text-slate-500">{booking.requesterRole} · {booking.requesterNumber}</p>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Date</p>
                <p className="mt-1 font-medium leading-5 text-slate-700">{formatBookingDateRange(booking)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Time</p>
                <p className="mt-1 font-medium leading-5 text-slate-700">{formatBookingTime(booking)}</p>
              </div>
              <div className="col-span-2 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Purpose</p>
                <p className="mt-1 break-words leading-5 text-slate-600">{booking.purpose}</p>
              </div>
            </div>
            {showAdvisor && <div className="mt-3"><Badge tone={booking.advisorDecision === 'not_required' ? 'slate' : 'green'}>{booking.advisorDecision === 'not_required' ? 'Advisor review skipped' : 'Advisor approved'}</Badge></div>}
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3.5 font-semibold">Request</th>
            {showRequester && <th className="px-5 py-3.5 font-semibold">Requester</th>}
            {showAdvisor && <th className="px-5 py-3.5 font-semibold">Advisor review</th>}
            <th className="px-5 py-3.5 font-semibold">PC & dates</th>
            <th className="px-5 py-3.5 font-semibold">Time</th>
            <th className="px-5 py-3.5 font-semibold">Purpose</th>
            <th className="px-5 py-3.5 font-semibold">Status</th>
            <th className="w-12 px-3"><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bookings.map((booking) => (
            <tr key={booking.id} className="transition hover:bg-slate-50/70">
              <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{booking.requestNumber}</td>
              {showRequester && (
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800">{booking.requesterName}</p>
                  <p className="text-xs capitalize text-slate-400">{booking.requesterRole} · {booking.requesterNumber}</p>
                </td>
              )}
              {showAdvisor && <td className="px-5 py-4"><Badge tone={booking.advisorDecision === 'not_required' ? 'slate' : 'green'}>{booking.advisorDecision === 'not_required' ? 'Not required' : 'Advisor approved'}</Badge></td>}
              <td className="px-5 py-4">
                <p className="font-semibold text-mfu-700">{booking.pcId}</p>
                <p className="mt-0.5 text-xs text-slate-500">{formatBookingDateRange(booking)}</p>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatBookingTime(booking)}</td>
              <td className="max-w-56 truncate px-5 py-4 text-slate-600">{booking.purpose}</td>
              <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
              <td className="px-3 py-4">
                <Link to={`/bookings/${booking.id}`} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-mfu-50 hover:text-mfu-700" aria-label={`Open ${booking.requestNumber}`}>
                  <ChevronRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </>
  )
}
