import crypto from 'crypto'
import { GameStack } from '@/types/dbTypes'
import { GamePieceStates, PlayStates } from '@/types/gameStateTypes'

export const randomId = () => crypto.randomBytes(8).toString('hex')

export const getOpposingPlayer = (player: string, gameState: GameStack) =>
  player === gameState.playerOne ? gameState.playerTwo : gameState.playerOne

export const isPlayerTwo = (player: string, gameState: GameStack) =>
  player === gameState?.playerTwo

export const getGamePieceStateForPlayer = (
  player: string,
  gameState: GameStack,
) =>
  player === gameState?.playerOne
    ? GamePieceStates.playerOne
    : GamePieceStates.playerTwo

export const getWinningPlayerState = (player: string, gameState: GameStack) =>
  player === gameState?.playerOne
    ? PlayStates.playerOneWon
    : PlayStates.playerTwoWon
