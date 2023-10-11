'use server'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import {
  CREATE_GAME_TABLE_QUERY,
  CREATE_PLAY_TABLE_QUERY,
  DB_NAME,
} from '@/const/dbConstants'

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

export async function newGame() {
  const db = await openDb()
  if (db) {
    await db.exec(
      "INSERT INTO tally_tokes (id, numberOfTokes, lastTokeAt) VALUES(date('now'), 1, time('now')) ON CONFLICT(id) DO UPDATE SET numberOfTokes = numberOfTokes + 1, lastTokeAt = time('now')",
    )
  }
}

export async function loadTodayPuffs(): Promise<Omit<TallyTokes, 'id'>> {
  const db = await openDb()
  if (db) {
    const result = await db.get(
      "SELECT numberOfTokes, lastTokeAt FROM tally_tokes WHERE id = date('now')",
    )
    if (result) {
      const { numberOfTokes, lastTokeAt } = result
      return { numberOfTokes, lastTokeAt }
    }
  }
  return { numberOfTokes: 0, lastTokeAt: '' }
}

export interface TallyTokes {
  id: string
  numberOfTokes: number
  lastTokeAt: string
}

export async function loadPastPuffs(): Promise<TallyTokes[]> {
  const db = await openDb()
  if (db) {
    const result = await db.all(
      "SELECT * FROM tally_tokes WHERE id < date('now')",
    )
    if (result) {
      return result
    }
  }
  return []
}
