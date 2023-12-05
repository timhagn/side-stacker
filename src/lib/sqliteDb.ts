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
import { Database } from 'sqlite/build/Database'

const DB_FILENAME =
  process.env.NODE_ENV === 'production'
    ? `./${DB_NAME}.db`
    : `./${DB_NAME}.dev.db`

/**
 * Initializes the SQLite DB and creates the game_stack & play_stack tables if
 * they don't already exist.
 *
 * @returns {Promise<Database | undefined>}
 */
export async function openDb(): Promise<Database | undefined> {
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

/**
 * Initializes a new Game by writing the ID of the first player into game_stack.
 *
 * @param {string}  playerOne   The ID of the first player.
 * @returns {Promise<GameStack | undefined>}
 */
export async function newGame(
  playerOne: string,
): Promise<GameStack | undefined> {
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

/**
 * Returns the ID of the last OPEN Game for a given player ID from game_stack.
 *
 * @param {string}  playerId  The player ID to query for.
 * @returns {Promise<number | null>}
 */
export async function getLastOpenGame(
  playerId: string,
): Promise<number | null> {
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

/**
 * Returns a Game by a given ID form game_stack.
 *
 * @param {number}  gameId    The Game ID to query for.
 * @returns {Promise<GameStack | null>}
 */
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

/**
 * Joins an OPEN Game without a second player or starts a new one.
 *
 * @param {string}  playerId  The player ID to query for.
 * @returns {Promise<GameStack | null | undefined>}
 */
export async function joinGameOrNewGame(
  playerId: string,
): Promise<GameStack | null | undefined> {
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

/**
 * Returns the current OPEN game for a given player ID from game_stack or an
 * empty Game Stack to join or start a new game with `joinGameOrNewGame()`.
 *
 * @param {string}  playerId  The player ID to query for.
 * @returns {Promise<GameStack>}
 * @see {joinGameOrNewGame}
 */
export async function loadGameForPlayer(
  playerId: string = '',
): Promise<GameStack> {
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

/**
 * Returns all existing moves for an OPEN game from play_stack.
 *
 * @param {number}  gameId    The Game ID to query for.
 * @returns {Promise<PlayStack[] | []>}
 */
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

/**
 * Gets the last played move from play_stack.
 *
 * @param {number}  gameId    The Game ID to query for.
 * @returns {Promise<PlayStack | null>}
 */
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

/**
 * Writes a given move to the play_stack table.
 *
 * @param {GameMove}  playerMove  The move to save to play_stack.
 * @returns Promise<void>
 */
export async function writeNextMove(playerMove: GameMove): Promise<void> {
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

/**
 * Sets the Game State for a given Game's ID to FINISHED in game_stack.
 *
 * @param {number}  gameId    The Game ID to query for & update.
 * @returns {Promise<boolean | undefined>}
 */
export async function updateWinningOrTiedGame(
  gameId: string,
): Promise<boolean | undefined> {
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
