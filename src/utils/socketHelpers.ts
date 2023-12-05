import crypto from 'crypto'
import { GameStack } from '@/types/dbTypes'
import { GamePieceStates, PlayStates } from '@/types/gameStateTypes'

/**
 * Creates a new session ID.
 *
 * @returns string
 */
export const randomId = (): string => crypto.randomBytes(8).toString('hex')

/**
 * Determines & returns the opposing player's ID.
 *
 * @param {string}      currentPlayer   The current player.
 * @param {GameStack}   gameState       The current GameStack state.
 * @returns string
 */
export const getOpposingPlayer = (
  currentPlayer: string,
  gameState: GameStack,
): string =>
  currentPlayer === gameState.playerOne
    ? gameState.playerTwo
    : gameState.playerOne

/**
 * Determines if a given player is the second player.
 *
 * @param {string}      player      The player to check.
 * @param {GameStack}   gameState   The current GameStack state.
 * @returns boolean
 */
export const isPlayerTwo = (player: string, gameState: GameStack): boolean =>
  player === gameState?.playerTwo

/**
 * Returns the Game Piece state for a given player.
 *
 * @param {string}      player      The player to check against.
 * @param {GameStack}   gameState   The current GameStack state.
 * @returns GamePieceStates
 */
export const getGamePieceStateForPlayer = (
  player: string,
  gameState: GameStack,
): GamePieceStates =>
  player === gameState?.playerOne
    ? GamePieceStates.playerOne
    : GamePieceStates.playerTwo

/**
 * Returns the winning play state for a given player.
 *
 * @param {string}      player      The player to check against.
 * @param {GameStack}   gameState   The current GameStack state.
 * @returns PlayStates
 */
export const getWinningPlayerState = (
  player: string,
  gameState: GameStack,
): PlayStates =>
  player === gameState?.playerOne
    ? PlayStates.playerOneWon
    : PlayStates.playerTwoWon
