export enum GamePieceState {
  'empty',
  'playerOne',
  'playerTwo',
}

export interface GameBoardState {
  gameBoard: GamePieceState[][]
}

export interface GamePieceId {
  row: number
  col: number
}
