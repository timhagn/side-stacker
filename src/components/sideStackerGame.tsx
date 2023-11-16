'use server'

import GameBoard from '@/components/gameBoard'
import {
  getMovesInGame,
  joinGameOrNewGame,
  loadGameForPlayer,
} from '@/lib/sqliteDb'
import { cookies } from 'next/headers'
import { SESSION_ID_COOKIE_NAME } from '@/utils/cookieUtils'
import {
  buildBoardState,
  getCurrentPlayState,
  getInitialGameState,
  initializeBoard,
} from '@/utils/gameUtils'
import { PlayStates } from '@/types/gameStateTypes'

export default async function SideStackerGame() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_ID_COOKIE_NAME)
  console.log('SESSION ID', sessionId)
  let gameBoardState
  let playState = PlayStates.waiting
  let initialBoard = initializeBoard()
  if (sessionId?.value) {
    gameBoardState = await loadGameForPlayer(sessionId.value)
    if (gameBoardState?.id === -1) {
      gameBoardState = await joinGameOrNewGame(sessionId.value)
    }
    const moves = await getMovesInGame(gameBoardState!.id)
    initialBoard = buildBoardState(moves, gameBoardState!)
    playState = getInitialGameState(gameBoardState!, moves)
  }
  return (
    <GameBoard
      gameBoard={initialBoard}
      initialGameState={gameBoardState!}
      playState={playState}
    />
  )
}
