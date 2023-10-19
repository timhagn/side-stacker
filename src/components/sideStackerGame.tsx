'use server'

import GameBoard from '@/components/gameBoard'
import { Database } from 'sqlite'
import {
  getMovesInGame,
  joinGameOrNewGame,
  loadGameForPlayer,
  openDb,
} from '@/lib/sqliteDb'
import { cookies } from 'next/headers'
import { SESSION_ID_COOKIE_NAME } from '@/utils/cookieUtils'
import { GamePieceStates } from '@/types/gameStateTypes'
import { buildBoardState, initializeBoard } from '@/utils/gameUtils'

let db: Database | undefined

export default async function SideStackerGame() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_ID_COOKIE_NAME)
  console.log('SESSION ID', sessionId)
  let gameBoardState
  let initialBoard = initializeBoard()
  if (sessionId?.value) {
    // TODO: do something with this (and create the board)
    gameBoardState = await loadGameForPlayer(sessionId.value)
    if (gameBoardState?.id === -1) {
      gameBoardState = await joinGameOrNewGame(sessionId.value)
    }
    const moves = await getMovesInGame(gameBoardState.id)
    initialBoard = buildBoardState(moves, gameBoardState)
  }
  if (!db) {
    // Just let us be sure that the DB exists during warm-up.
    await openDb()
  }
  return <GameBoard gameBoard={initialBoard} />
}
