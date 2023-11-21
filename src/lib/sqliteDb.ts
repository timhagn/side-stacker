'use server'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import {
  CREATE_GAME_TABLE_QUERY,
  CREATE_PLAY_TABLE_QUERY,
  DB_NAME,
  GAME_TABLE,
  LOAD_GAME_FOR_PLAYER,
  PLAY_TABLE,
} from '@/const/dbConstants'
import { GameMove, GameStack, GameState, PlayStack } from '@/types/dbTypes'

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
    if (result) {
      return await loadGameForPlayer(playerOne)
    }
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

export async function getGameById(gameId: number): Promise<GameStack | null> {
  const db = await openDb()
  if (db) {
    const result = await db.get(
      `SELECT *
      FROM ${GAME_TABLE}
      WHERE id = :gameId`,
      { ':gameId': gameId },
    )
    if (result) {
      return result
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
          console.log('Joined Game', result)
          return await getGameById(rowId)
        }
      } else {
        return await newGame(playerId)
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
      const result = await db.get<GameStack>(LOAD_GAME_FOR_PLAYER, {
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

export async function getMovesInGame(
  gameId: number,
): Promise<PlayStack[] | []> {
  const db = await openDb()
  if (db) {
    const result = await db.all<PlayStack[]>(
      `SELECT *
        FROM ${PLAY_TABLE}
        WHERE gameId = :gameId
        ORDER BY id`,
      {
        ':gameId': gameId,
      },
    )
    if (result) {
      return result
    }
  }
  return []
}

export async function getLastMoveInGame(
  gameId: number,
): Promise<PlayStack | null> {
  const db = await openDb()
  if (db) {
    const result = await db.get<PlayStack>(
      `SELECT *
        FROM ${PLAY_TABLE}
        WHERE gameId = :gameId
        ORDER BY id DESC LIMIT 1`,
      {
        ':gameId': gameId,
      },
    )
    if (result) {
      return result
    }
  }
  return null
}

export async function writeNextMove(playerMove: GameMove) {
  const db = await openDb()
  if (db) {
    const result = await db.run(
      `INSERT INTO ${PLAY_TABLE} (gameId, player, move) VALUES (?, ?, ?)`,
      playerMove.gameId,
      playerMove.player,
      playerMove.move,
    )
    console.log('WROTE MOVE', result)
  }
}

export async function updateWinningOrTiedGame(gameId: string) {
  const db = await openDb()
  if (db) {
    try {
      const result = await db.run(
        `UPDATE ${GAME_TABLE}
           SET gameState = ?
           WHERE id = ?`,
        GameState.FINISHED,
        gameId,
      )
      if (result) {
        return true
      }
    } catch (err) {
      console.log(err)
      return false
    }
  }
}
