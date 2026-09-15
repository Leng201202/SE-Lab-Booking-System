/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import { demoUsers } from '../data/mockUsers'
import {
  approveAsAdvisor as approveAdvisorService,
  approveAsDean as approveDeanService,
  createBooking as createBookingService,
  getBookings,
  rejectAsAdvisor as rejectAdvisorService,
  rejectAsDean as rejectDeanService,
  resetDemoBookings,
} from '../features/bookings/bookingService'

const USER_KEY = 'se-lab-demo-user-role'
const AppContext = createContext(null)

function initialUser() {
  const role = localStorage.getItem(USER_KEY)
  return demoUsers[role] || null
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(initialUser)
  const [bookings, setBookings] = useState(getBookings)
  const [toast, setToast] = useState(null)

  const notify = (message, tone = 'success') => {
    setToast({ message, tone, id: Date.now() })
    window.setTimeout(() => setToast(null), 3200)
  }

  const selectRole = (role) => {
    const nextUser = demoUsers[role]
    localStorage.setItem(USER_KEY, role)
    setUser(nextUser)
  }

  const logout = () => {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const refresh = () => setBookings(getBookings())

  const actions = useMemo(
    () => ({
      createBooking(input, pc) {
        const booking = createBookingService(input, user, pc)
        refresh()
        notify('Request submitted for advisor approval.')
        return booking
      },
      approveAsAdvisor(id) {
        approveAdvisorService(id)
        refresh()
        notify('Request approved and sent to the dean.')
      },
      rejectAsAdvisor(id, reason) {
        rejectAdvisorService(id, reason)
        refresh()
        notify('Request rejected.', 'error')
      },
      approveAsDean(id) {
        approveDeanService(id)
        refresh()
        notify('Booking approved successfully.')
      },
      rejectAsDean(id, reason) {
        rejectDeanService(id, reason)
        refresh()
        notify('Request rejected.', 'error')
      },
      resetDemo() {
        setBookings(resetDemoBookings())
        notify('Demo data restored.')
      },
    }),
    [user],
  )

  return (
    <AppContext.Provider value={{ user, bookings, toast, selectRole, logout, ...actions }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
