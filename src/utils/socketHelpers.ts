import crypto from 'crypto'
import { GameStack } from '@/types/dbTypes'

export const randomId = () => crypto.randomBytes(8).toString('hex')

export const getOpposingPlayer = (player: string, gameState: GameStack) =>
  player === gameState.playerOne ? gameState.playerTwo : gameState.playerOne

export const isPlayerTwo = (player: string, gameState: GameStack) =>
  player === gameState?.playerTwo
