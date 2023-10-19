import crypto from 'crypto'
import { GameStack, PlayStack } from '@/types/dbTypes'
export const randomId = () => crypto.randomBytes(8).toString('hex')

export const getOpposingPlayer = (player: string, gameState: GameStack) =>
  player === gameState.playerOne ? gameState.playerTwo : gameState.playerOne
