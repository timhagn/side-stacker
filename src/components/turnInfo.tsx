'use client'

import { useClient } from '@/hooks/useClient'
import { GameStack } from '@/types/dbTypes'
import { PlayStates } from '@/types/gameStateTypes'
import { getTurnInfoText } from '@/utils/playerUtils'

interface TurnInfoProps {
  gameState: GameStack
  playState: PlayStates
}

export default function TurnInfo({ gameState, playState }: TurnInfoProps) {
  const isClient = useClient()
  const turnText = getTurnInfoText(gameState, playState)
  return (
    <div className="mt-6 text-center">
      <h3 className="text-lg">{isClient ? turnText : ''}</h3>
    </div>
  )
}
