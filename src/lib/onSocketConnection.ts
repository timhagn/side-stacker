import { Socket } from 'socket.io'
import { getOpposingPlayer, randomId } from '@/utils/socketHelpers'
import {
  getLastMoveInGame,
  getMovesInGame,
  joinGameOrNewGame,
  writeNextMove,
} from '@/lib/sqliteDb'
import { GamePieceId } from '@/types/gameStateTypes'
import { Simulate } from 'react-dom/test-utils'
import play = Simulate.play
import { GameMove, PlayStack } from '@/types/dbTypes'
import { buildBoardState } from '@/utils/gameUtils'

export default async function onSocketConnection(socket: Socket) {
  const sessionId = socket.data.sessionId
  console.log('Session Id (SERVER)', sessionId)
  if (!sessionId) {
    console.log('creating new session')
    const newSessionId = randomId()
    const result = await joinGameOrNewGame(newSessionId)
    console.log('test result', result)
    socket.data.sessionId = newSessionId
    socket.emit('session', newSessionId)
  }

  // TODO: check why the socket server doesn't send an update to itself
  socket.join(socket.data.sessionId)

  console.log('New connection (SERVER)', socket.id)
  const createdMessage = (msg: string) => {
    console.log('New message', msg)
    socket.broadcast.emit('newIncomingMessage', msg)
  }

  socket.on('createdMessage', createdMessage)

  const setPiece = async (gamePieceId: GamePieceId) => {
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
        if (moves?.length) {
          const newMoves: PlayStack[] = [
            ...((moves as PlayStack[]) || []),
            { id: moves.length + 1, ...nextMove },
          ]
          const newBoard = buildBoardState(newMoves, socket.data.gameState)
          const opposingPlayer = getOpposingPlayer(
            player,
            socket.data.gameState,
          )
          socket.to(player).to(opposingPlayer).emit('updatedBoard', newBoard)
        }
      }
    }
  }

  socket.on('setPiece', setPiece)
}
