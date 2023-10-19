import { NextResponse } from 'next/server'
import { Server as HTTPServer } from 'http'
import { Server as IOServer } from 'socket.io'
import { Socket as NetSocket } from 'net'
import { GamePieceBoardState, GamePieceId } from '@/types/gameStateTypes'
import { GameStack, GameState } from '@/types/dbTypes'

/**
 * Socket.io types
 */
interface ServerToClientEvents {
  noArg: () => void
  basicEmit: (a: number, b: string, c: Buffer) => void
  withAck: (d: string, callback: (e: number) => void) => void
  createdMessage: (msg: string) => void
  newIncomingMessage: (msg: string) => void
  session: (sessionId: string) => void
  updatedBoard: (boardState: GamePieceBoardState) => void
}

interface ClientToServerEvents {
  hello: () => void
  createdMessage: (msg: string) => void
  setPiece: (gamePieceId: GamePieceId) => void
}

interface InterServerEvents {
  ping: () => void
  userId: string
}

interface SocketData {
  sessionId: string
  gameState: GameStack
  msg: string
}

/**
 * Socket.io API types
 */
interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextResponseWithSocket extends NextResponse {
  socket: SocketWithIO
}
