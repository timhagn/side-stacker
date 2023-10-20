'use client'

import { ChangeEventHandler, useCallback, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@/types/socketTypes'
import { PORT } from '@/const/socketConstants'
import { getSessionIdCookie, setSessionIdCookie } from '@/utils/cookieUtils'
import { GameBoardState, GamePieceId } from '@/types/gameStateTypes'
import GameBoardDisplay from '@/components/gameBoardDisplay'
import { isLegalMove } from '@/utils/gameUtils'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `:${PORT + 1}`,
  {
    path: '/api/socket',
    addTrailingSlash: false,
    autoConnect: false,
  },
)

interface GameBoardProps extends GameBoardState {}

export default function GameBoard({ gameBoard }: GameBoardProps) {
  const [currentBoard, setCurrentBoard] = useState(gameBoard)

  const socketInitializer = async () => {
    if (!socket?.connected) {
      // socket = io(`:${PORT + 1}`, {
      //   path: '/api/socket',
      //   addTrailingSlash: false,
      //   autoConnect: false,
      // })

      // First check if we have an existing sessionId for the player,
      // so we may jump back into the game.
      const sessionId = getSessionIdCookie()
      if (sessionId) {
        socket.auth = { sessionId }
      }
      socket.connect()

      socket.on('connect', () => {
        console.log('Connected', socket.id)
        // TODO: emit player state (whose turn it is) & wait for playerTwo
      })

      // If we didn't have a sessionId set when connecting,
      // the server will create one for us.
      socket.on('session', (sessionId) => {
        console.log('session', sessionId)
        // Attach the sessionId to the next reconnection attempts.
        socket.auth = { sessionId }
        // Store it in a cookie.
        setSessionIdCookie(sessionId)
      })

      socket.on('connect_error', async (err) => {
        console.log(`Connect_error due to ${err.message}`)
        await fetch('/api/socket')
      })

      socket.on('updatedBoard', (currentBoard) => {
        console.log('New board received', currentBoard)
        setCurrentBoard(currentBoard)
      })
    }
  }

  const sendMessageHandler: ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    if (!socket) return
    const value = e.target.value
    socket.emit('createdMessage', value)
  }

  const onPieceClick = useCallback(
    (gamePieceId: GamePieceId) => {
      if (!socket || !isLegalMove(gamePieceId, currentBoard)) return
      socket.emit('setPiece', gamePieceId, (currentBoard) => {
        console.log('New board received as ACK', currentBoard)
        setCurrentBoard(currentBoard)
      })
    },
    [currentBoard],
  )

  useEffect(() => {
    socketInitializer()
  }, [])

  return (
    <>
      <GameBoardDisplay gameBoard={currentBoard} onPieceClick={onPieceClick} />
    </>
  )
}
