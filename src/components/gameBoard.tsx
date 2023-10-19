'use client'

import { ChangeEventHandler, useEffect, useState } from 'react'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@/types/socketTypes'
import { PORT } from '@/const/socketConstants'
import { getSessionIdCookie, setSessionIdCookie } from '@/utils/cookieUtils'
import { GameBoardState } from '@/types/gameStateTypes'
import GameBoardDisplay from '@/components/gameBoardDisplay'

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

interface GameBoardProps extends GameBoardState {}

export default function GameBoard({ gameBoard }: GameBoardProps) {
  const [value, setValue] = useState('')

  const socketInitializer = async () => {
    socket = io(`:${PORT + 1}`, {
      path: '/api/socket',
      addTrailingSlash: false,
      autoConnect: false,
    })

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

    // If we didn't have a sessionId set when connecting,
    // the server will create one for us.
    socket.on('session', (sessionId) => {
      console.log('session', sessionId)
      // Attach the sessionId to the next reconnection attempts.
      socket.auth = { sessionId }
      // Store it a cookie.
      setSessionIdCookie(sessionId)
    })

    socket.on('connect_error', async (err) => {
      console.log(`Connect_error due to ${err.message}`)
      await fetch('/api/socket')
    })

    socket.on('newIncomingMessage', (msg) => {
      console.log('New message in client', msg)
      setValue(msg)
    })
  }

  const sendMessageHandler: ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    if (!socket) return
    const value = e.target.value
    socket.emit('createdMessage', value)
  }

  useEffect(() => {
    socketInitializer()
  }, [])

  return (
    <>
      {/*<p>*/}
      {/*  Socket.io Test page after falling down the rabbit hole of Next.js{' '}*/}
      {/*  <Link*/}
      {/*    href="https://github.com/vercel/next.js/issues/49334"*/}
      {/*    target="_blank"*/}
      {/*    className="text-blue-500 underline"*/}
      {/*  >*/}
      {/*    Issue #49334*/}
      {/*  </Link>*/}
      {/*  .*/}
      {/*</p>*/}
      {/*<p>*/}
      {/*  Thanks to{' '}*/}
      {/*  <Link*/}
      {/*    href="https://github.com/vercel/next.js/issues/49334#issuecomment-1731391847"*/}
      {/*    target="_blank"*/}
      {/*    className="text-blue-500 underline"*/}
      {/*  >*/}
      {/*    Dipanjan Panja&apos;s comment*/}
      {/*  </Link>{' '}*/}
      {/*  I got it solved.*/}
      {/*</p>*/}
      {/*<input*/}
      {/*  value={value}*/}
      {/*  onChange={sendMessageHandler}*/}
      {/*  className="w-full h-12 px-2 rounded text-black placeholder:text-gray-500"*/}
      {/*  placeholder="Enter some text and see the syncing of text in another tab"*/}
      {/*/>*/}
      <GameBoardDisplay gameBoard={gameBoard} />
    </>
  )
}
