# Side-Stacker Game (Stack-Roulette)

My interpretation of Monadical's Side-Stacker Game with automatic selection of
the next Players similar to Chat-Roulette.

## Technologies Used

- [Next.js](https://nextjs.org/)
- [tailwindcss](https://tailwindcss.com/)
- [socket.io](https://socket.io/)
- [sqlite](https://www.npmjs.com/package/sqlite)
- [vitest](https://vitest.dev/)

As well as eslint & prettier.

## Preamble

The Game follows the Rules set by Monadical for the "Take-Home Project -
Difficulty: Advanced (senior full-stack applicants)
[Side-Stacker Game](https://docs.monadical.com/s/monadical-study-guide#Difficulty-Advanced-senior-full-stack-applicants)".

It's a Connect-Four variant where the Players stack their Pieces on both Sides
instead of at the Bottom of a Game Board with 7 rows & 7 columns.
The Game ends when one Player has four consecutive pieces on a diagonal, column,
or row
with a Win for the Player (shown by "player 1 won" "player 2 lost" or the other
way around).
In the case that the whole Board gets filled without any Space left, the Game
ends in a Tie. The Game & Play States are synced via Socket.io and are stored
in a SQLite DB in the backend.

## Getting Started

After cloning the repository & installing the dependencies with:

```bash
npm i
# or
yarn
# or
pnpm i
# or
bun install
```

run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to
directly start a new Game
as Player One. Then either open the same address with another browser, or
open [http://127.0.0.1:3000](http://127.0.0.1:3000)
in a new Tab to automatically connect to the open Game as Player Two.

## Some Implementation Details

On load the React Server
Component [SideStackerGame](/src/components/sideStackerGame.tsx)
checks for a session ID cookie & depending on its existence either prepares an
empty `initialBoard` or tries to join or start a new Game, loading the current
Board & Play States from the `play_stack` table.  
It then passes it through to the [GameBoard](/src/components/gameBoard.tsx)
Client Component, lazy loaded
in [GameBoardWrapper](/src/components/gameBoardWrapper.tsx),
which also makes sure that the Socket.io Server
in [socket.ts](/src/pages/api/socket.ts)
is up and running.  
`GameBoard` creates a Socket.io client, handles Board & Play States as well as
providing the `onPieceClick()` callback passed through to each individual
[GamePiece](/src/components/gamePiece.tsx) displayed
via [GameBoardDisplay](/src/components/gameBoardDisplay.tsx).  
The "Magic happens" in [onSocketConnection](/src/lib/onSocketConnection.ts),
which lets Players join a Game and provided the `setPiece()` Socket.io Event
Callback that tries to set a piece, prepare a new Board & determines Winning
or Tied States. It emits the Game & Play States to the opposing player & returns
them to the current one. Here the most important functions
are `hasStackCountForWin()`
and `checkStackCountRecursive()`, both available
in [gameUtils.ts](/src/utils/gameUtils.ts)
lines 161 to 249. The latter recursively steps through the Board from the
currentPosition of the set game Piece and adds up the count of adjourning pieces
of the current player with the directions given in the constant `STEPS_TO_CHECK`
from [gameConstants.ts](/src/const/gameConstants.ts).

## Database Model

### game_stack Table

| column    | Type & Description                                                                            |
| --------- | --------------------------------------------------------------------------------------------- |
| id        | INTEGER PRIMARY KEY - Game ID used to ascertain the current Game                              |
| playerOne | VARCHAR - the session / player ID for the first Player                                        |
| playerTwo | VARCHAR - the session / player ID for the second Player                                       |
| gameState | TEXT - OPEN or FINISHED - defines if a game is still going on or was finished by a win or tie |

### play_stack Table

| column | Type & Description                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------- |
| id     | INTEGER PRIMARY KEY - auto-incrementing ID for each move                                                          |
| gameId | INT - the "foreign key" to the Game ID in the `game_stack` table                                                  |
| player | VARCHAR - the ID of the player that made the move (either `playerOne` or `playerTwo` from the `game_stack` table) |
| move   | VARCHAR - the set piece of the move in the form `x,y`                                                             |

## Possible Enhancements

- [ ] Add New Game button & don't automatically start a new Game for FINISHED
- [ ] Add Username input to be able to connect to specific Users
- [ ] Show past Games for session ID
- [ ] Switch from `sqlite` to another ORM like Prisma or Drizzle or the like
- [ ] ...

## Info about Socket.io workaround & solution

When starting this project with Next.js 13.5.6 I had problems with Socket.io
(always fell back to polling instead of socket connection).
And after falling down the rabbit hole of
Next.js [Issue #49334](https://github.com/vercel/next.js/issues/49334), I got it
solved thanks
to [Dipanjan Panja's comment](https://github.com/vercel/next.js/issues/49334#issuecomment-1731391847).
Soon after, the bug was fixed in Next.js 14.
