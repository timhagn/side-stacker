'use client'

import { useClient } from '@/hooks/useClient'
import { GameStack } from '@/types/dbTypes'
import { getPlayerColor, whoAmI } from '@/utils/playerUtils'

interface PlayerInfoProps {
  gameState: GameStack
}
export default function PlayerInfo({ gameState }: PlayerInfoProps) {
  const isClient = useClient()
  const playerText = whoAmI(gameState)
  // playerColor can be text-emerald-600 or text-red-400.
  const playerColor = getPlayerColor(playerText)
  return (
    <div className={`mt-6 text-center ${playerColor}`}>
      <h2 className="text-xl">{isClient ? playerText : <>&nbsp;</>}</h2>
    </div>
  )
}
