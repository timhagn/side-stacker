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

The Game follows the Rules set by Monadical for the "Take-Home Project - Difficulty: Advanced (senior full-stack applicants) 
[Side-Stacker Game](https://docs.monadical.com/s/monadical-study-guide#Difficulty-Advanced-senior-full-stack-applicants)".

It's a Connect-Four variant where the Players stack their Pieces on both Sides
instead of at the Bottom of a Game Board with 7 rows & 7 columns.
The Game ends when one Player has four consecutive pieces on a diagonal, column, or row
with a Win for the Player (shown by "player 1 won" "player 2 lost" or the other way around).
In the case that the whole Board gets filled without any Space left, the Game
ends in a Tie.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to directly start a new Game
as Player One. Then either open the same address with another browser, or open [http://127.0.0.1:3000](http://127.0.0.1:3000)
in a new Tab to automatically connect to the open Game as Player Two.

## Some Implementation Details



## Info about Socket.io workaround & solution

When starting this project with Next.js 13.5.6 I had problems with Socket.io
(always fell back to polling instead of socket connection).
And after falling down the rabbit hole of Next.js [Issue #49334](https://github.com/vercel/next.js/issues/49334), I got it
solved thanks to [Dipanjan Panja's comment](https://github.com/vercel/next.js/issues/49334#issuecomment-1731391847).
Soon after, the bug was fixed in Next.js 14.
