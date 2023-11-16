export const BOARD_ROWS = 7
export const BOARD_COLS = 7

export const STEPS_TO_CHECK = [
  { x: 0, y: -1 }, // Step to the top
  { x: 0, y: 1 }, // Step to the bottom

  { x: -1, y: 0 }, // Step to the left
  { x: 1, y: 0 }, // Step to the right

  { x: -1, y: -1 }, // Step to top left
  { x: 1, y: 1 }, // Step to bottom right

  { x: 1, y: -1 }, // Step to top right
  { x: -1, y: 1 }, // Step to bottom left
]

export const COUNT_TILL_WON = 4
