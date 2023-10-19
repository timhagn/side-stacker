import { GamePieceId, GamePieceState } from '@/types/gameStateTypes'

interface GamePieceProps {
  gamePieceState: GamePieceState
  gamePieceId: GamePieceId
  onPieceClick: (gamePieceId: GamePieceId) => void
  // todo: onClick & onHover
}

export default function GamePiece({
  gamePieceState,
  gamePieceId,
  onPieceClick,
}: GamePieceProps) {
  let pieceColor
  switch (gamePieceState) {
    case GamePieceState.playerOne:
      pieceColor = 'border-emerald-600 bg-emerald-600'
      break
    case GamePieceState.playerTwo:
      pieceColor = 'border-red-950 bg-red-950'
      break
    case GamePieceState.empty:
    default:
      pieceColor = 'border-gray-600'
      break
  }
  return (
    <div
      className={`w-8 h-8 rounded-full border-4 ${pieceColor}`}
      onClick={() => onPieceClick(gamePieceId)}
    />
  )
}
