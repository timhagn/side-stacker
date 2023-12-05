import {
  BOARD_COLS,
  BOARD_ROWS,
  COUNT_TILL_WON,
  STEPS_TO_CHECK,
} from '@/const/gameConstants'
import { GameStack, PlayStack } from '@/types/dbTypes'
import {
  CurrentStep,
  GamePieceBoardState,
  GamePieceId,
  GamePieceStates,
  PlayStates,
  StackCount,
} from '@/types/gameStateTypes'
import {
  getGamePieceStateForPlayer,
  getOpposingPlayer,
  isPlayerTwo,
} from '@/utils/socketHelpers'

/**
 * Initializes a new, empty Board.
 *
 * @returns {GamePieceBoardState}
 */
export const initializeBoard = (): GamePieceBoardState =>
  [...new Array(BOARD_ROWS)].map((_) =>
    [...new Array(BOARD_COLS)].map((__) => GamePieceStates.empty),
  )

/**
 * Converts a given gameState to a GamePieceState depending on a given player.
 *
 * @param {string}      player      The current Player.
 * @param {GameStack}   gameState   The current GameStack state.
 * @returns GamePieceStates
 */
export const getGamePieceState = (
  player: string,
  gameState: GameStack,
): GamePieceStates =>
  player === gameState.playerOne
    ? GamePieceStates.playerOne
    : GamePieceStates.playerTwo

/**
 * Sets up a board from a given PlayStack from existingMoves.
 *
 * @param {PlayStack[]}   existingMoves   Existing Moves as saved in play_stack table.
 * @param {GameStack}     gameState       The current GameStack state.
 * @returns {GamePieceBoardState}
 */
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

/**
 * Tests if a piece is allowed to be set.
 *
 * @param {GamePieceId}           gamePieceId     The Piece to check.
 * @param {GamePieceBoardState}   currentBoard    The current Board.
 * @returns {boolean}
 */
export const isLegalMove = (
  gamePieceId: GamePieceId,
  currentBoard: GamePieceBoardState,
): boolean => {
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

/**
 * As `isLegalMove()` is used in `GameBoardDisplay` this function curries in the
 * current GamePieceBoardState to be used in `GamePiece`.
 *
 * @param {GamePieceBoardState}   currentBoard    The current Board.
 * @retuns {(gamePieceId: GamePieceId) => boolean}
 */
export const isLegalMoveCurried =
  (currentBoard: GamePieceBoardState) => (gamePieceId: GamePieceId) =>
    isLegalMove(gamePieceId, currentBoard)

/**
 * Checks playState to determine a GameOver state (won or tied).
 *
 * @param {PlayStates}  playState   The current play state.
 * @returns {boolean}
 */
export const isGameOver = (playState: PlayStates): boolean =>
  [
    PlayStates.playerOneWon,
    PlayStates.playerTwoWon,
    PlayStates.playersTied,
  ].includes(playState)

/**
 * Checks the initial play state depending on the last Move.
 *
 * @param {GameStack}     gameState       The current GameStack state.
 * @param {PlayStack[]}   existingMoves   Existing Moves as saved in play_stack table.
 * @returns {PlayStates}
 */
export const getInitialGameState = (
  gameState: GameStack,
  existingMoves?: PlayStack[],
): PlayStates => {
  const lastMove = existingMoves?.at(-1)
  if (!lastMove) {
    return PlayStates.playerOneTurn
  }
  const wasLastMoveByPlayerTwo = isPlayerTwo(lastMove.player, gameState)
  return wasLastMoveByPlayerTwo
    ? PlayStates.playerOneTurn
    : PlayStates.playerTwoTurn
}

/**
 * Returns the next play state.
 *
 * @param {string}      currentPlayer   The current player.
 * @param {GameStack}   gameState       The current GameStack state.
 * @returns {PlayStates}
 */
export const getCurrentPlayState = (
  currentPlayer: string,
  gameState: GameStack,
): PlayStates => {
  const opposingPlayer = getOpposingPlayer(currentPlayer, gameState)
  return opposingPlayer === gameState.playerTwo
    ? PlayStates.playerTwoTurn
    : PlayStates.playerOneTurn
}

/**
 * Recursively steps through the board from the currentPosition of game Piece
 * and adds up the count of adjourning pieces of the current player.
 *
 * @param {StackCount}  currentStackCount   Tracks the current stack count.
 * @returns {number}
 */
export const checkStackCountRecursive = ({
  gamePieceState,
  currentPosition,
  currentBoard,
  currentCount,
  stepIndex,
}: StackCount): number => {
  const { x: row, y: col } = currentPosition
  const nextPosition: CurrentStep = {
    x: row + STEPS_TO_CHECK[stepIndex].x,
    y: col + STEPS_TO_CHECK[stepIndex].y,
  }
  const { x, y } = nextPosition
  // Break early if we are outside the board.
  if (x < 0 || x >= BOARD_COLS || y < 0 || y >= BOARD_ROWS) {
    return currentCount
  }
  // Early break if it's an empty field or has an opposing piece.
  if (currentBoard[x][y] !== gamePieceState) {
    return currentCount
  }
  // Go to the next board field if it's a piece of the Player.
  if (currentBoard[x][y] === gamePieceState) {
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

/**
 * Checks the current Game Board after a player has set a piece for a winning
 * stack count of COUNT_TILL_WON by calling `checkStackCountRecursive()` with
 * steps given in STEPS_TO_CHECK.
 *
 * @param {string}                currentPlayer     The current player.
 * @param {GamePieceId}           gamePieceId       The state to check the pieces against.
 * @param {GamePieceBoardState}   currentBoard      The current Game Board.
 * @param {GameStack}             gameState         The current GameStack state.
 * @returns {boolean}
 * @see COUNT_TILL_WON
 * @see STEPS_TO_CHECK
 */
export const hasStackCountForWin = (
  currentPlayer: string,
  gamePieceId: GamePieceId,
  currentBoard: GamePieceBoardState,
  gameState: GameStack,
): boolean => {
  const gamePieceState = getGamePieceStateForPlayer(currentPlayer, gameState)
  const currentPosition: CurrentStep = {
    x: gamePieceId.row,
    y: gamePieceId.col,
  }
  for (let index = 0; index < STEPS_TO_CHECK.length; index += 2) {
    let stepCount = 0

    const nextStepData = {
      gamePieceState,
      currentPosition,
      currentBoard,
      currentCount: 0,
      stepIndex: index,
    }
    stepCount = checkStackCountRecursive(nextStepData)

    nextStepData.stepIndex = index + 1
    nextStepData.currentCount = 0
    stepCount += checkStackCountRecursive(nextStepData)

    if (stepCount + 1 >= COUNT_TILL_WON) {
      console.log(stepCount)
      return true
    }
  }
  return false
}
