enum GameState {
  OPEN = 'OPEN',
  FINISHED = 'FINISHED',
}

interface GameStack {
  id: number
  players: number
  gameState: GameState
}

interface PlayStack {
  id: number
  gameId: number
  player: number
  move: string
}
