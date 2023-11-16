import { GameStack, PlayStack } from '@/types/dbTypes'
import {
  GamePieceBoardState,
  GamePieceId,
  GamePieceStates,
} from '@/types/gameStateTypes'
import { BOARD_COLS, BOARD_ROWS } from '@/const/gameConstants'

export const initializeBoard = (): GamePieceBoardState =>
  [...new Array(BOARD_ROWS)].map((_) =>
    [...new Array(BOARD_COLS)].map((__) => GamePieceStates.empty),
  )

export const getGamePieceState = (player: string, gameState: GameStack) =>
  player === gameState.playerOne
    ? GamePieceStates.playerOne
    : GamePieceStates.playerTwo

export const buildBoardState = (
  existingMoves: PlayStack[] | null,
  gameState: GameStack,
): GamePieceBoardState => {
  const boardState = initializeBoard()
  if (existingMoves) {
    existingMoves.forEach((currentMove) => {
      const [row, col] = currentMove.move.split(',')
      const player = currentMove.player
      boardState[parseInt(row)][parseInt(col)] = getGamePieceState(
        player,
        gameState,
      )
    })
  }
  return boardState
}

export const isLegalMove = (
  gamePieceId: GamePieceId,
  currentBoard: GamePieceBoardState,
) => {
  const { row, col } = gamePieceId
  // Early break if it's not an empty field.
  if (currentBoard[row][col] !== GamePieceStates.empty) {
    return false
  }
  // Are there borders left or right of the piece? Then allow the move.
  if (col - 1 < 0 || col + 1 > BOARD_COLS) {
    return true
  }
  // Now break if both right or left of it are empty fields
  return !(
    currentBoard[row][col - 1] === GamePieceStates.empty &&
    currentBoard[row][col + 1] === GamePieceStates.empty
  )
}

export const isLegalMoveCurried =
  (currentBoard: GamePieceBoardState) => (gamePieceId: GamePieceId) =>
    isLegalMove(gamePieceId, currentBoard)
