'use client'
import { GameStack } from '@/types/dbTypes'
import { whichTurn, whoAmI } from '@/utils/playerUtils'
import { useClient } from '@/hooks/useClient'

interface TurnInfoProps {
  gameState: GameStack
}

export default function TurnInfo({ gameState }: TurnInfoProps) {
  const isClient = useClient()
  const turnText = whichTurn(gameState)
  return (
    <div className="mt-6 text-center">
      <h2>{isClient ? turnText : ''}</h2>
    </div>
  )
}
