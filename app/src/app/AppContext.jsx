/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getCurrentProfile, getSession, onAuthStateChange, signInWithGoogle as signInService, signOut as signOutService, updateMyUniversityId } from '../features/auth/authService'
import {
  approveBooking,
  cancelBooking,
  createBooking as createBookingService,
  getBookings,
  getCalendarBookings,
  rejectBooking,
} from '../features/bookings/bookingService'
import { getPcs } from '../features/pcs/pcService'
import { isSupabaseConfigured } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [calendarBookings, setCalendarBookings] = useState([])
  const [pcs, setPcs] = useState([])
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [appError, setAppError] = useState(null)
  const [toast, setToast] = useState(null)
  const calendarRange = useRef(null)
  const toastTimer = useRef(null)

  const notify = useCallback((message, tone = 'success') => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ message, tone, id: Date.now() })
    toastTimer.current = window.setTimeout(() => {
      setToast(null)
      toastTimer.current = null
    }, 3200)
  }, [])

  const clearWorkspace = useCallback(() => {
    setUser(null)
    setBookings([])
    setCalendarBookings([])
    setPcs([])
    calendarRange.current = null
  }, [])

  const refreshWorkspace = useCallback(async () => {
    const [nextBookings, nextPcs] = await Promise.all([getBookings(), getPcs()])
    setBookings(nextBookings)
    setPcs(nextPcs)
  }, [])

  const refreshCalendar = useCallback(async (startDate, endDate) => {
    calendarRange.current = { startDate, endDate }
    const nextBookings = await getCalendarBookings(startDate, endDate)
    setCalendarBookings(nextBookings)
  }, [])

  const refreshAfterMutation = useCallback(async () => {
    await refreshWorkspace()
    if (calendarRange.current) {
      await refreshCalendar(calendarRange.current.startDate, calendarRange.current.endDate)
    }
  }, [refreshCalendar, refreshWorkspace])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let active = true
    getSession()
      .then((initialSession) => {
        if (active) setSession(initialSession)
      })
      .catch((error) => {
        if (active) setAppError(error.message)
      })
      .finally(() => {
        if (active) setAuthReady(true)
      })

    const unsubscribe = onAuthStateChange((nextSession) => {
      setSession(nextSession)
      setAuthReady(true)
      setAppError(null)
      if (!nextSession) {
        clearWorkspace()
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [clearWorkspace])

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
  }, [])

  useEffect(() => {
    let active = true
    if (!session) return undefined

    Promise.all([getCurrentProfile(session.user.id), getBookings(), getPcs()])
      .then(([profile, nextBookings, nextPcs]) => {
        if (!active) return
        setUser(profile)
        setBookings(nextBookings)
        setPcs(nextPcs)
        setAppError(null)
      })
      .catch((error) => {
        if (!active) return
        clearWorkspace()
        setAppError(error.message)
      })

    return () => {
      active = false
    }
  }, [clearWorkspace, session])

  const signInWithGoogle = async () => {
    setAppError(null)
    await signInService()
  }

  const logout = async () => {
    setAppError(null)
    try {
      await signOutService()
      setSession(null)
      clearWorkspace()
    } catch (error) {
      setAppError(error.message)
      notify(error.message, 'error')
      throw error
    }
  }

  const runMutation = async (operation, successMessage, tone = 'success') => {
    try {
      const result = await operation()
      await refreshAfterMutation()
      notify(successMessage, tone)
      return result
    } catch (error) {
      notify(error.message, 'error')
      throw error
    }
  }

  const actions = {
    createBooking: (input, pc) => runMutation(
      () => createBookingService(input, pc),
      user?.role === 'student'
        ? 'Request submitted for Technician approval.'
        : user?.role === 'technician'
          ? 'Request submitted for Advisor approval.'
        : user?.role === 'advisor'
          ? 'Request submitted for Dean approval.'
          : 'Booking approved and reserved.',
    ),
    approveAsTechnician: (id) => runMutation(
      () => approveBooking(id),
      'Request approved and sent to the advisor.',
    ),
    rejectAsTechnician: (id, reason) => runMutation(
      () => rejectBooking(id, reason),
      'Request rejected.',
      'error',
    ),
    approveAsAdvisor: (id) => runMutation(
      () => approveBooking(id),
      'Request approved and sent to the dean.',
    ),
    rejectAsAdvisor: (id, reason) => runMutation(
      () => rejectBooking(id, reason),
      'Request rejected.',
      'error',
    ),
    approveAsDean: (id) => runMutation(
      () => approveBooking(id),
      'Booking approved successfully.',
    ),
    rejectAsDean: (id, reason) => runMutation(
      () => rejectBooking(id, reason),
      'Request rejected.',
      'error',
    ),
    cancelOwnBooking: (id, reason) => runMutation(
      () => cancelBooking(id, reason),
      'Booking cancelled and the PC time was released.',
    ),
    updateStudentId: async (universityId) => {
      const trimmed = universityId.trim()
      try {
        await updateMyUniversityId(trimmed)
        setUser((current) => ({ ...current, studentId: trimmed }))
        notify('Student ID saved.')
      } catch (error) {
        notify(error.message, 'error')
        throw error
      }
    },
  }

  const workspaceLoading = Boolean(session && !user && !appError)

  return (
    <AppContext.Provider value={{
      session,
      user,
      bookings,
      calendarBookings,
      pcs,
      toast,
      authReady,
      workspaceLoading,
      appError,
      isSupabaseConfigured,
      signInWithGoogle,
      logout,
      refreshWorkspace,
      refreshCalendar,
      ...actions,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
