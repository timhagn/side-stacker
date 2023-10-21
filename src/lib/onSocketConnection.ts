import { Socket } from 'socket.io'
import { getOpposingPlayer, randomId } from '@/utils/socketHelpers'
import {
  getMovesInGame,
  joinGameOrNewGame,
  writeNextMove,
} from '@/lib/sqliteDb'
import { GamePieceBoardState, GamePieceId } from '@/types/gameStateTypes'
import { GameMove, PlayStack } from '@/types/dbTypes'
import { buildBoardState } from '@/utils/gameUtils'
import { whoAmI } from '@/utils/playerUtils'
import { playerTwoText } from '@/const/playerConstants'

export default async function onSocketConnection(socket: Socket) {
  const sessionId = socket.data.sessionId

  console.log('Session Id (SERVER)', sessionId)
  if (!sessionId) {
    console.log('creating new session')
    const newSessionId = randomId()
    const result = await joinGameOrNewGame(newSessionId)
    console.log('test result', result)
    socket.data.sessionId = newSessionId
    socket.data.gameState = result
    socket.emit('session', newSessionId)
  }

  const gameId = socket.data.gameState?.id
  if (gameId) {
    socket.join(`game-${gameId}`)
  }

  if (whoAmI(socket.data.gameState) === playerTwoText) {
    socket.to(`game-${gameId}`).emit('playerTwoJoined')
  }

  console.log('New connection (SERVER)', socket.id)
  const createdMessage = (msg: string) => {
    console.log('New message', msg)
    socket.broadcast.emit('newIncomingMessage', msg)
  }

  socket.on('createdMessage', createdMessage)

  const setPiece = async (
    gamePieceId: GamePieceId,
    callback: (boardState: GamePieceBoardState) => void,
  ) => {
    const player = socket.data.sessionId
    const gameId = socket.data.gameState?.id
    if (gameId && gameId !== -1) {
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
        const newBoard = buildBoardState(newMoves, socket.data.gameState)
        const opposingPlayer = getOpposingPlayer(player, socket.data.gameState)
        socket.to(`game-${gameId}`).emit('updatedBoard', newBoard)
        callback(newBoard)
      }
    }
  }

  socket.on('setPiece', setPiece)
}
