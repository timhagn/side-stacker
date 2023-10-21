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
  createdMessage: (msg: string) => void
  newIncomingMessage: (msg: string) => void
  session: (sessionId: string) => void
  updatedBoard: (boardState: GamePieceBoardState) => void
  playerTwoJoined: (gameState: GameStack) => void
}

interface ClientToServerEvents {
  createdMessage: (msg: string) => void
  setPiece: (
    gamePieceId: GamePieceId,
    callback: (boardState: GamePieceBoardState) => void,
  ) => void
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
