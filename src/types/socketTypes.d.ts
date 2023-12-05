import { Server as HTTPServer } from 'http'
import { Socket as NetSocket } from 'net'
import { NextResponse } from 'next/server'
import { Server as IOServer } from 'socket.io'

import { GameStack, GameState } from '@/types/dbTypes'
import {
  GamePieceBoardState,
  GamePieceId,
  PlayStates,
} from '@/types/gameStateTypes'

/**
 * Socket.io types
 */
interface ServerToClientEvents {
  session: ({
    sessionId: string,
    gameState: GameStack,
    playState: PlayStates,
  }) => void
  updatedBoard: ({
    boardState: GamePieceBoardState,
    playState: PlayStates,
  }) => void
  playerTwoJoined: ({ gameState: GameStack, playState: PlayStates }) => void
}

interface ClientToServerEvents {
  setPiece: (
    gamePieceId: GamePieceId,
    callback: ({
      boardState: GamePieceBoardState,
      playState: PlayStates,
    }) => void,
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
