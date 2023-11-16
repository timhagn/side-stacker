import { GameStack, PlayStack } from '@/types/dbTypes'
import {
  CurrentStep,
  GamePieceBoardState,
  GamePieceId,
  GamePieceStates,
  PlayStates,
} from '@/types/gameStateTypes'
import {
  BOARD_COLS,
  BOARD_ROWS,
  COUNT_TILL_WON,
  STEPS_TO_CHECK,
} from '@/const/gameConstants'
import {
  getGamePieceStateForPlayer,
  getOpposingPlayer,
  isPlayerTwo,
} from '@/utils/socketHelpers'

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

export const getInitialGameState = (
  gameState: GameStack,
  existingMoves?: PlayStack[],
) => {
  const lastMove = existingMoves?.at(-1)
  if (!lastMove) {
    return PlayStates.playerOneTurn
  }
  const wasLastMoveByPlayerTwo = isPlayerTwo(lastMove.player, gameState)
  return wasLastMoveByPlayerTwo
    ? PlayStates.playerOneTurn
    : PlayStates.playerTwoTurn
}

export const getCurrentPlayState = (
  currentPlayer: string,
  gameState: GameStack,
) => {
  const opposingPlayer = getOpposingPlayer(currentPlayer, gameState)
  return opposingPlayer === gameState.playerTwo
    ? PlayStates.playerTwoTurn
    : PlayStates.playerOneTurn
}

export const checkStackCountRecursive = ({
  gamePieceState,
  currentPosition,
  currentBoard,
  currentCount,
  stepIndex,
}: {
  gamePieceState: GamePieceStates
  currentPosition: CurrentStep
  currentBoard: GamePieceBoardState
  currentCount: number
  stepIndex: number
}): number => {
  const { x, y } = currentPosition
  // Break early if we are outside the board.
  if (x < 0 || x > BOARD_COLS || y < 0 || y > BOARD_ROWS) {
    return currentCount
  }
  // Early break if it's an empty field or has an opposing piece.
  if (currentBoard[x][y] !== gamePieceState) {
    return currentCount
  }
  // Go to the next board field if it's a piece of the Player.
  if (currentBoard[x][y] === gamePieceState) {
    const nextPosition: CurrentStep = {
      x: x + STEPS_TO_CHECK[stepIndex].x,
      y: y + STEPS_TO_CHECK[stepIndex].y,
    }
    const nextStepData = {
      gamePieceState,
      currentPosition: nextPosition,
      currentBoard,
      currentCount: currentCount + 1,
      stepIndex,
    }
    return checkStackCountRecursive(nextStepData)
  }
  return currentCount
}

export const hasStackCountForWin = (
  currentPlayer: string,
  gamePieceId: GamePieceId,
  currentBoard: GamePieceBoardState,
  gameState: GameStack,
) => {
  // TODO: check why it sometimes just counts non-bordering pieces!
  const gamePieceState = getGamePieceStateForPlayer(currentPlayer, gameState)
  for (let index = 0; index < STEPS_TO_CHECK.length; index += 2) {
    let stepCount = 1
    const currentPosition: CurrentStep = {
      x: gamePieceId.row + STEPS_TO_CHECK[index].x,
      y: gamePieceId.col + STEPS_TO_CHECK[index].y,
    }
    const nextStepData = {
      gamePieceState,
      currentPosition,
      currentBoard,
      currentCount: stepCount,
      stepIndex: index,
    }
    stepCount = checkStackCountRecursive(nextStepData)

    nextStepData.currentPosition = {
      x: gamePieceId.row + STEPS_TO_CHECK[index + 1].x,
      y: gamePieceId.col + STEPS_TO_CHECK[index + 1].y,
    }
    nextStepData.stepIndex = index + 1

    stepCount += checkStackCountRecursive(nextStepData)

    if (stepCount > COUNT_TILL_WON) {
      console.log(stepCount)
      return true
    }
  }
  return false
}
