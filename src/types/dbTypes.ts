export enum GameState {
  OPEN = 'OPEN',
  FINISHED = 'FINISHED',
}

export interface GameStack {
  id: number
  playerOne: string
  playerTwo: string
  gameState: GameState
}

export interface PlayStack {
  id: number
  gameId: number
  player: string
  move: string
}
