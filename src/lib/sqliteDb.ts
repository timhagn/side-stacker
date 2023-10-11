'use server'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import {
  CREATE_GAME_TABLE_QUERY,
  CREATE_PLAY_TABLE_QUERY,
  DB_NAME,
  GAME_TABLE,
} from '@/const/dbConstants'
import { GameStack, GameState } from '@/types/dbTypes'

const DB_FILENAME =
  process.env.NODE_ENV === 'production'
    ? `./${DB_NAME}.db`
    : `./${DB_NAME}.dev.db`

export async function openDb() {
  try {
    const db = await open({
      filename: DB_FILENAME,
      driver: sqlite3.Database,
    })
    await db.exec(CREATE_GAME_TABLE_QUERY)
    await db.exec(CREATE_PLAY_TABLE_QUERY)
    return db
  } catch (err: any) {
    console.error(err)
  }
}

export async function newGame(playerOne: string) {
  const db = await openDb()
  if (db) {
    const result = await db.run(
      `INSERT INTO ${GAME_TABLE} (playerOne) VALUES (?)`,
      playerOne,
    )
    console.log(result)
  }
}

export async function loadGameForPlayer(playerId = ''): Promise<GameStack> {
  const db = await openDb()
  if (db) {
    try {
      const result = await db.get(
        `SELECT * FROM ${GAME_TABLE}
         WHERE (playerOne = :playerId
            OR playerTwo = :playerId)
           AND gameState = :gameState`,
        {
          ':playerId': playerId,
          ':gameState': GameState.OPEN,
        },
      )
      if (result) {
        return result
      }
    } catch (err) {
      console.log(err)
    }
  }
  return { id: -1, playerOne: '', playerTwo: '', gameState: GameState.OPEN }
}
