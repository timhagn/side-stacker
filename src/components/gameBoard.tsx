'use client'

import { useCallback, useEffect, useState } from 'react'
import { Socket, io } from 'socket.io-client'

import GameBoardDisplay from '@/components/gameBoardDisplay'
import PlayerInfo from '@/components/playerInfo'
import TurnInfo from '@/components/turnInfo'
import { PORT } from '@/const/socketConstants'
import { GameBoardProps, GamePieceId } from '@/types/gameStateTypes'
import { ClientToServerEvents, ServerToClientEvents } from '@/types/socketTypes'
import { getSessionIdCookie, setSessionIdCookie } from '@/utils/cookieUtils'
import { isGameOver, isLegalMove } from '@/utils/gameUtils'

// Set up a socket client.
let socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `:${PORT + 1}`,
  {
    path: '/api/socket',
    addTrailingSlash: false,
    autoConnect: false,
  },
)

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
        // Set the current Game & Play States returned by the callback.
        setCurrentGameState(gameState)
        setCurrentPlayState(playState)
      })

      // If we didn't have a sessionId set when connecting,
      // the server will create one for us.
      socket.on('session', ({ sessionId, gameState, playState }) => {
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
        // The other player made a move. Update the Board & Play State.
        setCurrentBoard(boardState)
        setCurrentPlayState(playState)
      })
    }
  }

  const onPieceClick = useCallback(
    (gamePieceId: GamePieceId) => {
      // Early return if we don't have a socket connection, the move isn't
      // allowed or the game is already over.
      if (
        !socket ||
        !isLegalMove(gamePieceId, currentBoard) ||
        isGameOver(currentPlayState)
      ) {
        return
      }
      // Emit a setPiece event & update the Board & Play State with the data
      // returned by the callback.
      socket.emit('setPiece', gamePieceId, ({ boardState, playState }) => {
        setCurrentBoard(boardState)
        setCurrentPlayState(playState)
      })
    },
    [currentBoard, currentPlayState],
  )

  useEffect(() => {
    socketInitializer()
  }, [])

  return (
    <div className="flex flex-col">
      <GameBoardDisplay
        gameBoard={currentBoard}
        onPieceClick={onPieceClick}
        playState={currentPlayState}
      />
      <PlayerInfo gameState={currentGameState} />
      <TurnInfo gameState={currentGameState} playState={currentPlayState} />
    </div>
  )
}
