import { useCallback, useEffect, useState } from 'react'
import { getBookingAdvisors } from './bookingService'

export function useBookingAdvisors(enabled) {
  const [advisors, setAdvisors] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined
    let active = true
    getBookingAdvisors()
      .then((nextAdvisors) => { if (active) setAdvisors(nextAdvisors) })
      .catch((nextError) => { if (active) setError(nextError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [enabled, attempt])

  const retry = useCallback(() => {
    setLoading(true)
    setError('')
    setAttempt((current) => current + 1)
  }, [])

  return { advisors, loading, error, retry }
}
