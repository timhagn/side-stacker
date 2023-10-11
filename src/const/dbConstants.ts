export const DB_NAME = 'sideStacker'

export const GAME_TABLE = 'game_stack'

export const CREATE_GAME_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS ${GAME_TABLE} (
    id INT PRIMARY KEY, 
    playerOne VARCHAR,
    playerTwo VARCHAR, 
    gameState TEXT CHECK( gameState IN ('OPEN','FINISHED') ) NOT NULL DEFAULT 'OPEN'
  )
`

export const PLAY_TABLE = 'play_stack'

export const CREATE_PLAY_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS ${PLAY_TABLE} (
    id INT PRIMARY KEY, 
    gameId INT, 
    player VARCHAR,
    move VARCHAR
  )
`
