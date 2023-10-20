import { GameStack, PlayStack } from '@/types/dbTypes'
import { GamePieceBoardState, GamePieceStates } from '@/types/gameStateTypes'

export const initializeBoard = (): GamePieceBoardState =>
  [...new Array(7)].map((_) =>
    [...new Array(7)].map((__) => GamePieceStates.empty),
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

// export const isLegalMove = (currentMove: )
