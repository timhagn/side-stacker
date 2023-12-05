'use server'

import { cookies } from 'next/headers'

import {
  getMovesInGame,
  joinGameOrNewGame,
  loadGameForPlayer,
} from '@/lib/sqliteDb'
import { PlayStates } from '@/types/gameStateTypes'
import { SESSION_ID_COOKIE_NAME } from '@/utils/cookieUtils'
import {
  buildBoardState,
  getInitialGameState,
  initializeBoard,
} from '@/utils/gameUtils'
import GameBoardWrapper from '@/components/gameBoardWrapper'

export default async function SideStackerGame() {
  // First check for an existing session ID (player ID).
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_ID_COOKIE_NAME)
  // Initialize Board.
  let gameBoardState
  let playState = PlayStates.waiting
  let initialBoard = initializeBoard()
  // Do we have a session ID? Load an existing game & join it or start a new one.
  if (sessionId?.value) {
    gameBoardState = await loadGameForPlayer(sessionId.value)
    if (gameBoardState?.id === -1) {
      gameBoardState = await joinGameOrNewGame(sessionId.value)
    }
    // Now build the initial Board & set up Board & Play States.
    const moves = await getMovesInGame(gameBoardState!.id)
    initialBoard = buildBoardState(moves, gameBoardState!)
    playState = getInitialGameState(gameBoardState!, moves)
  }
  return (
    <GameBoardWrapper
      gameBoard={initialBoard}
      initialGameState={gameBoardState!}
      playState={playState}
    />
  )
}
