import { GameStack } from '@/types/dbTypes'
import { getSessionIdCookie } from '@/utils/cookieUtils'
import { playerOneText, playerTwoText, waiting } from '@/const/playerConstants'

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

export const whichTurn = (gameState: GameStack) => {
  const sessionId = getSessionIdCookie()
  switch (true) {
    case !gameState?.playerTwo:
      return waiting
    default:
      return ''
  }
}
