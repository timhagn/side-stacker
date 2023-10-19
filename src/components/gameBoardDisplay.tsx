import { GameBoardState, GamePieceState } from '@/types/gameStateTypes'
import GamePiece from '@/components/gamePiece'

interface GameBoardDisplayProps extends GameBoardState {}

export default function GameBoardDisplay({ gameBoard }: GameBoardDisplayProps) {
  return (
    <div className="h-full flex flex-col space-y-4 border-l-8 border-r-8 px-4 py-4">
      {gameBoard.map((gameRow, index) => (
        <div className="w-full flex space-x-4" key={`gameRow-${index}`}>
          {gameRow.map((piece, pieceIndex) => (
            <GamePiece
              gamePieceState={piece}
              key={`${GamePieceState[piece]}-${pieceIndex}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
