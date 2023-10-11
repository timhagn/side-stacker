'use server'

import GameBoard from '@/components/gameBoard'
import { Database } from 'sqlite'
import { openDb } from '@/lib/sqliteDb'

let db: Database | undefined

export default async function SideStackerGame() {
  if (!db) {
    db = await openDb()
  }
  return <GameBoard />
}
