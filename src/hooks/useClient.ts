import { useEffect, useMemo, useState } from 'react'

/**
 * Hook to determine if we are on the Client (as useEffect() isn't called on the
 * Server) to prevent Render Errors.
 *
 * @returns {boolean}
 */
export const useClient = (): boolean => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return useMemo(() => isClient, [isClient])
}
