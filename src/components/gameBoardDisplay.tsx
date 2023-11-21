import {
  GameBoardState,
  GamePieceId,
  GamePieceStates,
  PlayStates,
} from '@/types/gameStateTypes'
import GamePiece from '@/components/gamePiece'
import { isLegalMoveCurried } from '@/utils/gameUtils'

interface GameBoardDisplayProps extends GameBoardState {
  onPieceClick: (gamePieceId: GamePieceId) => void
  playState: PlayStates
}

export default function GameBoardDisplay({
  gameBoard,
  onPieceClick,
  playState,
}: GameBoardDisplayProps) {
  return (
    <div className="h-full flex flex-col space-y-4 border-l-8 border-r-8 px-4 py-4">
      {gameBoard.map((gameRow, rowIndex) => (
        <div className="w-full flex space-x-4" key={`gameRow-${rowIndex}`}>
          {gameRow.map((piece, pieceIndex) => (
            <GamePiece
              gamePieceState={piece}
              gamePieceId={{ row: rowIndex, col: pieceIndex }}
              onPieceClick={onPieceClick}
              isLegalMoveCurried={isLegalMoveCurried(gameBoard)}
              playState={playState}
              key={`${GamePieceStates[piece]}-${pieceIndex}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
