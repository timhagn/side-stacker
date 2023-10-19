'use server'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import {
  CREATE_GAME_TABLE_QUERY,
  CREATE_PLAY_TABLE_QUERY,
  DB_NAME,
  GAME_TABLE,
  LOAD_GAME_FOR_PLAYER,
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

export async function getLastOpenGame(playerId: string) {
  const db = await openDb()
  if (db) {
    const rowId = await db.get(
      `SELECT id
        FROM ${GAME_TABLE}
        WHERE playerOne != :playerId AND playerTwo IS NULL AND gameState = :gameState
        ORDER BY id DESC LIMIT 1`,
      {
        ':playerId': playerId,
        ':gameState': GameState.OPEN,
      },
    )
    if (rowId?.id) {
      return rowId.id
    }
  }
  return null
}

export async function joinGameOrNewGame(playerId: string) {
  const db = await openDb()
  if (db) {
    try {
      const rowId = await getLastOpenGame(playerId)
      if (rowId !== null) {
        const result = await db.run(
          `UPDATE ${GAME_TABLE}
         SET playerTwo = ?
         WHERE id = ?`,
          playerId,
          rowId,
        )
        if (result) {
          return result
        }
      } else {
        await newGame(playerId)
      }
    } catch (err) {
      console.log(err)
    }
  }
}

export async function loadGameForPlayer(playerId = ''): Promise<GameStack> {
  const db = await openDb()
  if (db) {
    try {
      const result = await db.get(LOAD_GAME_FOR_PLAYER, {
        ':playerId': playerId,
        ':gameState': GameState.OPEN,
      })
      if (result) {
        return result
      }
    } catch (err) {
      console.log(err)
    }
  }
  return { id: -1, playerOne: '', playerTwo: '', gameState: GameState.OPEN }
}
