import { NextRequest } from 'next/server'
import { Server } from 'socket.io'

import { PORT } from '@/const/socketConstants'
import { loadGameForPlayer } from '@/lib/sqliteDb'
import {
  ClientToServerEvents,
  InterServerEvents,
  NextApiResponseWithSocket,
  ServerToClientEvents,
  SocketData,
} from '@/types/socketTypes'

import onSocketConnection from '../../lib/onSocketConnection'

export const config = {
  api: {
    externalResolver: true,
  },
}

export default async function handler(
  _: NextRequest,
  res: NextApiResponseWithSocket,
) {
  if (res.socket.server.io) {
    console.log('Server already started!')
    res.end()
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
  res.socket.server.io = io

  // Register a Middleware to load a Game for a given session ID (player ID)
  // and prefill socket.data.
  io.use(async (socket, next) => {
    const sessionId = socket.handshake.auth.sessionId
    if (sessionId) {
      const gameState = await loadGameForPlayer(sessionId)
      socket.data.sessionId = sessionId
      if (gameState?.id !== -1) {
        socket.data.gameState = gameState
      }
    }
    return next()
  })

  io.on('connection', onSocketConnection)

  console.log('Socket server started successfully!')

  res.end()
}
