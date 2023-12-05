import { expect, test } from 'vitest'

import { GameStack, GameState } from '@/types/dbTypes'
import { hasStackCountForWin } from '@/utils/gameUtils'

const mockGameState: GameStack = {
  id: 4,
  playerOne: 'fff313363f22cae0',
  playerTwo: '2c0d42353a82d689',
  gameState: GameState.OPEN,
}

const mockPlayerOne = 'fff313363f22cae0'
const mockPlayerTwo = '2c0d42353a82d689'

test('no winner', () => {
  const mockBoardState = [
    [1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ]

  const mockGamePieceId = {
    row: 0,
    col: 0,
  }

  const hasWon = hasStackCountForWin(
    mockPlayerOne,
    mockGamePieceId,
    mockBoardState,
    mockGameState,
  )
  expect(hasWon).toBeFalsy()
})

test('player 1 hasWon', () => {
  const mockBoardState = [
    [1, 2, 0, 0, 0, 0, 0],
    [1, 2, 0, 0, 0, 0, 0],
    [1, 2, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ]

  const mockGamePieceId = {
    row: 3,
    col: 0,
  }

  const hasWon = hasStackCountForWin(
    mockPlayerOne,
    mockGamePieceId,
    mockBoardState,
    mockGameState,
  )
  expect(hasWon).toBeTruthy()
})

test('player 2 hasWon', () => {
  const mockBoardState = [
    [1, 2, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0],
    [2, 2, 1, 0, 0, 0, 0],
    [2, 1, 1, 0, 0, 0, 0],
    [2, 2, 2, 2, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0],
  ]

  const mockGamePieceId = {
    row: 4,
    col: 3,
  }

  const hasWon = hasStackCountForWin(
    mockPlayerTwo,
    mockGamePieceId,
    mockBoardState,
    mockGameState,
  )
  expect(hasWon).toBeTruthy()
})
