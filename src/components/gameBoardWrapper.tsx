'use client'

import dynamic from 'next/dynamic'
import { GameBoardProps } from '@/types/gameStateTypes'
import { useEffect, useState } from 'react'

const GameBoard = dynamic(() => import('./gameBoard'), {
  loading: () => <p className="text-4xl h-1/2">Initializing...</p>,
})

export default function GameBoardWrapper(gameBoardProps: GameBoardProps) {
  const [serverActive, setServerActive] = useState(false)

  useEffect(() => {
    const initSocketServer = async () => {
      await fetch('/api/socket')
      setServerActive(true)
    }
    if (!serverActive) {
      void initSocketServer()
    }
  })
  return serverActive ? <GameBoard {...gameBoardProps} /> : null
}
