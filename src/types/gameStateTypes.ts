export enum GamePieceState {
  'empty',
  'playerOne',
  'playerTwo',
}

export interface GameBoardState {
  gameBoard: GamePieceState[][]
}
