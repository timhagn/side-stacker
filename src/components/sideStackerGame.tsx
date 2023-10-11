'use server'

import GameBoard from '@/components/gameBoard'
import { Database } from 'sqlite'
import { loadGameForPlayer, openDb } from '@/lib/sqliteDb'
import { cookies } from 'next/headers'
import { SESSION_ID_COOKIE_NAME } from '@/utils/cookieUtils'

let db: Database | undefined

export default async function SideStackerGame() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_ID_COOKIE_NAME)
  console.log(sessionId)
  let gameBoardState
  if (sessionId?.value) {
    // TODO: do something with this (and create the board)
    gameBoardState = await loadGameForPlayer(sessionId?.value)
  }
  if (!db) {
    // Just let us be sure that the DB exists during warm-up.
    await openDb()
  }
  return <GameBoard />
}
