/* eslint-disable react-refresh/only-export-components */
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ApprovalHistoryPage, PendingRequestsPage } from '../features/approvals/ApprovalListPage'
import { LoginPage } from '../features/auth/LoginPage'
import { ProfilePage } from '../features/auth/ProfilePage'
import { BookingDetailPage } from '../features/bookings/BookingDetailPage'
import { BookingFormPage } from '../features/bookings/BookingFormPage'
import { MyBookingsPage } from '../features/bookings/MyBookingsPage'
import { CalendarPage } from '../features/calendar/CalendarPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { PcListPage } from '../features/pcs/PcListPage'
import { useApp } from './AppContext'

function RequireSession() {
  const { user } = useApp()
  return user ? <AppShell /> : <Navigate to="/login" replace />
}

function StudentOnly({ children }) {
  const { user } = useApp()
  return user?.role === 'student' ? children : <Navigate to="/dashboard" replace />
}

function ReviewerOnly({ children }) {
  const { user } = useApp()
  return user?.role === 'advisor' || user?.role === 'dean' ? children : <Navigate to="/dashboard" replace />
}

function LoginRoute() {
  const { user } = useApp()
  return user ? <Navigate to="/dashboard" replace /> : <LoginPage />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginRoute /> },
  {
    element: <RequireSession />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/book', element: <StudentOnly><BookingFormPage /></StudentOnly> },
      { path: '/bookings', element: <StudentOnly><MyBookingsPage /></StudentOnly> },
      { path: '/bookings/:id', element: <BookingDetailPage /> },
      { path: '/requests/pending', element: <ReviewerOnly><PendingRequestsPage /></ReviewerOnly> },
      { path: '/requests/history', element: <ReviewerOnly><ApprovalHistoryPage /></ReviewerOnly> },
      { path: '/pcs', element: <StudentOnly><PcListPage /></StudentOnly> },
      { path: '/calendar', element: <CalendarPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
