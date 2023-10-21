import { useEffect, useMemo, useState } from 'react'

export const useClient = () => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return useMemo(() => isClient, [isClient])
}
