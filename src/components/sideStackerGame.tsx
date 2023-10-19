'use server'

import GameBoard from '@/components/gameBoard'
import { Database } from 'sqlite'
import { joinGameOrNewGame, loadGameForPlayer, openDb } from '@/lib/sqliteDb'
import { cookies } from 'next/headers'
import { SESSION_ID_COOKIE_NAME } from '@/utils/cookieUtils'
import { GamePieceState } from '@/types/gameStateTypes'

let db: Database | undefined

const dummyBoard: GamePieceState[][] = Array(7).fill(
  Array(7).fill(GamePieceState.empty),
)

export default async function SideStackerGame() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_ID_COOKIE_NAME)
  console.log('SESSION ID', sessionId)
  let gameBoardState
  if (sessionId?.value) {
    // TODO: do something with this (and create the board)
    gameBoardState = await loadGameForPlayer(sessionId.value)
    if (gameBoardState?.id === -1) {
      const result = await joinGameOrNewGame(sessionId.value)
      console.log(result)
    }
  }
  if (!db) {
    // Just let us be sure that the DB exists during warm-up.
    await openDb()
  }
  return <GameBoard gameBoard={dummyBoard} />
}
