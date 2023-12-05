import { GameStack } from '@/types/dbTypes'
import { getSessionIdCookie } from '@/utils/cookieUtils'
import {
  otherPlayerTurn,
  ownTurn,
  playerOneLosingText,
  playerOneText,
  playerOneWinningText,
  playersTiedText,
  playerTwoLosingText,
  playerTwoText,
  playerTwoWinningText,
  waiting,
} from '@/const/playerConstants'
import { PlayStates } from '@/types/gameStateTypes'

/**
 * Checks the sessionId (player ID) against the current Game Stack state to
 * determine who is the current player.
 *
 * @param {GameStack}   gameState   The current GameStack state.
 * @returns {string}
 */
export const whoAmI = (gameState: GameStack): string => {
  const sessionId = getSessionIdCookie()
  switch (true) {
    case sessionId === gameState?.playerOne:
      return playerOneText
    case sessionId === gameState?.playerTwo:
      return playerTwoText
    default:
      return ''
  }
}

/**
 * Determines which text to display for the current GameStack & play states.
 *
 * @param {GameStack}   gameState   The current GameStack state.
 * @param {PlayStates}  playState   The current play state.
 * @returns {string}
 */
export const getTurnInfoText = (
  gameState: GameStack,
  playState: PlayStates,
): string => {
  const sessionId = getSessionIdCookie()
  switch (true) {
    case !gameState?.playerTwo:
      return waiting
    case playState === PlayStates.playerOneTurn:
      return sessionId === gameState?.playerOne ? ownTurn : otherPlayerTurn
    case playState === PlayStates.playerTwoTurn:
      return sessionId === gameState?.playerTwo ? ownTurn : otherPlayerTurn
    case playState === PlayStates.playerOneWon:
      return sessionId === gameState?.playerOne
        ? playerOneWinningText
        : playerTwoLosingText
    case playState === PlayStates.playerTwoWon:
      return sessionId === gameState?.playerTwo
        ? playerTwoWinningText
        : playerOneLosingText
    case playState === PlayStates.playersTied:
      return playersTiedText
    default:
      return ''
  }
}
