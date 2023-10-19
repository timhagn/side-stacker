import { Socket } from 'socket.io'
import { randomId } from '@/utils/socketHelpers'
import {
  getLastMoveInGame,
  joinGameOrNewGame,
  writeNextMove,
} from '@/lib/sqliteDb'
import { GamePieceId } from '@/types/gameStateTypes'

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
      const lastMove = await getLastMoveInGame(gameId)
      if (lastMove === null || lastMove?.player !== player) {
        console.log(gamePieceId, sessionId, gameId)
        const move = `${gamePieceId.row},${gamePieceId.row}`
        await writeNextMove({ gameId, player, move })
      }
    }
  }

  socket.on('setPiece', setPiece)
}
