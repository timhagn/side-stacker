'use client'
import { GameStack } from '@/types/dbTypes'
import { whoAmI } from '@/utils/playerUtils'
import { useClient } from '@/hooks/useClient'

interface PlayerInfoProps {
  gameState: GameStack
}
export default function PlayerInfo({ gameState }: PlayerInfoProps) {
  const isClient = useClient()
  const playerText = whoAmI(gameState)
  return (
    <div className="mt-6 text-center">
      <h1>{isClient ? playerText : ''}</h1>
    </div>
  )
}
