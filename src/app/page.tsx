'use client'

import { ChangeEventHandler, useEffect, useState } from 'react'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import './globals.css'
import { ClientToServerEvents, ServerToClientEvents } from '@/types/socketTypes'
import { PORT } from '@/const/socketConstants'

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export default function Home() {
  const [value, setValue] = useState('')

  const socketInitializer = async () => {
    socket = io(`:${PORT + 1}`, {
      path: '/api/socket',
      addTrailingSlash: false,
    })

    console.log(socket)

    socket.on('connect', () => {
      console.log('Connected', socket.id)
    })

    socket.on('connect_error', async (err) => {
      console.log(`connect_error due to ${err.message}`)
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
    <main className="flex min-h-screen flex-col gap-8 items-center justify-center p-24 bg-black text-white">
      <p>
        Socket.io Test page after falling down the rabbit hole of Next.js
        <Link
          href="https://github.com/vercel/next.js/issues/49334"
          target="_blank"
          className="text-blue-500 underline"
        >
          Issue #49334
        </Link>
        .
      </p>
      <p>
        Thanks to{' '}
        <Link
          href="https://github.com/vercel/next.js/issues/49334#issuecomment-1731391847"
          target="_blank"
          className="text-blue-500 underline"
        >
          Dipanjan Panja&apos;s comment
        </Link>{' '}
        & I got it solved.
      </p>
      <input
        value={value}
        onChange={sendMessageHandler}
        className="w-full h-12 px-2 rounded text-black placeholder:text-gray-500"
        placeholder="Enter some text and see the syncing of text in another tab"
      />
    </main>
  )
}
