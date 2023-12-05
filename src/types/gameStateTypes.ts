import { GameStack } from '@/types/dbTypes'

export enum GamePieceStates {
  'empty',
  'playerOne',
  'playerTwo',
}

export enum GamePieceHoverState {
  'notHovered',
  'legal',
  'illegal',
}

export type GamePieceBoardState = GamePieceStates[][]

export interface GameBoardState {
  gameBoard: GamePieceBoardState
}

export interface GameBoardProps extends GameBoardState {
  initialGameState: GameStack
  playState: PlayStates
}

export interface GamePieceId {
  row: number
  col: number
}

export enum PlayStates {
  waiting,
  playerOneTurn,
  playerTwoTurn,
  playerOneWon,
  playerTwoWon,
  playersTied,
}

export interface CurrentStep {
  x: number
  y: number
}

/**
 * Tracks the current stack count.
 *
 * @property {GamePieceStates}      gamePieceState    The state to check the pieces against.
 * @property {CurrentStep}          currentPosition   The current position on the Board.
 * @property {GamePieceBoardState}  currentBoard      The current Game Board.
 * @property {number}               currentCount      Count of adjacent pieces of the same state.
 * @property {number}               stepIndex         The index in STEPS_TO_CHECK to check against.
 * @see STEPS_TO_CHECK
 */
export interface StackCount {
  gamePieceState: GamePieceStates
  currentPosition: CurrentStep
  currentBoard: GamePieceBoardState
  currentCount: number
  stepIndex: number
}
