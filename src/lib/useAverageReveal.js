import { useEffect, useState } from 'react'
import { useDerived } from '../store/derived'

/**
 * Gère la découverte volontaire de la moyenne générale :
 * l'élève clique, une courte phase de calcul s'affiche, puis la moyenne apparaît.
 */
export function useAverageReveal(delay = 1700) {
  const { settings, actions, generalAverage } = useDerived()
  const revealed = Boolean(settings.revealAverage)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    if (!revealed) return undefined
    setCalculating(false)
    return undefined
  }, [revealed])

  useEffect(() => {
    if (!calculating) return undefined
    const timer = window.setTimeout(() => {
      actions.updateSettings({ revealAverage: true })
      setCalculating(false)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [calculating, delay, actions])

  return {
    average: generalAverage,
    revealed,
    calculating: calculating && !revealed,
    reveal: () => setCalculating(true),
    hide: () => actions.updateSettings({ revealAverage: false }),
  }
}
