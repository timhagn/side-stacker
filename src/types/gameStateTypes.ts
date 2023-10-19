export enum GamePieceStates {
  'empty',
  'playerOne',
  'playerTwo',
}

export type GamePieceBoardState = GamePieceStates[][]

export interface GameBoardState {
  gameBoard: GamePieceBoardState
}

export interface GamePieceId {
  row: number
  col: number
}
