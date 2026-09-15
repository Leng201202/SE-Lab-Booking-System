import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatBookingDateRange, formatBookingTime } from '../../utils/booking'
import { Badge, StatusBadge } from './StatusBadge'

export function BookingTable({ bookings, showStudent = false, showAdvisor = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3.5 font-semibold">Request</th>
            {showStudent && <th className="px-5 py-3.5 font-semibold">Student</th>}
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
              <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{booking.id}</td>
              {showStudent && (
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800">{booking.studentName}</p>
                  <p className="text-xs text-slate-400">{booking.studentNumber}</p>
                </td>
              )}
              {showAdvisor && <td className="px-5 py-4"><Badge tone="green">Advisor approved</Badge></td>}
              <td className="px-5 py-4">
                <p className="font-semibold text-mfu-700">{booking.pcId}</p>
                <p className="mt-0.5 text-xs text-slate-500">{formatBookingDateRange(booking)}</p>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatBookingTime(booking)}</td>
              <td className="max-w-56 truncate px-5 py-4 text-slate-600">{booking.purpose}</td>
              <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
              <td className="px-3 py-4">
                <Link to={`/bookings/${booking.id}`} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-mfu-50 hover:text-mfu-700" aria-label={`Open ${booking.id}`}>
                  <ChevronRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
