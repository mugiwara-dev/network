import { useState, useEffect } from 'react'

/**
 * Returns true when viewport width <= 768px (phone / small tablet).
 * Re-evaluates on resize.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

/**
 * Returns true when viewport width <= 480px (small phone portrait).
 */
export function useIsSmallPhone() {
  const [isSmall, setIsSmall] = useState(() => window.innerWidth <= 480)
  useEffect(() => {
    const handler = () => setIsSmall(window.innerWidth <= 480)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isSmall
}
