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
  res.socket.server.io = io

  io.on('connection', onSocketConnection)

  console.log('Socket server started successfully!')
}
