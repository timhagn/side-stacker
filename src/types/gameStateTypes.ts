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
}

export interface CurrentStep {
  x: number
  y: number
}
