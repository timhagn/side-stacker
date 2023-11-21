import { Socket } from 'socket.io'
import {
  getWinningPlayerState,
  isPlayerTwo,
  randomId,
} from '@/utils/socketHelpers'
import {
  getMovesInGame,
  joinGameOrNewGame,
  updateWinningOrTiedGame,
  writeNextMove,
} from '@/lib/sqliteDb'
import { GameMove, GameState, PlayStack } from '@/types/dbTypes'
import {
  GamePieceBoardState,
  GamePieceId,
  PlayStates,
} from '@/types/gameStateTypes'
import {
  buildBoardState,
  getCurrentPlayState,
  getInitialGameState,
  hasStackCountForWin,
} from '@/utils/gameUtils'

export default async function onSocketConnection(socket: Socket) {
  const sessionId = socket.data.sessionId

  console.log('Session Id (SERVER)', sessionId)
  if (!sessionId) {
    console.log('creating new session')
    const newSessionId = randomId()
    const result = await joinGameOrNewGame(newSessionId)
    socket.data.sessionId = newSessionId
    socket.data.gameState = result
    const moves = await getMovesInGame(result!.id)
    const playState = getInitialGameState(socket.data.gameState, moves)

    socket.emit('session', {
      sessionId: newSessionId,
      gameState: socket.data.gameState,
      playState,
    })
  }

  const gameId = socket.data.gameState?.id
  if (gameId) {
    socket.join(`game-${gameId}`)
  }

  if (isPlayerTwo(socket.data.sessionId, socket.data.gameState)) {
    console.log('Player two joined')
    const moves = await getMovesInGame(socket.data.gameState)
    const playState = getInitialGameState(socket.data.gameState, moves)
    socket
      .to(`game-${gameId}`)
      .emit('playerTwoJoined', { gameState: socket.data.gameState, playState })
  }

  console.log('New connection (SERVER)', socket.id)

  const setPiece = async (
    gamePieceId: GamePieceId,
    callback: ({
      boardState,
      playState,
    }: {
      boardState: GamePieceBoardState
      playState: PlayStates
    }) => void,
  ) => {
    const player = socket.data.sessionId
    const gameId = socket.data.gameState?.id
    const currentGameState = socket.data.gameState.gameState
    if (gameId && gameId !== -1 && currentGameState === GameState.OPEN) {
      const moves = await getMovesInGame(gameId)
      const lastMove = moves?.at(-1)
      if (!lastMove || lastMove?.player !== player) {
        console.log(gamePieceId, sessionId, gameId)
        const move = `${gamePieceId.row},${gamePieceId.col}`
        const nextMove: GameMove = { gameId, player, move }
        await writeNextMove(nextMove)
        const nextMoveId = moves?.length ? moves.length + 1 : 1
        const newMoves: PlayStack[] = [
          ...((moves as PlayStack[]) || []),
          { id: nextMoveId, ...nextMove },
        ]
        console.log('move count', newMoves.length)
        const boardState = buildBoardState(newMoves, socket.data.gameState)
        // TODO: check if newMoves exceeds 49, thus all fields are filled.
        // playState = PlayStates.playersTied

        const hasWon = hasStackCountForWin(
          player,
          gamePieceId,
          boardState,
          socket.data.gameState,
        )
        console.log('Do we have a winner?', hasWon)

        const playState = hasWon
          ? getWinningPlayerState(player, socket.data.gameState)
          : getCurrentPlayState(player, socket.data.gameState)

        if (hasWon) {
          await updateWinningOrTiedGame(gameId)
          socket.data.gameState.gameState = GameState.FINISHED
        }

        socket
          .to(`game-${gameId}`)
          .emit('updatedBoard', { boardState, playState })
        callback({ boardState, playState })
      }
    }
  }

  socket.on('setPiece', setPiece)
}
