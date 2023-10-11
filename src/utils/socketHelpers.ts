import crypto from 'crypto'
export const randomId = () => crypto.randomBytes(8).toString('hex')
