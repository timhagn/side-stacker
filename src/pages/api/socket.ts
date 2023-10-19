import { NextRequest } from 'next/server'
import { Server } from 'socket.io'
import onSocketConnection from '../../lib/onSocketConnection'
import {
  ClientToServerEvents,
  InterServerEvents,
  NextResponseWithSocket,
  ServerToClientEvents,
  SocketData,
} from '@/types/socketTypes'
import { PORT } from '@/const/socketConstants'
import { randomId } from '@/utils/socketHelpers'
import { loadGameForPlayer } from '@/lib/sqliteDb'

export const config = {
  api: {
    externalResolver: true,
  },
}

export default async function handler(
  _: NextRequest,
  res: NextResponseWithSocket,
) {
  if (res.socket.server.io) {
    console.log('Server already started!')
    return
  }

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >({
    path: '/api/socket',
    addTrailingSlash: false,
    cors: { origin: '*' },
  }).listen(PORT + 1)

  io.use(async (socket, next) => {
    const sessionId = socket.handshake.auth.sessionId
    if (sessionId) {
      const gameState = await loadGameForPlayer(sessionId)
      socket.data.sessionId = sessionId
      if (gameState?.id !== -1) {
        socket.data.gameState = gameState
      }
      return next()
    }
  })

  res.socket.server.io = io

  io.on('connection', onSocketConnection)

  console.log('Socket server started successfully!')
}
