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
import { Simulate } from 'react-dom/test-utils'

export const whoAmI = (gameState: GameStack) => {
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

export const whichTurn = (gameState: GameStack, playState: PlayStates) => {
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
