import { Socket } from 'socket.io'
import { randomId } from '@/lib/socketHelpers'
import { newGame } from '@/lib/sqliteDb'

export default async function onSocketConnection(socket: Socket) {
  const sessionId = socket.handshake.auth.sessionId
  console.log(sessionId)
  if (!sessionId) {
    console.log('creating new session')
    const newSessionId = randomId()
    await newGame(newSessionId)
    socket.emit('session', newSessionId)
  }

  console.log('New connection (SERVER)', socket.id)
  const createdMessage = (msg: string) => {
    console.log('New message', msg)
    socket.broadcast.emit('newIncomingMessage', msg)
  }

  socket.on('createdMessage', createdMessage)
}
