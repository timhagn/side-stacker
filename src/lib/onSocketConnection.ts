import { Socket } from 'socket.io'

import { BOARD_COLS, BOARD_ROWS } from '@/const/gameConstants'
import {
  getMovesInGame,
  joinGameOrNewGame,
  updateWinningOrTiedGame,
  writeNextMove,
} from '@/lib/sqliteDb'
import { GameMove, GameState, PlayStack } from '@/types/dbTypes'
import {
  GamePieceBoardState,
  GamePieceId,
  PlayStates,
} from '@/types/gameStateTypes'
import {
  buildBoardState,
  getCurrentPlayState,
  getInitialGameState,
  hasStackCountForWin,
  isGameOver,
} from '@/utils/gameUtils'
import {
  getWinningPlayerState,
  isPlayerTwo,
  randomId,
} from '@/utils/socketHelpers'

/**
 * Socket Connection Listener.
 *
 * @param {Socket}  socket   The connected socket.
 * @returns {Promise<void>}
 */
export default async function onSocketConnection(
  socket: Socket,
): Promise<void> {
  const sessionId = socket.data.sessionId

  console.log('Session Id (SERVER)', sessionId)
  // If we don't have a session ID we create a new one & join or start a Game.
  if (!sessionId) {
    console.log('creating new session')
    const newSessionId = randomId()
    const result = await joinGameOrNewGame(newSessionId)
    socket.data.sessionId = newSessionId
    socket.data.gameState = result
    const moves = await getMovesInGame(result!.id)
    const playState = getInitialGameState(socket.data.gameState, moves)

    socket.emit('session', {
      sessionId: newSessionId,
      gameState: socket.data.gameState,
      playState,
    })
  }

  // If we have a Game ID, join the associated Game.
  const gameId = socket.data.gameState?.id
  if (gameId) {
    socket.join(`game-${gameId}`)
  }

  // When a second player joins a Game, inform the first one and update their
  // Game State to sync both players.
  if (isPlayerTwo(socket.data.sessionId, socket.data.gameState)) {
    console.log('Player two joined')
    const moves = await getMovesInGame(socket.data.gameState)
    const playState = getInitialGameState(socket.data.gameState, moves)
    socket
      .to(`game-${gameId}`)
      .emit('playerTwoJoined', { gameState: socket.data.gameState, playState })
  }

  console.log('New connection (SERVER)', socket.id)

  /**
   * Callback function that tries to set a piece, prepare a new Board
   * & determines Winning or Tied States. Emits the Game & Play States to the
   * other player & returns them to the current one.
   *
   * @param {GamePieceId}  gamePieceId  The Piece to set.
   * @param callback                    Callback that returns the Board & Play States to the current player.
   */
  const setPiece = async (
    gamePieceId: GamePieceId,
    callback: ({
      boardState,
      playState,
    }: {
      boardState: GamePieceBoardState
      playState: PlayStates
    }) => void,
  ) => {
    const player = socket.data.sessionId
    const gameId = socket.data.gameState?.id
    const currentGameState = socket.data.gameState.gameState
    // Do we have an OPEN Game and it's ID?
    if (gameId && gameId !== -1 && currentGameState === GameState.OPEN) {
      // Load all Moves for a given Game ID and get the last one.
      const moves = await getMovesInGame(gameId)
      const lastMove = moves?.at(-1)
      // Do we have a last Move & has it been the opposing player's one?
      if (!lastMove || lastMove?.player !== player) {
        // Generate the next Move and write it to play_stack.
        const move = `${gamePieceId.row},${gamePieceId.col}`
        const nextMove: GameMove = { gameId, player, move }
        await writeNextMove(nextMove)
        // Generate the next Play Stack.
        const nextMoveId = moves?.length ? moves.length + 1 : 1
        const newMoves: PlayStack[] = [
          ...((moves as PlayStack[]) || []),
          { id: nextMoveId, ...nextMove },
        ]
        // Generate the next Board State.
        const boardState = buildBoardState(newMoves, socket.data.gameState)
        let playState
        // Do we have a tie?
        if (newMoves.length >= BOARD_ROWS * BOARD_COLS) {
          playState = PlayStates.playersTied
        } else {
          // Check for winning states.
          const hasWon = hasStackCountForWin(
            player,
            gamePieceId,
            boardState,
            socket.data.gameState,
          )
          console.log('Do we have a winner?', hasWon)
          // Determine next Play State.
          playState = hasWon
            ? getWinningPlayerState(player, socket.data.gameState)
            : getCurrentPlayState(player, socket.data.gameState)
        }
        // When we have a winning or tied State update game_stack to FINISHED.
        if (isGameOver(playState)) {
          await updateWinningOrTiedGame(gameId)
          socket.data.gameState.gameState = GameState.FINISHED
        }
        // Now emit and return the next Board & Play States.
        socket
          .to(`game-${gameId}`)
          .emit('updatedBoard', { boardState, playState })
        callback({ boardState, playState })
      }
    }
  }

  socket.on('setPiece', setPiece)
}
