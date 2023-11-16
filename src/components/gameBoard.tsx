'use client'

import { useCallback, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@/types/socketTypes'
import { PORT } from '@/const/socketConstants'
import { getSessionIdCookie, setSessionIdCookie } from '@/utils/cookieUtils'
import { GameBoardState, GamePieceId, PlayStates } from '@/types/gameStateTypes'
import GameBoardDisplay from '@/components/gameBoardDisplay'
import { isLegalMove } from '@/utils/gameUtils'
import { GameStack } from '@/types/dbTypes'
import PlayerInfo from '@/components/playerInfo'
import TurnInfo from '@/components/turnInfo'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `:${PORT + 1}`,
  {
    path: '/api/socket',
    addTrailingSlash: false,
    autoConnect: false,
  },
)

interface GameBoardProps extends GameBoardState {
  initialGameState: GameStack
  playState: PlayStates
}

export default function GameBoard({
  gameBoard,
  initialGameState,
  playState,
}: GameBoardProps) {
  const [currentBoard, setCurrentBoard] = useState(gameBoard)
  const [currentGameState, setCurrentGameState] = useState(initialGameState)
  const [currentPlayState, setCurrentPlayState] = useState(playState)

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
      })

      socket.on('playerTwoJoined', ({ gameState, playState }) => {
        console.log(gameState)
        setCurrentGameState(gameState)
        setCurrentPlayState(playState)
        // TODO: emit player state (whose turn it is) & wait for playerTwo
      })

      // If we didn't have a sessionId set when connecting,
      // the server will create one for us.
      socket.on('session', ({ sessionId, gameState, playState }) => {
        console.log('session', sessionId)
        // Attach the sessionId to the next reconnection attempts.
        socket.auth = { sessionId }
        // Store it in a cookie.
        setSessionIdCookie(sessionId)
        setCurrentGameState(gameState)
        setCurrentPlayState(playState)
      })

      socket.on('connect_error', async (err) => {
        console.log(`Connect_error due to ${err.message}`)
        await fetch('/api/socket')
      })

      socket.on('updatedBoard', ({ boardState, playState }) => {
        console.log(
          'New board & play state received as ACK',
          boardState,
          playState,
        )
        setCurrentBoard(boardState)
        setCurrentPlayState(playState)
      })
    }
  }

  const onPieceClick = useCallback(
    (gamePieceId: GamePieceId) => {
      if (!socket || !isLegalMove(gamePieceId, currentBoard)) return
      socket.emit('setPiece', gamePieceId, ({ boardState, playState }) => {
        console.log(
          'New board & play state received as ACK',
          boardState,
          playState,
        )
        setCurrentBoard(boardState)
        setCurrentPlayState(playState)
      })
    },
    [currentBoard],
  )

  useEffect(() => {
    socketInitializer()
  }, [])

  return (
    <div className="flex flex-col">
      <GameBoardDisplay gameBoard={currentBoard} onPieceClick={onPieceClick} />
      <PlayerInfo gameState={currentGameState} />
      {/* TODO: set turnInfo according to currentPlayState */}
      <TurnInfo gameState={currentGameState} playState={currentPlayState} />
    </div>
  )
}
