import {
  GamePieceHoverState,
  GamePieceId,
  GamePieceStates,
  PlayStates,
} from '@/types/gameStateTypes'
import { useState } from 'react'
import { isGameOver } from '@/utils/gameUtils'

interface GamePieceProps {
  gamePieceState: GamePieceStates
  gamePieceId: GamePieceId
  onPieceClick: (gamePieceId: GamePieceId) => void
  isLegalMoveCurried: (gamePieceId: GamePieceId) => boolean
  playState: PlayStates
}

export default function GamePiece({
  gamePieceState,
  gamePieceId,
  onPieceClick,
  isLegalMoveCurried,
  playState,
}: GamePieceProps) {
  const [hoverState, setHoverState] = useState<GamePieceHoverState>(
    GamePieceHoverState.notHovered,
  )

  let pieceColor
  switch (gamePieceState) {
    case GamePieceStates.playerOne:
      pieceColor = 'border-emerald-600 bg-emerald-600'
      break
    case GamePieceStates.playerTwo:
      pieceColor = 'border-red-400 bg-red-400'
      break
    case GamePieceStates.empty:
    default:
      pieceColor = 'border-gray-600'
      break
  }

  const onPieceHover = (gamePieceId: GamePieceId) => {
    const hoverState = isLegalMoveCurried(gamePieceId)
      ? GamePieceHoverState.legal
      : GamePieceHoverState.illegal
    setHoverState(hoverState)
  }
  const onPieceOut = () => setHoverState(GamePieceHoverState.notHovered)

  const hoverClass =
    hoverState === GamePieceHoverState.notHovered || isGameOver(playState)
      ? ''
      : hoverState === GamePieceHoverState.legal
        ? 'hover:outline hover:outline-offset-2 hover:outline-2 hover:outline-emerald-400'
        : 'hover:outline hover:outline-offset-2 hover:outline-2 hover:outline-red-800'
  return (
    <div
      className={`w-8 h-8 rounded-full border-4 ${pieceColor} ${hoverClass}`}
      onClick={() => onPieceClick(gamePieceId)}
      onMouseEnter={() => onPieceHover(gamePieceId)}
      onMouseOut={() => onPieceOut()}
    />
  )
}
