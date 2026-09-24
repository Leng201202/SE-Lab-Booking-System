/* eslint-disable react-refresh/only-export-components */
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { ApprovalHistoryPage, PendingRequestsPage } from '../features/approvals/ApprovalListPage'
import { AuthCallbackPage, LoginPage } from '../features/auth/LoginPage'
import { ProfilePage } from '../features/auth/ProfilePage'
import { BookingDetailPage } from '../features/bookings/BookingDetailPage'
import { BookingFormPage } from '../features/bookings/BookingFormPage'
import { MyBookingsPage } from '../features/bookings/MyBookingsPage'
import { CalendarPage } from '../features/calendar/CalendarPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { PcListPage } from '../features/pcs/PcListPage'
import { PcManagementPage } from '../features/pcs/PcManagementPage'
import { AdviseeManagementPage, UserManagementPage } from '../features/users/UserManagementPage'
import { useApp } from './AppContext'

function RequireSession() {
  const { user, authReady, workspaceLoading, appError, logout } = useApp()
  if (!authReady || workspaceLoading) return <FullPageStatus message="Loading your secure workspace…" />
  if (appError && !user) return <FullPageStatus message={appError} action={logout} />
  return user ? <AppShell /> : <Navigate to="/login" replace />
}

function FullPageStatus({ message, action }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f8f5] p-4">
      <Card className="max-w-lg p-6 text-center">
        <p className="text-sm leading-6 text-slate-600">{message}</p>
        {action && <button className="mt-4 text-sm font-semibold text-mfu-700" onClick={action}>Return to sign in</button>}
      </Card>
    </main>
  )
}

function AdvisorOnly({ children }) {
  const { user } = useApp()
  return user?.role === 'advisor' ? children : <Navigate to="/dashboard" replace />
}

function DeanOnly({ children }) {
  const { user } = useApp()
  return user?.role === 'dean' ? children : <Navigate to="/dashboard" replace />
}

function PcManagerOnly({ children }) {
  const { user } = useApp()
  return user?.role === 'technician' || user?.role === 'dean' ? children : <Navigate to="/dashboard" replace />
}

function ReviewerOnly({ children }) {
  const { user } = useApp()
  return ['technician', 'advisor', 'dean'].includes(user?.role) ? children : <Navigate to="/dashboard" replace />
}

function LoginRoute() {
  const { user, authReady } = useApp()
  if (!authReady) return <FullPageStatus message="Checking your session…" />
  return user ? <Navigate to="/dashboard" replace /> : <LoginPage />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginRoute /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  {
    element: <RequireSession />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/book', element: <BookingFormPage /> },
      { path: '/bookings', element: <MyBookingsPage /> },
      { path: '/bookings/:id', element: <BookingDetailPage /> },
      { path: '/requests/pending', element: <ReviewerOnly><PendingRequestsPage /></ReviewerOnly> },
      { path: '/requests/history', element: <ReviewerOnly><ApprovalHistoryPage /></ReviewerOnly> },
      { path: '/pcs', element: <PcListPage /> },
      { path: '/manage/advisees', element: <AdvisorOnly><AdviseeManagementPage /></AdvisorOnly> },
      { path: '/admin/users', element: <DeanOnly><UserManagementPage /></DeanOnly> },
      { path: '/admin/pcs', element: <PcManagerOnly><PcManagementPage /></PcManagerOnly> },
      { path: '/calendar', element: <CalendarPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
