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
